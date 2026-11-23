# 🚀 Nexora CRM — Diseño objetivo y estado: Workflow Automation Engine

Este documento conserva el diseño objetivo y el plan original del **Motor de Automatizaciones y Workflows** de Nexora CRM. El módulo ya tiene código; la siguiente comparación distingue lo que se localizó de lo que sigue pendiente. La revisión es estática, no ejecutó pruebas ni servicios externos.

> **Criterio de estado:** «Parcial» significa que existe una parte del requisito, no que el flujo esté terminado. Las casillas sin marcar de las fases son requisitos del diseño original y no sustituyen la tabla de verificación.

## Estado contrastado con el código (2026-11-16)

| Requisito | Estado | Evidencia y brecha encontrada |
|---|---|---|
| 1.1 Persistencia y versionado inmutable | Integrada y desplegada | PR #16 corrigió la compatibilidad de claves históricas; CI y despliegue principal finalizaron correctamente en el run #204. |
| 1.2 Dominio y FSM | Parcial | Hay entidades, estados, `cloneAsNewVersion()` y `ConditionEvaluator`. No se encontró validación completa del grafo/ciclos ni evaluación de expresiones anidadas AND/OR. |
| 3.1 Runtime de workflow con NATS JetStream | En implementación en `feat/workflow-jetstream-delayed-jobs` | Se incorpora stream persistente, consumidor pull durable y worker dedicado; pendiente de CI y despliegue. Redis permanece para caché. |
| 3.2 Delays programados | En implementación en rama | Se agregan `resume_at`, `resume_token`, Outbox transaccional y scheduler JetStream; falta validar contra un broker real. |
| 3.3 Idempotencia de reanudación | En implementación en rama | El token de reanudación evita que un mensaje atrasado o duplicado reactive una espera distinta; la exclusión concurrente debe validarse en integración. |
| 3.4 Reintentos y DLQ de workflows | En implementación en rama | Se agrega backoff exponencial a nivel de worker y publicación idempotente al stream `workflow_dlq`; pendiente prueba de fallos reales. |
| 4.1 Consumidor NATS | Parcial | `AutomationConsumerService` se suscribe a una lista explícita de eventos y llama al handler. No se suscribe a todo `crm.*.*`. |
| 4.2 Filtros e idempotencia de evento | Parcial | Se buscan workflows activos y se evalúa el filtro; el paso tiene clave idempotente. No se encontró deduplicación de creación de ejecución por `event_id`. |
| 5.1–5.3 Acciones WhatsApp, SMS, email y acciones internas | No implementado en el motor actual | `WorkflowEngineService.performAction()` registra la acción y devuelve datos de configuración; no ejecuta el efecto externo/interno. Los dispatchers generales de Inbox no demuestran integración con cada paso del workflow. |
| 5.4 Webhooks desde workflows | Parcial, integración no confirmada | El módulo `developer` incluye endpoints y entrega de webhooks; no se encontró una acción del motor que los invoque desde un paso workflow. |
| 6.1 Contratos tipados | Presente parcialmente | Hay tipos de workflow en `@crm/contracts`; no se verificó cobertura completa de los schemas descritos en el diseño. |
| 6.2 API/gRPC | Presente | El módulo API tiene controladores gRPC/HTTP y operaciones de workflows. Es parte del monolito, no un microservicio desplegado por separado. |
| 6.3 BFF | Presente con rutas distintas al diseño | Hay endpoints BFF bajo `/api/automation` y métodos para ejecuciones; el diseño propone `/api/automations/workflows`. |
| 7.1 Lista de automatizaciones | Presente | Existe la ruta `/automations` y una página de lista. Su completa operación no se comprobó. |
| 7.2 Constructor visual | Presente parcialmente | Existe `/automations/new` y componentes de canvas/nodos; no se verificó toda la funcionalidad de ramas, delays y acciones reales. |
| 7.3 Monitor/depurador | Parcial | La API expone consulta de ejecuciones y pasos; no se encontró la ruta de monitor dedicada descrita en el plan ni reintento manual de paso. |
| 8.1 Pruebas unitarias | Parcial | Hay pruebas de entidades, evaluador y handlers; no se midió cobertura y no se afirma 100%. |
| 8.2 Pruebas de integración | Parcial | Existe prueba de repositorio Drizzle; falta ejecutar integración real con NATS JetStream y PostgreSQL para validar scheduling, reanudación y DLQ. |
| 8.3 Pruebas E2E | Parcial | `frontend/e2e/automations.spec.ts` valida renderizado del dashboard y diseñador; no ejecuta el ciclo completo evento → acción → delay → finalización. |

El motor en su forma actual no debe describirse como runtime distribuido completo: las ejecuciones, filtros y transiciones tienen código, pero el despacho de acciones y la reanudación de delays descritos en el plan no se localizaron.

