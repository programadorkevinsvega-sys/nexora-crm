#!/usr/bin/env bash
# ==============================================================================
# Nexora CRM — Script de Despliegue Automatizado a Servidor Remoto (VM)
# IP: 158.23.60.68 | Usuario: ubuntu | Llave: ./general.pem
# ==============================================================================

set -e

# Configuración del Servidor
VM_USER="ubuntu"
VM_HOST="158.23.60.68"
KEY_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/general.pem"
REMOTE_DIR="${REMOTE_DIR:-/home/ubuntu/crm-service}"
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/"

# Opciones de ejecución: --sync-only (solo transferir), por defecto ejecuta install + build + reload
BUILD_ON_REMOTE=true
if [[ "$1" == "--sync-only" ]]; then
  BUILD_ON_REMOTE=false
fi

# Colores para la consola
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}🚀 Nexora CRM — Despliegue Automatizado a Producción${NC}"
echo -e "${BLUE}======================================================${NC}"
echo -e "📡 Destino:      ${YELLOW}${VM_USER}@${VM_HOST}:${REMOTE_DIR}${NC}"
echo -e "🔑 Llave SSH:     ${YELLOW}${KEY_PATH}${NC}"
echo -e "📁 Origen Local:  ${YELLOW}${LOCAL_DIR}${NC}"
echo ""

# 1. Validar archivo de clave privada
if [ ! -f "$KEY_PATH" ]; then
  echo -e "${RED}❌ Error: No se encontró la clave privada 'general.pem' en la raíz.${NC}"
  exit 1
fi

chmod 400 "$KEY_PATH"
echo -e "🔒 Permisos de ${YELLOW}general.pem${NC} verificados (400)."

# 2. Verificar conectividad SSH con la VM
echo -e "🔍 Probando conexión SSH con ${YELLOW}${VM_HOST}${NC}..."
SSH_OPTS="-i ${KEY_PATH} -o StrictHostKeyChecking=no -o ConnectTimeout=10"

if ssh $SSH_OPTS "${VM_USER}@${VM_HOST}" "echo '✅ SSH OK'" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Conectado exitosamente a la VM.${NC}"
else
  echo -e "${RED}❌ Error al conectar por SSH a ${VM_USER}@${VM_HOST}.${NC}"
  echo -e "${YELLOW}Verifica que la IP esté activa y que el puerto 22 esté abierto.${NC}"
  exit 1
fi

# 3. Crear directorio remoto
ssh $SSH_OPTS "${VM_USER}@${VM_HOST}" "mkdir -p ${REMOTE_DIR}"

# 4. Sincronizar archivos usando rsync
echo -e "📦 Sincronizando código fuente con rsync..."
rsync -avz --progress --delete \
  -e "ssh ${SSH_OPTS}" \
  --exclude="node_modules" \
  --exclude=".next" \
  --exclude="dist" \
  --exclude=".turbo" \
  --exclude=".git" \
  --exclude="coverage" \
  --exclude="*.log" \
  --exclude="*.tsbuildinfo" \
  --exclude=".env.local" \
  --exclude=".env.production" \
  --exclude="general.pem" \
  "${LOCAL_DIR}" "${VM_USER}@${VM_HOST}:${REMOTE_DIR}/"

echo -e "${GREEN}✅ Archivos sincronizados en la VM.${NC}"

# 5. Ejecutar instalación, compilación y reinicio en la VM
if [ "$BUILD_ON_REMOTE" = true ]; then
  echo ""
  echo -e "${CYAN}⚙️  Ejecutando pnpm install, pnpm build y recarga de PM2 en la VM...${NC}"

  ssh $SSH_OPTS "${VM_USER}@${VM_HOST}" "bash -l -c '
    set -e
    cd ${REMOTE_DIR}

    # Cargar rutas de volta / pnpm / nvm / node
    export VOLTA_HOME=\"\$HOME/.volta\"
    export PNPM_HOME=\"\$HOME/.local/share/pnpm\"
    export PATH=\"\$VOLTA_HOME/bin:\$PNPM_HOME:\$PATH\"
    [ -s \"\$HOME/.nvm/nvm.sh\" ] && . \"\$HOME/.nvm/nvm.sh\"

    echo \"📥 1. Instalando dependencias con pnpm...\"
    pnpm install

    echo \"🔨 2. Compilando paquetes y servicios (Turborepo + Next.js)...\"
    pnpm build
    if [ -d \"frontend\" ]; then
      echo \"🎨 Compilando frontend Next.js...\"
      cd frontend && pnpm build && cd ..
    fi

    echo \"🔄 3. Recargando procesos con PM2...\"
    if command -v pm2 &> /dev/null; then
      pm2 startOrReload ecosystem.config.js --update-env || pm2 start ecosystem.config.js
      pm2 save
      pm2 status
    else
      echo \"⚠️  PM2 no está instalado globalmente en la VM. Para instalarlo: npm install -g pm2\"
    fi
  '"
fi

echo ""
echo -e "${GREEN}======================================================${NC}"
echo -e "${GREEN}🎉 ¡Despliegue completado con éxito en la VM!${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "🌍 Web App:       ${YELLOW}http://${VM_HOST}${NC}"
echo -e "📚 API Docs BFF:  ${YELLOW}http://${VM_HOST}/api/docs${NC}"
echo ""
