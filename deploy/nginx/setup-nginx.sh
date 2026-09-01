#!/usr/bin/env bash
# ==============================================================================
# Script de Instalación y Activación de Nginx en la VM
# ==============================================================================

set -e

echo "🔧 Instalando y configurando Nginx para Nexora CRM..."

# 1. Instalar Nginx si no está instalado
if ! command -v nginx &> /dev/null; then
    sudo apt-get update -y
    sudo apt-get install -y nginx
fi

# 2. Copiar configuración de Nexora CRM
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
sudo cp "${SCRIPT_DIR}/nexora-crm.conf" /etc/nginx/sites-available/nexora-crm.conf

# 3. Habilitar el sitio eliminando default si existe
sudo ln -sf /etc/nginx/sites-available/nexora-crm.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 4. Validar sintaxis de configuración
echo "🔍 Validando sintaxis de Nginx..."
sudo nginx -t

# 5. Reiniciar servicio
echo "🔄 Reiniciando servicio Nginx..."
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "✅ Nginx configurado y activo con reglas de seguridad OWASP para Nexora CRM."