---

## 🏛️ 1. Arquitectura objetivo (no as-built)

El diagrama describe el objetivo del runtime. La implementación JetStream de esta rama aún está pendiente de CI y despliegue.

```text
                  NEXORA CRM BUSINESS CORE
         (Contacts, Deals, Tickets, Quotes, Campaigns)
                             │
                             ▼ (Domain Events)
                     📦 Transactional Outbox
                             │
                             ▼
                    ⚡ NATS JetStream
                Topic: crm.<aggregate>.<event>
                             │
                             ▼
               ⚙️ AUTOMATION ENGINE CONSUMER
                             │
               ┌─────────────┴─────────────┐
               │                           │
               ▼                           ▼
      💾 PostgreSQL (RLS)           🔴 Redis + BullMQ
  • workflow_definitions (v1, v2)   • Delayed Jobs (24h, 10m)
  • workflow_executions             • Retry Policies & Backoff
  • workflow_step_executions        • Distributed Locks
               │                           │
               └─────────────┬─────────────┘
                             ▼
                    🛠️ WORKFLOW WORKERS
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
   📱 WhatsApp           ✉️ Email             📋 Tasks / CRM
 (Meta API / Twilio) (SMTP / SendGrid)     (Internal Mutations)
```

---

## 📅 2. Plan original por Fases

Las fechas del siguiente Gantt son las estimaciones originales de 2026-09-01 y no reflejan un calendario vigente ni el estado de cada tarea.

```mermaid
gantt
    title Fases de Implementación del Workflow Automation Engine
    dateFormat  YYYY-MM-DD
    section Fase 1: Datos & Schemas
    Modelado Drizzle & Migraciones SQL    :done, f1, 2026-09-01, 3d
    section Fase 2: Dominio & FSM
    Agregados, Entidades & Máquina Estados :active, f2, after f1, 4d
    Evaluador de Reglas JSON               :f2b, after f1, 3d
    section Fase 3: Runtime JetStream
    Stream y worker durable               :f3, after f2, 4d
    Scheduling, retries y DLQ             :f3b, after f3, 3d
    section Fase 4: Eventos NATS
    Ingesta de Eventos & Filtros          :f4, after f3, 3d
    section Fase 5: Acciones
    Despachadores Email, WhatsApp, Tareas  :f5, after f4, 4d
    Webhooks Salientes con HMAC           :f5b, after f5, 2d
    section Fase 6: gRPC & BFF
    Servicios gRPC & Endpoints Gateway    :f6, after f5, 3d
    section Fase 7: Frontend UI
    Constructor Visual & Auditoría Vivas  :f7, after f6, 5d
    section Fase 8: Testing & DoD
    Tests Unitarios, Integración & E2E    :f8, after f7, 4d
```

Las etiquetas `done` y `active` del Gantt son parte del plan histórico; no reflejan el estado verificado hoy.

---

### 🔹 FASE 1: Modelado de Datos y Persistencia Transaccional
**Objetivo:** Crear la estructura de almacenamiento con versionado inmutable, soporte multi-tenant (RLS) y claves únicas de idempotencia.

