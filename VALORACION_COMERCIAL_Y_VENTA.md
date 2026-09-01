# Nexora CRM — Dossier de Valoración Comercial, Modelos de Negocio y Estrategia de Venta

---

## 1. Resumen Ejecutivo y Propuesta de Valor

**Nexora CRM** es una plataforma empresarial integral de gestión de clientes, ventas, soporte multicanal y automatización con IA. A diferencia de las plantillas o scripts básicos del mercado, este software ha sido construido desde sus cimientos como un **Monolito Modular de grado empresarial**, aplicando principios estrictos de **Domain-Driven Design (DDD), Clean Architecture, Hexagonal Architecture, gRPC, NATS JetStream y PostgreSQL con Row-Level Security (RLS) multi-inquilino puro**.

### ¿Qué problema resuelve?
Reemplaza la necesidad de contratar y pagar suscripciones separadas para múltiples herramientas:
- **HubSpot / Salesforce:** Gestión de contactos, empresas, pipelines y cotizaciones CPQ ($150 - $500/mes).
- **Zendesk / Freshdesk:** Helpdesk con SLA, tickets y base de conocimiento ($80 - $200/mes).
- **ManyChat / Kommo:** Inbox omnicanal con WhatsApp Cloud API y comentarios de redes sociales ($50 - $150/mes).
- **Mailchimp / Klaviyo:** Diseñador drag-and-drop y envíos masivos con pixel de apertura ($50 - $150/mes).
- **Aircall / CloudTalk:** VoIP Click-to-Call desde el navegador ($60 - $120/mes).

**Ahorro total estimado para el cliente final:** Entre **$400 y $1,200 USD mensuales**.

---

## 2. Inventario de Capacidades y Activos Técnicos

| Área Funcional | Capacidades Clave Implementadas |
| :--- | :--- |
| **Core CRM B2B & B2C** | Visión 360° de Contactos, Empresas B2B, Tableros Kanban de Pipelines de Venta, Gestión de Deals, Timeline de Actividades e Interacciones. |
| **CPQ & Ventas Avanzadas** | Catálogo de Productos y Precios, Generador de Cotizaciones multi-moneda con cálculo de impuestos, Flujo de Aprobaciones de Descuentos, Contratos Digitales con Firma Electrónica HMAC/OTP. |
| **Omnicanalidad & Soporte** | Inbox Omnicanal unificado (WhatsApp Cloud API, Email SMTP/IMAP, Facebook Messenger, Instagram DM), Sistema de Tickets con SLA y escalamiento automático, Base de Conocimiento RAG con IA y subida de archivos a Cloudflare R2. |
| **Social Inbox & Leads** | Captura automática de leads desde Facebook Lead Ads y TikTok Ads, Auto-respondedor inteligente a comentarios con IA y creación automática de prospectos. |
| **Marketing & Automatización** | Diseñador visual Drag-and-Drop de plantillas de correo HTML responsive, Motor de envío masivo con pixel de rastreo de apertura (1x1 GIF) y enlace de baja, Lead Scoring predictivo, Detección de riesgo de Churn. |
| **Telefonía VoIP** | Click-to-Call directo desde el navegador mediante Twilio Voice SDK con grabación y registro en historial. |
| **Analítica & Forecasting** | Proyección matemática automatizada de ingresos (3M / 6M) con escenarios optimista, base y pesimista, velocidad de pipeline y tasa de cierre (Win Rate). |
| **Seguridad & Plataforma** | Multi-tenancy nativo por Row-Level Security (RLS) en PostgreSQL, IAM con roles y permisos granulares (RBAC), Auditoría inmutable de cambios (Audit Logs), API Keys y Webhooks con firma HMAC SHA-256 para desarrolladores. |

---

## 3. Modelos de Venta y Precios Recomendados

---

### Modelo A: SaaS Multi-Tenant (Suscripción Mensual B2B)

El CRM ya cuenta con aislamiento de datos por inquilino (`tenant_id`), lo que permite alojar a cientos de empresas en un único servidor con costos operativos mínimos.

| Plan | Precio Sugerido | Límite de Usuarios | Funcionalidades Destacadas |
| :--- | :--- | :--- | :--- |
| **Starter** | **$39 - $59 USD / mes** | Hasta 3 usuarios | Contactos, Empresas, Pipeline Kanban, Formularios Web, Notas y Tareas. |
| **Professional** | **$129 - $199 USD / mes** | Hasta 10 usuarios | WhatsApp Cloud API, Campañas Masivas, CPQ (Cotizaciones), Helpdesk con Tickets y SLA. |
| **Enterprise** | **$399 - $699 USD / mes** | Usuarios ilimitados | IA RAG con Documentos, Forecast Trimestral, VoIP Click-to-Call, Auditoría completa, API Keys y Webhooks. |

