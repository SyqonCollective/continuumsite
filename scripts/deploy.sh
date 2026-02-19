#!/usr/bin/env bash
set -euo pipefail

if [[ -f .env.deploy ]]; then
  # shellcheck disable=SC1091
  source .env.deploy
fi

: "${VPS_HOST:?Missing VPS_HOST}"
: "${VPS_USER:?Missing VPS_USER}"
: "${VPS_TARGET_DIR:?Missing VPS_TARGET_DIR}"

SSH_PORT="${VPS_PORT:-22}"

echo "Deploy verso ${VPS_USER}@${VPS_HOST}:${VPS_TARGET_DIR}"

ssh -p "${SSH_PORT}" "${VPS_USER}@${VPS_HOST}" "mkdir -p '${VPS_TARGET_DIR}'"

rsync -az --delete \
  --exclude '.git' \
  --exclude '.github' \
  --exclude '.DS_Store' \
  --exclude '.env.deploy' \
  --exclude 'node_modules' \
  --exclude '.wasp' \
  --exclude 'wasp-open-saas' \
  -e "ssh -p ${SSH_PORT}" \
  ./ "${VPS_USER}@${VPS_HOST}:${VPS_TARGET_DIR}/"

echo "Deploy completato."
