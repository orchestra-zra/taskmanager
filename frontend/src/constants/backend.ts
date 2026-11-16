export const BACKEND_URL_LOCAL = import.meta.env.VITE_BACKEND_URL_LOCAL;
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN;
export const CHAT_ID = import.meta.env.VITE_CHAT_ID;
export const TELEGRAM_WEB_APP_URL = import.meta.env.VITE_TELEGRAM_WEB_APP_URL || "https://t.me";
export const TELEGRAM_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;