// TEMP dev without Docker: run frontend(:3001) + backend(:8000) behind
// cloudflared quick tunnels so the Telegram Mini App gets real public HTTPS URLs.
//
//   node scripts/dev-https.mjs
//
// URLs change on every run. The script prints them and auto-writes
// TELEGRAM_WEB_APP_URL into backend/.env. Put a fresh link into your browser:
//   https://t.me/<BOT_USERNAME>?startapp   (or set the menu button in BotFather)

import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(root, 'backend', '.env');

function findCloudflared() {
  const candidates = [
    path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Links', 'cloudflared.exe'),
    path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Packages', 'Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe', 'cloudflared.exe'),
  ];
  const found = candidates.find((c) => existsSync(c));
  if (found) return found;
  const onPath = (process.env.PATH ?? '').split(path.delimiter)
    .map((dir) => path.join(dir, 'cloudflared.exe'))
    .find((c) => existsSync(c));
  if (onPath) return onPath;
  console.error('cloudflared not found. Install: winget install Cloudflare.cloudflared');
  process.exit(1);
}

function startTunnel(binary, localUrl) {
  const proc = spawn(binary, ['tunnel', '--url', localUrl, '--no-autoupdate'], {
    stdio: ['ignore', 'ignore', 'pipe'],
    windowsHide: true,
  });
  const url = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`tunnel URL timeout for ${localUrl} (is cloudflared installed? winget install Cloudflare.cloudflared)`)), 40000);
    let buf = '';
    proc.stderr.on('data', (d) => {
      buf += d.toString();
      const m = buf.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
      if (m) { clearTimeout(timer); resolve(m[0]); }
    });
    proc.on('exit', (code) => { clearTimeout(timer); reject(new Error(`cloudflared exited (${code}) for ${localUrl}`)); });
  });
  return { proc, url };
}

// BotFather truncates Web App URLs longer than 64 chars, and quick-tunnel
// hostnames are random — reroll until the URL fits (https:// + name + .trycloudflare.com).
async function startTunnelFitting(binary, localUrl, maxLen = 64, attempts = 8) {
  let last = null;
  for (let i = 0; i < attempts; i++) {
    const t = startTunnel(binary, localUrl);
    try {
      const url = await t.url;
      if (url.length <= maxLen) return { proc: t.proc, url };
      console.log(`  tunnel ${url} is ${url.length} chars (> ${maxLen}, BotFather limit) — rerolling...`);
      t.proc.kill();
      last = { proc: t.proc, url };
    } catch (e) {
      t.proc.kill();
      if (i === attempts - 1) throw e;
    }
  }
  console.log(`  gave up rerolling for ${localUrl}; using last URL`);
  const t = startTunnel(binary, localUrl);
  return { proc: t.proc, url: await t.url };
}

const cloudflared = findCloudflared();
console.log('Starting cloudflared quick tunnels...');
const fe = await startTunnelFitting(cloudflared, 'http://localhost:3001');
const be = await startTunnelFitting(cloudflared, 'http://localhost:8000');

const feUrl = fe.url;
const beUrl = be.url;

console.log(`\n  FRONTEND (mini app): ${feUrl}`);
console.log(`  BACKEND  (API):      ${beUrl}\n`);

// Buttons in bot messages use t.me links so Telegram opens them as a Mini App
// (plain url buttons with the raw tunnel URL would open in the external browser
// and ?startapp deep links only work on t.me links). BotFather's Web App URL is
// the only place that must point at the fresh tunnel after each restart.
let env = readFileSync(envPath, 'utf8');
const botNameForEnv = (env.match(/^BOT_NAME=(.*)$/m) ?? [])[1]?.trim();
env = env.replace(
  /^TELEGRAM_WEB_APP_URL=.*$/m,
  botNameForEnv ? `TELEGRAM_WEB_APP_URL="https://t.me/${botNameForEnv}"` : `TELEGRAM_WEB_APP_URL="${feUrl}"`
);
writeFileSync(envPath, env);

// Landing-page "Начать" button (frontend) -> open the mini app via the bot
const feEnvPath = path.join(root, 'frontend', '.env');
const botForLink = (env.match(/^BOT_NAME=(.*)$/m) ?? [])[1]?.trim();
let feEnv = readFileSync(feEnvPath, 'utf8');
const botLink = botForLink ? `https://t.me/${botForLink}?startapp` : feUrl;
const feLine = `VITE_TELEGRAM_WEB_APP_URL="${botLink}"`;
feEnv = /^VITE_(TELEGRAM_)?WEB_APP_URL=.*$/m.test(feEnv)
  ? feEnv.replace(/^VITE_(TELEGRAM_)?WEB_APP_URL=.*$/m, feLine)
  : feEnv.trimEnd() + '\n' + feLine + '\n';
writeFileSync(feEnvPath, feEnv);

// Open the app inside Telegram
const botName = (env.match(/^BOT_NAME=(.*)$/m) ?? [])[1]?.trim();
if (botName) console.log(`  Open in Telegram: https://t.me/${botName}?startapp  (then the app link above)\n`);

// Auto-point the bot's menu button (☰ in private chat) at the fresh tunnel URL,
// so you never have to re-type it into BotFather after every restart.
const botToken = (env.match(/^TELEGRAM_BOT_TOKEN=(.*)$/m) ?? [])[1]?.trim();
if (botToken && !botToken.includes('EXAMPLEBOTTOKEN')) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ menu_button: { type: 'web_app', text: 'Open PlanJet', web_app: { url: feUrl } } }),
    });
    const j = await r.json();
    console.log(j.ok ? '  Bot menu button -> mini app: updated ✅\n' : `  setChatMenuButton failed: ${JSON.stringify(j)}\n`);
  } catch (e) {
    console.log(`  setChatMenuButton error: ${e.message}\n`);
  }
}

// Real initData flow inside Telegram; backend still skips hash validation via ENABLE_TEST_MODE=true
const dev = spawn('npm', ['run', 'dev'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  windowsHide: true,
  env: { ...process.env, VITE_TEST_MODE: 'false', VITE_BACKEND_URL: beUrl },
});

const shutdown = () => { dev.kill('SIGINT'); fe.proc.kill(); be.proc.kill(); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
dev.on('exit', (code) => { shutdown(); process.exit(code ?? 0); });