#### Proyección Financiera SaaS (Ingreso Mensual Recurrente - MRR):

| Clientes Activos | Ticket Promedio | Ingreso Mensual (MRR) | Ingreso Anual (ARR) |
| :---: | :---: | :---: | :---: |
| **10 clientes** | $140 USD | **$1,400 USD** | $16,800 USD |
| **30 clientes** | $150 USD | **$4,500 USD** | $54,000 USD |
| **50 clientes** | $160 USD | **$8,000 USD** | $96,000 USD |
| **100 clientes** | $175 USD | **$17,500 USD** | **$210,000 USD** |

---

### Modelo B: Licencia Exclusiva / Implementación On-Premise

Venta del software desplegado en la infraestructura privada (AWS, Azure, GCP o Servidor Propio) de una mediana o gran empresa:

* **Precio de Licencia e Implementación Inicial (Setup):**
  👉 **$12,000 a $25,000 USD** (un solo pago por entrega, configuración, migración de datos y capacitación).
* **Contrato Mensual de Soporte, SLA y Mantenimiento (Retainer):**
  👉 **$800 a $2,500 USD / mes** (monitoreo, backups automáticos, parches de seguridad y soporte nivel 3).

---

### Modelo C: Marca Blanca para Agencias (White-Label Partner)

Permite a agencias de marketing digital, consultoras y academias revender el CRM con su propio logo, dominio y colores corporativos a sus clientes:

* **Costo de Activación por Agencia:** **$3,000 a $5,000 USD**.
* **Cuota Mensual de Mantenimiento por Agencia:** **$300 a $600 USD / mes** (o esquema de comisión del 30% al 50% por cliente activo).

---

### Modelo D: Venta de Propiedad Intelectual / Código Fuente (Exit / M&A)

Si decides vender el repositorio completo con su arquitectura y derechos de autor en plataformas especializadas como [Acquire.com](https://acquire.com) o Flippa:

* **Costo de Desarrollo Equivalente:**
  Construir un monorepo con 21 bounded contexts, gRPC, NATS, Next.js 16 y 66 rutas requiere un equipo de 3 desarrolladores senior durante 6 a 9 meses (~$60,000 - $100,000 USD en salarios).
* **Valoración Turnkey (Software Llave en Mano sin tracción previa):**
  👉 **$35,000 a $60,000 USD**.
* **Valoración con Tracción Comercial (20 a 50 clientes pagando suscripción):**
  👉 **$150,000 a $350,000+ USD** (múltiplo estándar de 3x a 5x ARR en SaaS B2B).

---

## 4. Costos de Operación vs. Margen de Ganancia

| Concepto | Costo Mensual Estimado |
| :--- | :--- |
| **Servidor VM / VPS (4-8 vCPU, 16GB RAM)** | $20 - $45 USD / mes |
| **Cloudflare Zero Trust + DNS + WAF** | $0 USD (Plan Gratuito / $5 USD Pro) |
| **Cloudflare R2 Storage (Archivos y Documentos KB)** | $0 - $5 USD / mes (10GB gratuitos) |
| **Base de Datos PostgreSQL (en VM Docker)** | Incluido en el VPS |
| **Costo Total de Infraestructura Base:** | **~$30 - $55 USD / mes** |

> [!IMPORTANT]
> **Margen Operativo Bruto:** Superior al **90% - 95%**. Con solo 1 cliente del Plan Pro ($149/mes), la infraestructura completa del servidor está 100% pagada y generando utilidad neta.

---

## 5. Plan de Acción Comercial (Go-To-Market)

1. **Fase 1: Clientes Piloto (Primeros 30 días)**
   - Cerrar de 3 a 5 empresas conocidas o del sector comercial a una tarifa preferencial de **$49 a $79 USD/mes** a cambio de retroalimentación y testimonios en video.
2. **Fase 2: Lanzamiento Público y Demos**
   - Configurar la landing page principal con llamada a la acción: *"Agenda una Demo de 15 minutos"* o *"Prueba 14 días gratis"*.
   - Utilizar las credenciales demo pre-configuradas para realizar demostraciones en vivo de WhatsApp, Cotizaciones y Forecast de Ingresos.
3. **Fase 3: Alianzas con Agencias de Marketing**
   - Presentar el CRM a agencias como la herramienta ideal para entregar a sus clientes de pauta (Facebook/TikTok Ads) con recepción instantánea de leads.
