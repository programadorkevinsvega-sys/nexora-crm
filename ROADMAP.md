# Roadmap y estado del proyecto

**Fecha de revisión del inventario:** 2026-11-16
**Stack declarado por los manifiestos y la configuración:** Node.js 20+, NestJS 10, Next.js 16, React 19, Drizzle ORM, PostgreSQL, Redis y NATS JetStream.

> Los estados «presente en código» describen archivos y componentes localizados en el repositorio. No significan que la función esté completa, desplegada o validada en ejecución. No se ejecutaron los tests como parte de esta revisión.

## Inventario verificado en el código

| Área | Estado observado |
|---|---|
| API (`apps/api`) | **Presente:** 33 directorios de módulos, todos con `module.public-api.ts`. El bootstrap registra los paquetes gRPC y por defecto expone HTTP `3005` y gRPC `50059`. |
| BFF (`apps/bff`) | **Presente:** gateway NestJS, controladores REST, cliente gRPC y configuración Swagger en `/api/docs` cuando está habilitada. Puerto por defecto `3006`. |
| Frontend (`frontend`) | **Presente:** Next.js App Router; 99 archivos fuente `page.tsx`. Este número no certifica rutas accesibles ni flujos operativos. |
| Contratos | **Presente:** 34 archivos `.proto` en `packages/contracts/grpc`, incluido `common.proto`. |
| Datos | **Presente parcialmente:** esquemas Drizzle y migraciones en `packages/database`; no se localizaron políticas SQL explícitas de RLS en los esquemas/migraciones revisados. No se ejecutaron las migraciones. |
| Eventos | **Presente parcialmente:** servicios Outbox y consumidores NATS en el código, junto con pruebas. La conexión con broker, entrega en producción, DLQ y recuperación no se verificaron en ejecución. |
| Pruebas | **Inventario:** 126 archivos de prueba API, 40 BFF y 13 E2E Playwright. Son archivos, no cantidad de casos ni resultados. |
| CI | **Configurado:** el workflow valida typecheck, lint, tests y build backend/paquetes; frontend typecheck y build. No ejecuta `frontend` E2E. El estado de la última ejecución no se consultó. |

## Hitos y estado actual

### Hito 1: Monolito modular

- **Presente en código:** módulos bajo `apps/api/src/modules/`, contratos públicos y registro de servicios gRPC.
- **Pendiente de auditoría:** cumplimiento real de límites entre módulos, límite de líneas por archivo, propiedad exclusiva de tablas y ausencia de joins entre contextos. Las reglas están descritas en [BACKEND-RULES.md](./BACKEND-RULES.md) y [refactorizacion.md](./refactorizacion.md), pero este inventario no demuestra su aplicación completa.

### Hito 2: BFF y frontend

- **Presente en código:** BFF REST con cliente gRPC, páginas de Next.js y pruebas E2E de Playwright.
- **Pendiente de validación:** flujos completos contra servicios reales. Playwright está disponible como `cd frontend && pnpm test:e2e`, pero no forma parte del workflow de CI actual.

### Hito 3: Escalabilidad y observabilidad avanzada

- **Parcialmente presente:** hay `LatencyTracker`, `MetricsService` y un interceptor de logging estructurado que genera identificadores `trace_id` y `span_id`.
- **No localizado en el código revisado:** instrumentación OpenTelemetry, exportador Prometheus, dashboard Grafana o pruebas k6. Deben considerarse pendientes, no capacidades implementadas.
- **Pendiente:** añadir E2E del frontend al pipeline, si se decide que CI los ejecute.

## Comandos definidos

- `pnpm dev` — tareas de desarrollo de workspace configuradas en Turborepo.
- `pnpm build`, `pnpm typecheck`, `pnpm lint`, `pnpm test` — comandos de workspace.
- `make db-up`, `make db-migrate`, `make db-seed`, `make db-reset` — tareas de base de datos.
- `make docker-up` — levanta la infraestructura local usando los Compose separados en `compose/<servicio>/docker-compose.yml` (no API, BFF ni frontend).
- `docker compose -f docker-compose.dev.yml up -d` — levanta la infraestructura de desarrollo alternativa.
- `cd frontend && pnpm test:e2e` — pruebas E2E de frontend; no están incluidas en CI.

Los hitos anteriores y cualquier etiqueta «completado» de versiones previas deben leerse como objetivos históricos hasta que exista una ejecución o auditoría fechada que los respalde.
