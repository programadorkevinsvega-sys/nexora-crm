# Nexora CRM — Dossier de Valoración Comercial, Modelos de Negocio y Estrategia de Venta

> **Aviso de verificación (2026-11-16):** este dossier contiene hipótesis comerciales y afirmaciones de producto, no una certificación funcional, de seguridad, rendimiento, costos ni tracción. Se identificaron módulos y pantallas fuente para varias capacidades; ninguna se validó integralmente contra servicios externos o en producción. Los importes, ahorros, márgenes y valoraciones son estimaciones propuestas, no resultados medidos.

---

## 1. Resumen Ejecutivo y Propuesta de Valor

**Nexora CRM** es un CRM con una amplia base de código para gestión de clientes, ventas, soporte y automatización. El repositorio está estructurado como monolito modular e incluye componentes DDD/Clean Architecture, gRPC, NATS JetStream y esquemas PostgreSQL. La conformidad completa con esas reglas, la aplicación de RLS en cada tabla y la operación empresarial deben auditarse antes de presentarlas como certificadas.

### ¿Qué problema resuelve?
Reemplaza la necesidad de contratar y pagar suscripciones separadas para múltiples herramientas:
- **HubSpot / Salesforce:** Gestión de contactos, empresas, pipelines y cotizaciones CPQ ($150 - $500/mes).
- **Zendesk / Freshdesk:** Helpdesk con SLA, tickets y base de conocimiento ($80 - $200/mes).
- **ManyChat / Kommo:** Inbox omnicanal con WhatsApp Cloud API y comentarios de redes sociales ($50 - $150/mes).
- **Mailchimp / Klaviyo:** Diseñador drag-and-drop y envíos masivos con pixel de apertura ($50 - $150/mes).
- **Aircall / CloudTalk:** VoIP Click-to-Call desde el navegador ($60 - $120/mes).

**Ahorro total estimado para el cliente final:** Entre **$400 y $1,200 USD mensuales**.

Esta comparación y los precios de terceros son estimaciones no referenciadas en el repositorio; deben volver a cotizarse antes de usarse en una propuesta comercial.

---

## 2. Capacidades previstas y evidencia localizada en el código

«Presente parcialmente» indica que se localizaron componentes, no que la capacidad esté terminada ni habilitada en producción.

| Área Funcional | Capacidades descritas en el dossier | Evidencia y estado |
| :--- | :--- | :--- |
| **Core CRM B2B & B2C** | Contactos, empresas, pipelines, deals, timeline y Customer 360. | **Presente parcialmente:** existen módulos `contacts`, `companies`, `pipelines`, `interactions` y `customer-360`, además de páginas fuente. Los flujos no se probaron en vivo. |
| **CPQ & Ventas Avanzadas** | Productos, precios, cotizaciones con impuestos/moneda, aprobaciones, contratos y firma OTP; HMAC en webhooks. | **Presente parcialmente:** hay código CPQ, catálogos, price books, aprobaciones y firma. No se localizó generador PDF en esta revisión; integridad/validez legal y conectividad externa no están certificadas. |
| **Omnicanalidad & Soporte** | WhatsApp, correo, Messenger/Instagram, tickets/SLA, RAG y archivos. | **Presente parcialmente:** existen módulos Inbox/Helpdesk/Knowledge Base, webhook de WhatsApp, dispatchers de email y componentes RAG. No se verificaron todos los canales, SLA, almacenamiento real ni operación con credenciales externas. |
| **Social Inbox & Leads** | Leads de Facebook/TikTok y respuesta automática a comentarios. | **Presente parcialmente:** existen módulos Meta Leads, TikTok Leads y Social Inbox, además de reglas y pantallas. No se verificó conexión real a cuentas publicitarias ni automatización completa. |
| **Marketing & Automatización** | Editor de correo, envíos masivos, tracking, lead scoring y riesgo de churn. | **Presente parcialmente:** hay campañas/editor, automatización, scoring y componentes de predicción. Tracking y ejecución efectiva de cada paso del workflow requieren validación; ver [roadmap de workflows](./docs/WORKFLOW_AUTOMATION_ENGINE_ROADMAP.md). |
| **Telefonía VoIP** | Click-to-Call, Twilio, grabación e historial. | **Parcial/no validado:** existe módulo BFF de VoIP y configuración de integración; SDK de navegador, grabación y llamadas reales no se comprobaron. |
| **Analítica & Forecasting** | Forecast, funnels, cohortes, ingresos y win rate. | **Presente parcialmente:** hay módulo y pantallas de analytics, contratos para funnel/cohortes/forecast. Exactitud de resultados y datos productivos no se verificaron. |
| **Seguridad & Plataforma** | RLS, RBAC, auditoría inmutable, API keys y webhooks firmados. | **Presente parcialmente:** existen IAM/RBAC, módulos de auditoría y developer, API keys y webhooks; hay código HMAC para webhooks. No se localizaron políticas SQL explícitas de RLS ni implementación ABAC en el código revisado; inmutabilidad y entrega firmada deben auditarse. |