- [x] **1.1 Persistencia y Versionado Inmutable (PR #16 integrada en `main`; CI y despliegue productivo verificados):**
  - **`workflow_definitions`:**
    - `id`: UUID (Primary Key); `tenant_id`: UUID (FK a `tenants.tenants.id`, RLS).
    - `name`: `varchar(200)`; `description`: `text`; `version`: entero positivo desde 1.
    - `status`: `DRAFT`, `ACTIVE`, `PAUSED`, `ARCHIVED`.
    - `trigger_event`, `trigger_filter`, `steps_graph`, `created_at`, `updated_at`.
    - Clave única `(tenant_id, name, version)`. Una versión persistida no permite editar su contenido ni eliminarse; los cambios se guardan como una nueva versión. Solo se permiten transiciones válidas de estado.
  - **`workflow_executions`:**
    - `id`, `tenant_id`, `workflow_id`, `version`, `entity_type`, `entity_id`, `current_step_id`, `context_data` y marcas de tiempo/error.
    - Estados: `RUNNING`, `WAITING_DELAY`, `COMPLETED`, `CANCELLED`, `FAILED`.
    - FK compuesta `(tenant_id, workflow_id, version)` hacia la versión exacta de `workflow_definitions`. La identidad de la ejecución es inmutable.
  - **`workflow_step_executions`:**
    - `id`, `tenant_id`, `execution_id`, `step_id`, `idempotency_key`, `status`, `attempts`, `output_data`, `error_message`, `started_at`, `completed_at`.
    - Estados: `PENDING`, `EXECUTING`, `SUCCESS`, `FAILED`, `SKIPPED`.
    - Las nuevas filas exigen `idempotency_key = ${executionId}_${stepId}_${attempt}`, única por tenant y validada contra ejecución, paso e intento. Las claves históricas se conservan literalmente como identidad de auditoría, sin reescritura; la base de datos valida la fórmula canónica en inserciones y cambios de identidad, pero permite actualizar el progreso de registros históricos.
  - Las tres tablas tienen restricciones de tenant y políticas RLS. Cada operación de repositorio establece `app.tenant_id` localmente en su propia transacción.
  - La migración `0034` ya creó las tablas; la migración `0040_workflow_immutable_persistence.sql` agrega las garantías sin recrear datos.
  - La programación/reanudación efectiva de delays y los workers no forman parte de 1.1 y no se implementan en esta entrega.

---


### 🔹 FASE 2: Capa de Dominio y Máquina de Estados Finita (FSM)
**Objetivo:** Modelar la lógica pura de negocio sin acoplamientos a frameworks ni ORMs.

- [ ] **2.1 Agregado `WorkflowDefinition`:**
  - Invariante: Una versión en estado `ACTIVE` no puede modificarse; cualquier edición crea una nueva versión (`cloneAsNewVersion()`).
  - Validación del grafo de pasos (detección de ciclos infinitos, pasos huérfanos o ramas sin salida).
- [ ] **2.2 Agregado `WorkflowExecution`:**
  - Transiciones de estado válidas: `RUNNING` ➔ `WAITING_DELAY` ➔ `RUNNING` ➔ `COMPLETED` / `CANCELLED` / `FAILED`.
  - Métodos de dominio: `advanceToNextStep(outputData)`, `waitForDelay(stepId, duration)`, `cancel(reason)`, `recordFailure(error)`.
- [ ] **2.3 Motor de Evaluación de Reglas (`ConditionEvaluator`):**
  - Evaluación de operadores lógicos: `EQUALS`, `NOT_EQUALS`, `GREATER_THAN`, `LESS_THAN`, `CONTAINS`, `IN`, `IS_EMPTY`.
  - Soporte de expresiones compuestas (`AND` / `OR` anidados) sobre variables de contexto.

---

### 🔹 FASE 3: Runtime Asíncrono con NATS JetStream
**Objetivo:** Ejecutar tareas diferidas sin bloquear Node.js, con persistencia, reintentos y DLQ sobre la infraestructura NATS existente; no se añade BullMQ ni se convierte Redis en broker de workflows.

- [ ] **3.1 Streams y consumidores JetStream:**
  - Stream `workflow_runtime` con almacenamiento de archivo y scheduling habilitado.
  - Subjects separados `workflow.schedule` y `workflow.resume`; consumidor pull durable con ACK explícito.
  - Worker en proceso PM2 separado para escalarlo sin aumentar réplicas HTTP.
- [ ] **3.2 Delays no bloqueantes:**
  - Parsear duraciones `10m`, `24h`, `30d` (máximo 365 días).
  - Persistir `WAITING_DELAY`, `resume_at`, `resume_token` y el evento Outbox en una misma transacción PostgreSQL.
  - El relay programa `Nats-Schedule: @at` y `Nats-Schedule-Target: workflow.resume`; si vuelve después del vencimiento, publica la reanudación inmediatamente.
- [ ] **3.3 Reanudación e idempotencia:**
  - El token vincula el mensaje con la espera vigente y descarta mensajes obsoletos o duplicados.
  - La ejecución continúa desde `nextStepId`; no vuelve a ejecutar el nodo `DELAY`.
  - Cada retry crea una nueva identidad de intento del paso; las identidades históricas permanecen inmutables.
- [ ] **3.4 Reintentos y Dead Letter Queue (DLQ):**
  - ACK explícito y heartbeat durante trabajos largos; el broker vuelve a entregar mensajes ante caídas.
  - Backoff exponencial de aplicación y límite de cinco entregas (cap de 5 minutos).
  - Al agotar intentos se publica idempotentemente en `workflow_dlq` antes de confirmar el mensaje original.

---

### 🔹 FASE 4: Ingesta de Eventos de Dominio vía NATS JetStream
**Objetivo:** Conectar el Outbox Pattern con el Automation Engine de manera reactiva.

- [ ] **4.1 Consumidores NATS JetStream:**
  - Suscripción a temas `crm.*.*` (`crm.contact.created`, `crm.deal.won`, `crm.ticket.created`, `crm.quote.accepted`).
- [ ] **4.2 Filtro de Coincidencia de Triggers:**
  - Buscar workflows activos (`status = 'ACTIVE'`) para el `tenant_id` y evento correspondiente.
  - Evaluar `trigger_filter` contra el payload del evento.
  - Instanciar `workflow_executions` de manera idempotente (usando `event_id` como clave para no duplicar flujos).

---

### 🔹 FASE 5: Despachadores de Acciones (Action Handlers)
**Objetivo:** Implementar los ejecutores de acciones externas e internas.

- [ ] **5.1 Despachador de WhatsApp y SMS:**
  - Integración de plantillas aprobadas con variables dinámicas (`{{contact.name}}`, `{{deal.amount}}`).
- [ ] **5.2 Despachador de Email:**
  - Renderizado de plantillas HTML transaccionales con soporte para seguimiento de aperturas y clics.
- [ ] **5.3 Acciones Internas del CRM:**
  - Creación automática de tareas (`TaskCreated`), asignación de vendedor (`UserAssigned`), asignación de etiquetas (`TagAssigned`) y actualización de etapas de Deals.
- [ ] **5.4 Webhooks Salientes con Firma Criptográfica:**
  - Envío de llamadas HTTP POST a APIs externas con firma HMAC SHA-256 en header (`X-Signature`).

---

### 🔹 FASE 6: Capa gRPC, Gateway BFF y Contratos Zod
**Objetivo:** Exponer la gestión de automatizaciones de forma tipada y segura para el frontend.

- [ ] **6.1 Paquete `@crm/contracts`:**
  - Schemas Zod: `WorkflowDefinitionSchema`, `CreateWorkflowSchema`, `UpdateWorkflowSchema`, `WorkflowExecutionSchema`.
- [ ] **6.2 Microservicio gRPC (`apps/api`):**
  - `AutomationService`: `CreateWorkflow`, `UpdateWorkflow`, `ListWorkflows`, `GetWorkflowExecution`, `CancelExecution`, `RetryStep`.
- [ ] **6.3 BFF Controller (`apps/bff`):**
  - Endpoints REST `/api/automations/workflows` con validación Zod y caché selectivo.

---

### 🔹 FASE 7: Experiencia de Usuario en Frontend (Next.js 16)
**Objetivo:** Interfaz visual intuitiva para crear, monitorear y depurar automatizaciones.

- [ ] **7.1 Listado de Automatizaciones (`/automations`):**
  - Tabla con estado (Activo/Borrador/Pausado), versión actual, ejecuciones activas y tasa de éxito.
- [ ] **7.2 Constructor de Workflows (`/automations/[id]/builder`):**
  - Editor visual secuencial con selector de Disparadores, Acciones, Delays y Ramas condicionales (Sí / No).
- [ ] **7.3 Monitor y Depurador de Ejecuciones (`/automations/executions/[id]`):**
  - Vista paso a paso de la ruta que siguió un cliente específico, tiempos de espera, cargas útiles de entrada/salida y botón de reintento manual en caso de error.

---

### 🔹 FASE 8: Pruebas Exhaustivas y Definition of Done (DoD)
**Objetivo:** Cobertura total y verificación de fiabilidad en condiciones reales.

- [ ] **8.1 Tests Unitarios (100% en Lógica de Dominio):**
  - Evaluación de árboles de condiciones con operadores complejos.
  - Invariantes de versionado inmutable en `WorkflowDefinition`.
  - Transiciones de estado de `WorkflowExecution`.
- [ ] **8.2 Tests de Integración:**
  - Persistencia en PostgreSQL con Drizzle y aislamiento de inquilinos con RLS.
  - Scheduling de delays en NATS JetStream, reanudación de workers, backoff y persistencia en DLQ.
  - Verificación de no-duplicidad con `idempotency_key`.
- [ ] **8.3 Tests E2E:**
  - Disparo de evento `ContactCreated` ➔ Inicio de flujo ➔ Paso 1 WhatsApp ➔ Delay simulado ➔ Evaluación de condición ➔ Finalización con éxito.

---

## 📌 Ubicación de componentes y entregables objetivo

La tabla siguiente expresa la organización prevista. Las filas no certifican que todos los entregables estén implementados; ver el estado contrastado al inicio del documento.

| Módulo | Paquete / Servicio | Principales Responsabilidades |
|---|---|---|
| `@crm/database` | `packages/database` | Esquemas de tablas `workflow_*`, migraciones Drizzle y RLS. |
| `@crm/contracts` | `packages/contracts` | Schemas Zod, validaciones de grafos y DTOs tipados. |
| `AutomationModule` | `apps/api` | Lógica DDD, FSM, listeners NATS y gRPC. El proceso `WorkflowWorkerModule` ejecuta el runtime diferido JetStream. |
| `AutomationsBff` | `apps/bff` | API Gateway REST, autenticación, autorización y swagger docs. |
| `AutomationsUI` | `frontend` | Constructor de flujos, monitor de auditoría y métricas. |
