#!/usr/bin/env bash
# ==============================================================================
# Nexora CRM — Sincronización local del .env a la VM
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VM_USER="${VM_USER:-ubuntu}"
VM_HOST="${VM_HOST:-100.64.183.123}"
REMOTE_DIR="${REMOTE_DIR:-/home/ubuntu/crm-service}"
ENV_FILE="${ENV_FILE:-${SCRIPT_DIR}/.env}"
KEY_PATH="${KEY_PATH:-${SCRIPT_DIR}/general.pem}"

if [ ! -f "$KEY_PATH" ]; then
  echo "Error: no se encontró la clave SSH en $KEY_PATH" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: no se encontró el archivo de entorno en $ENV_FILE" >&2
  exit 1
fi

chmod 400 "$KEY_PATH"

SSH_ARGS=(
  -i "$KEY_PATH"
  -o BatchMode=yes
  -o ConnectTimeout=10
  -o StrictHostKeyChecking=yes
)
REMOTE="${VM_USER}@${VM_HOST}"
REMOTE_TMP="${REMOTE_DIR}/.env.upload.$$"

ssh "${SSH_ARGS[@]}" "$REMOTE" \
  "mkdir -p '$REMOTE_DIR' && umask 077 && cat > '$REMOTE_TMP' && mv -f '$REMOTE_TMP' '$REMOTE_DIR/.env' && chmod 600 '$REMOTE_DIR/.env'" \
  < "$ENV_FILE"

echo "Archivo .env transferido a ${REMOTE}:${REMOTE_DIR}/.env con permisos 600."
