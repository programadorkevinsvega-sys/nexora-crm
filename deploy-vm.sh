#!/usr/bin/env bash
# ==============================================================================
# Nexora CRM — Script de Despliegue y Sincronización a Servidor Remoto (VM)
# IP: 158.23.60.68 | Usuario: ubuntu | Llave: ./general.pem
# ==============================================================================

set -e

# Configuración del Servidor
VM_USER="ubuntu"
VM_HOST="158.23.60.68"
KEY_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/general.pem"
REMOTE_DIR="${REMOTE_DIR:-/home/ubuntu/crm-service}"
LOCAL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/"

# Colores para la salida en consola
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}🚀 Iniciando Despliegue de Nexora CRM a la VM${NC}"
echo -e "${BLUE}======================================================${NC}"
echo -e "📡 Destino:      ${YELLOW}${VM_USER}@${VM_HOST}:${REMOTE_DIR}${NC}"
echo -e "🔑 Llave SSH:     ${YELLOW}${KEY_PATH}${NC}"
echo -e "📁 Origen Local:  ${YELLOW}${LOCAL_DIR}${NC}"
echo ""

# 1. Validar que la llave exista y tenga permisos seguros (400)
if [ ! -f "$KEY_PATH" ]; then
  echo -e "${RED}❌ Error: No se encontró el archivo de clave privada 'general.pem' en la raíz.${NC}"
  exit 1
fi

chmod 400 "$KEY_PATH"
echo -e "🔒 Permisos de ${YELLOW}general.pem${NC} ajustados a 400 (seguro)."

# 2. Verificar conectividad SSH con la VM
echo -e "🔍 Probando conexión SSH con ${YELLOW}${VM_HOST}${NC}..."
SSH_OPTS="-i ${KEY_PATH} -o StrictHostKeyChecking=no -o ConnectTimeout=10"

if ssh $SSH_OPTS "${VM_USER}@${VM_HOST}" "echo '✅ Conexión SSH exitosa.'" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Conectado exitosamente a la VM.${NC}"
else
  echo -e "${RED}❌ Error al conectar por SSH a ${VM_USER}@${VM_HOST}.${NC}"
  echo -e "${YELLOW}Verifica que la IP esté activa y que el puerto 22 esté abierto en el Firewall/Security Group.${NC}"
  exit 1
fi

# 3. Crear directorio remoto si no existe
echo -e "📂 Asegurando que el directorio remoto ${YELLOW}${REMOTE_DIR}${NC} exista..."
ssh $SSH_OPTS "${VM_USER}@${VM_HOST}" "mkdir -p ${REMOTE_DIR}"

# 4. Sincronizar archivos usando rsync
echo -e "📦 Sincronizando código fuente con rsync..."
echo -e "${BLUE}ℹ️  Excluyendo node_modules, .next, dist, .turbo, .git, logs, coverage...${NC}"

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

echo ""
echo -e "${GREEN}======================================================${NC}"
echo -e "${GREEN}✨ ¡Código sincronizado exitosamente en la VM!${NC}"
echo -e "${GREEN}======================================================${NC}"
echo ""
echo -e "Para ingresar a la máquina virtual, ejecuta:"
echo -e "${YELLOW}ssh -i general.pem ${VM_USER}@${VM_HOST}${NC}"
echo ""
echo -e "Comandos recomendados dentro de la VM (${REMOTE_DIR}):"
echo -e "  1. ${YELLOW}cd ${REMOTE_DIR}${NC}"
echo -e "  2. ${YELLOW}pnpm install${NC}"
echo -e "  3. ${YELLOW}pnpm build${NC}"
echo -e "  4. ${YELLOW}pnpm dev${NC}  o iniciar con Docker / PM2"
echo ""
