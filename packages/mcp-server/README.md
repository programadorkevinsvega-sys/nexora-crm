# Nexora CRM — Model Context Protocol (MCP) Server 🤖

El servidor **Nexora CRM MCP** permite a agentes de Inteligencia Artificial y Modelos de Lenguaje (como **Claude Desktop**, **Cursor**, **Antigravity** o agentes autónomos) interactuar de forma nativa con toda la plataforma Nexora CRM a través de lenguaje natural.

---

## ⚡ Capacidades del Servidor MCP

### 🛠️ Herramientas (Tools)
* **Contactos & 360:** `nexora_list_contacts`, `nexora_get_contact`, `nexora_create_contact`, `nexora_get_customer_360`
* **Deals & Ventas:** `nexora_list_deals`, `nexora_get_deal`, `nexora_create_deal`, `nexora_move_deal_stage`, `nexora_win_deal`, `nexora_lose_deal`
* **Interacciones:** `nexora_create_note`, `nexora_create_task`, `nexora_log_call`
* **Helpdesk & Soporte:** `nexora_list_tickets`, `nexora_get_ticket`, `nexora_create_ticket`, `nexora_reply_ticket`
* **CPQ & Cotizaciones:** `nexora_list_products`, `nexora_get_quote`, `nexora_create_quote`, `nexora_accept_quote`
* **IA Predictiva & Radar:** `nexora_predict_deal_win`, `nexora_generate_message_draft`, `nexora_get_contact_summary`, `nexora_predict_churn_risk`
* **Base de Conocimiento:** `nexora_search_knowledge_base`, `nexora_get_kb_article`

### 📦 Recursos (Resources)
* `nexora://contacts/recent` — Lista en tiempo real de contactos recientes
* `nexora://deals/pipeline` — Oportunidades activas en el pipeline de ventas
* `nexora://kb/articles` — Índice de artículos de ayuda publicados

### 💬 Flujos Predefinidos (Prompts)
* `nexora_deal_review` — Auditoría comercial de oportunidad con probabilidad de victoria
* `nexora_customer_health_check` — Análisis de salud del cliente, sentimiento y riesgo de churn

---

## 🚀 Configuración e Instalación

### Variables de Entorno
Crea un archivo `.env` o pásalas en la configuración de tu cliente:
```env
NEXORA_API_URL=http://localhost:3006
NEXORA_API_KEY=nex_live_tu_clave_de_api_aqui
```

---

## 💻 Integración con Claude Desktop

Agrega lo siguiente en tu archivo de configuración de Claude Desktop:
* **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
* **Linux:** `~/.config/Claude/claude_desktop_config.json`
* **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nexora-crm": {
      "command": "node",
      "args": [
        "/ruta/a/crm-service/packages/mcp-server/dist/index.js"
      ],
      "env": {
        "NEXORA_API_URL": "http://localhost:3006",
        "NEXORA_API_KEY": "nex_live_xxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

---

## 🎯 Integración con Cursor

En el archivo `.cursor/mcp.json` de tu workspace:

```json
{
  "mcpServers": {
    "nexora-crm": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"],
      "env": {
        "NEXORA_API_URL": "http://localhost:3006",
        "NEXORA_API_KEY": "nex_live_xxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```
