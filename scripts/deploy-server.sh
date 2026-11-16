#!/usr/bin/env bash
# Safe, atomic GitOps deployment script for TaskManager / PlanJet (Frontend + Backend + Postgres).
#
# Modes:
#   scripts/deploy-server.sh --poll   # Quietly check origin/<branch>; deploy only if new commit exists
#   scripts/deploy-server.sh          # Fetch and deploy if origin/<branch> is ahead of HEAD
#   scripts/deploy-server.sh --force  # Rebuild and redeploy current origin/<branch> unconditionally

{
set -Eeuo pipefail

REPO_DIR="${TASKMANAGER_REPO_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
BRANCH="${TASKMANAGER_DEPLOY_BRANCH:-backend}"
LOCK_FILE="${TASKMANAGER_DEPLOY_LOCK:-/tmp/taskmanager-autodeploy.lock}"
BACKUP_DIR="${TASKMANAGER_BACKUP_DIR:-$HOME/taskmanager_backups}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

detect_docker() {
  if docker info >/dev/null 2>&1; then
    DOCKER=(docker)
  elif sudo -n docker info >/dev/null 2>&1; then
    DOCKER=(sudo docker)
  else
    log "ERROR: Cannot talk to Docker daemon (neither direct nor passwordless sudo)."
    exit 1
  fi
}

compose() {
  "${DOCKER[@]}" compose -f docker-compose.yml -f docker-compose.prod.yml "$@"
}

wait_for_healthy() {
  local url_root="http://127.0.0.1:${FRONTEND_PORT}/"
  local url_api="http://127.0.0.1:${FRONTEND_PORT}/api/public/1.1chat.png"
  local attempt=1
  local max_attempts=45

  while [ "${attempt}" -le "${max_attempts}" ]; do
    if curl -fsS --max-time 4 "${url_root}" >/dev/null 2>&1 && curl -fsS --max-time 4 -o /dev/null "${url_api}" 2>/dev/null; then
      return 0
    fi
    sleep 2
    attempt=$((attempt + 1))
  done
  return 1
}

backup_db_if_migrations_changed() {
  local from_sha="$1"
  local to_sha="$2"

  if [ "${from_sha}" = "${to_sha}" ]; then
    return 0
  fi

  if ! git diff --name-only "${from_sha}..${to_sha}" | grep -q '^backend/prisma/migrations/'; then
    return 0
  fi

  mkdir -p "${BACKUP_DIR}"
  local ts
  ts="$(date -u +%Y%m%dT%H%M%SZ)"
  local dump_file="${BACKUP_DIR}/pre-deploy-${ts}-${from_sha:0:7}.dump"

  if "${DOCKER[@]}" ps --format '{{.Names}}' | grep -q '^planjet-postgres$'; then
    log "Prisma migration changes detected; backing up PostgreSQL to ${dump_file} ..."
    "${DOCKER[@]}" exec planjet-postgres pg_dump -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-planjet}" -Fc > "${dump_file}"
    ls -1t "${BACKUP_DIR}"/pre-deploy-*.dump 2>/dev/null | tail -n +11 | xargs -r rm -f
  fi
}

rollback() {
  local rollback_sha="$1"
  log "ERROR: Deployment failed verification! Rolling back to ${rollback_sha:0:7} ..."
  git reset --hard "${rollback_sha}"
  compose build
  compose up -d --remove-orphans
  log "Rollback to ${rollback_sha:0:7} complete."
}

main() {
  local mode="${1:-deploy}"
  cd "${REPO_DIR}"
  export GIT_TERMINAL_PROMPT=0

  if [ -f "${REPO_DIR}/.env" ]; then
    set -a
    # shellcheck disable=SC1091
    . "${REPO_DIR}/.env"
    set +a
  fi
  BRANCH="${TASKMANAGER_DEPLOY_BRANCH:-$BRANCH}"

  exec 9>"${LOCK_FILE}"
  if [ "${mode}" = "--poll" ]; then
    if ! flock -n 9; then
      exit 0
    fi
  else
    if ! flock -w 300 9; then
      log "ERROR: Timed out waiting for deploy lock ${LOCK_FILE}"
      exit 1
    fi
  fi

  local local_sha
  local_sha="$(git rev-parse HEAD)"

  if [ "${mode}" = "--poll" ]; then
    local ls_sha
    ls_sha="$(git ls-remote --heads origin "refs/heads/${BRANCH}" 2>/dev/null | awk '{print $1}' || true)"
    if [ -n "${ls_sha}" ]; then
      if [ "${ls_sha}" = "${local_sha}" ]; then
        exit 0
      fi
      log "New commit detected on origin/${BRANCH}: ${local_sha:0:7} -> ${ls_sha:0:7}"
    else
      local ref_sha
      ref_sha="$(git rev-parse "origin/${BRANCH}" 2>/dev/null || echo "${local_sha}")"
      if [ "${ref_sha}" = "${local_sha}" ]; then
        exit 0
      fi
      log "New pushed ref detected on origin/${BRANCH}: ${local_sha:0:7} -> ${ref_sha:0:7}"
    fi
  fi

  git fetch --prune origin "${BRANCH}"
  local target_sha
  target_sha="$(git rev-parse "origin/${BRANCH}")"

  local force_mode="false"
  if [ "${mode}" = "--force" ]; then
    force_mode="true"
  fi

  if [ "${target_sha}" = "${local_sha}" ] && [ "${force_mode}" != "true" ]; then
    log "Already up to date at ${local_sha:0:7}."
    exit 0
  fi

  detect_docker
  backup_db_if_migrations_changed "${local_sha}" "${target_sha}"

  log "Checking out ${target_sha:0:7} ..."
  git reset --hard "${target_sha}"

  log "Building production images for commit #${target_sha:0:7} (live containers stay untouched) ..."
  if ! compose build; then
    log "ERROR: Image build failed for #${target_sha:0:7}. Restoring git HEAD to ${local_sha:0:7}; live service was NOT interrupted."
    git reset --hard "${local_sha}"
    exit 1
  fi

  log "Applying stack update for #${target_sha:0:7} ..."
  if ! compose up -d --remove-orphans; then
    if [ "${local_sha}" != "${target_sha}" ]; then
      rollback "${local_sha}"
    fi
    exit 1
  fi

  log "Waiting for end-to-end readiness on 127.0.0.1:${FRONTEND_PORT} ..."
  if ! wait_for_healthy; then
    compose logs --tail=60 backend frontend || true
    if [ "${local_sha}" != "${target_sha}" ]; then
      rollback "${local_sha}"
    fi
    exit 1
  fi

  "${DOCKER[@]}" image prune -f >/dev/null 2>&1 || true
  log "SUCCESS: Commit #${target_sha:0:7} is live and healthy on 127.0.0.1:${FRONTEND_PORT}."
}

main "$@"
exit 0
}
