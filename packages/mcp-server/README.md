# Nexus CRM — Model Context Protocol (MCP) Server 🤖

El servidor **Nexus CRM MCP** permite a agentes de Inteligencia Artificial y Modelos de Lenguaje (como **Claude Desktop**, **Cursor**, **Antigravity** o agentes autónomos) interactuar de forma nativa con toda la plataforma Nexus CRM a través de lenguaje natural.

---

## ⚡ Capacidades del Servidor MCP

### 🛠️ Herramientas (Tools)
* **Contactos & 360:** `nexus_list_contacts`, `nexus_get_contact`, `nexus_create_contact`, `nexus_get_customer_360`
* **Deals & Ventas:** `nexus_list_deals`, `nexus_get_deal`, `nexus_create_deal`, `nexus_move_deal_stage`, `nexus_win_deal`, `nexus_lose_deal`
* **Interacciones:** `nexus_create_note`, `nexus_create_task`, `nexus_log_call`
* **Helpdesk & Soporte:** `nexus_list_tickets`, `nexus_get_ticket`, `nexus_create_ticket`, `nexus_reply_ticket`
* **CPQ & Cotizaciones:** `nexus_list_products`, `nexus_get_quote`, `nexus_create_quote`, `nexus_accept_quote`
* **IA Predictiva & Radar:** `nexus_predict_deal_win`, `nexus_generate_message_draft`, `nexus_get_contact_summary`, `nexus_predict_churn_risk`
* **Base de Conocimiento:** `nexus_search_knowledge_base`, `nexus_get_kb_article`

### 📦 Recursos (Resources)
* `nexus://contacts/recent` — Lista en tiempo real de contactos recientes
* `nexus://deals/pipeline` — Oportunidades activas en el pipeline de ventas
* `nexus://kb/articles` — Índice de artículos de ayuda publicados

### 💬 Flujos Predefinidos (Prompts)
* `nexus_deal_review` — Auditoría comercial de oportunidad con probabilidad de victoria
* `nexus_customer_health_check` — Análisis de salud del cliente, sentimiento y riesgo de churn

---

## 🚀 Configuración e Instalación

### Variables de Entorno
Crea un archivo `.env` o pásalas en la configuración de tu cliente:
```env
NEXUS_API_URL=http://localhost:3006
NEXUS_API_KEY=nex_live_tu_clave_de_api_aqui
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
    "nexus-crm": {
      "command": "node",
      "args": [
        "/ruta/a/crm-service/packages/mcp-server/dist/index.js"
      ],
      "env": {
        "NEXUS_API_URL": "http://localhost:3006",
        "NEXUS_API_KEY": "nex_live_xxxxxxxxxxxxxxxxxxxxxxxx"
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
    "nexus-crm": {
      "command": "node",
      "args": ["packages/mcp-server/dist/index.js"],
      "env": {
        "NEXUS_API_URL": "http://localhost:3006",
        "NEXUS_API_KEY": "nex_live_xxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```