---

## 3. Modelos de Venta y Precios Recomendados

---

### Modelo A: SaaS Multi-Tenant (Suscripción Mensual B2B)

El modelo incluye `tenant_id` y configuración multi-tenant. **No se han medido capacidad, concurrencia ni costo por cliente**, y la presencia de `tenant_id` no demuestra que RLS proteja cada consulta. La afirmación de alojar cientos de empresas en un servidor queda como hipótesis pendiente de pruebas de carga y revisión de seguridad.

Los planes y precios siguientes son propuestas comerciales; no se verificó un sistema de suscripción/billing que los aplique.

| Plan | Precio Sugerido | Límite de Usuarios | Funcionalidades Destacadas |
| :--- | :--- | :--- | :--- |
| **Starter** | **$39 - $59 USD / mes** | Hasta 3 usuarios | Contactos, Empresas, Pipeline Kanban, Formularios Web, Notas y Tareas. |
| **Professional** | **$129 - $199 USD / mes** | Hasta 10 usuarios | WhatsApp Cloud API, Campañas Masivas, CPQ (Cotizaciones), Helpdesk con Tickets y SLA. |
| **Enterprise** | **$399 - $699 USD / mes** | Usuarios ilimitados | IA RAG con Documentos, Forecast Trimestral, VoIP Click-to-Call, Auditoría completa, API Keys y Webhooks. |

#### Ejemplo hipotético de proyección financiera SaaS (MRR)

Los valores suponen que se consiguen los clientes y tickets promedio indicados; no representan ventas existentes ni ingresos observados.

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
  Como referencia hipotética, este repositorio contiene 33 módulos API y 99 archivos fuente `page.tsx`, además de gRPC y NATS. La equivalencia de esfuerzo de 3 desarrolladores senior durante 6 a 9 meses (~$60,000 - $100,000 USD en salarios) no se ha estimado mediante auditoría de tareas ni constituye un costo medido.
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
> **Estimación no validada:** el margen del 90%–95% y el punto de equilibrio con un cliente Pro ($149/mes) dependen de supuestos de infraestructura, soporte, proveedores de IA/correo/mensajería, impuestos y adquisición. No son resultados contables observados.

---

## 5. Plan de Acción Comercial (Go-To-Market)

1. **Fase 1: Clientes Piloto (Primeros 30 días)**
   - Cerrar de 3 a 5 empresas conocidas o del sector comercial a una tarifa preferencial de **$49 a $79 USD/mes** a cambio de retroalimentación y testimonios en video.
2. **Fase 2: Lanzamiento Público y Demos**
   - Configurar la landing page principal con llamada a la acción: *"Agenda una Demo de 15 minutos"* o *"Prueba 14 días gratis"*.
   - Usar únicamente las cuentas de demo documentadas en [README.md](./README.md) y validar previamente cada integración externa antes de prometer una demostración en vivo de WhatsApp, cotizaciones o forecast.
3. **Fase 3: Alianzas con Agencias de Marketing**
   - Presentar el CRM a agencias como la herramienta ideal para entregar a sus clientes de pauta (Facebook/TikTok Ads) con recepción instantánea de leads.
