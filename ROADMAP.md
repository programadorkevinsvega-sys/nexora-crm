# 🗺️ Roadmap y Estado del Proyecto: `crm-service`

**Stack:** Node.js 20, NestJS 10, Next.js 16 (React 19 + Tailwind CSS), Drizzle ORM, PostgreSQL 16+, Redis 7, NATS JetStream, Cloudflare R2, Zod.

**Arquitectura:** Monolito Modular (DDD + Clean Architecture + Hexagonal + SOLID), comunicación vía gRPC unificado (`:50059`), Gateway BFF (`:3006`) con REST/Swagger, y NATS JetStream con Transactional Outbox Pattern.

---

## 📊 Matriz de Estado

| Componente | Estado | Detalle |
|---|:---:|---|
| **Monolito Modular (`apps/api`)** | ✅ 100% | 21 Bounded Contexts consolidados con contratos `module.public-api.ts` y servidor gRPC unificado. |
| **API Gateway (`apps/bff`)** | ✅ 100% | Gateway REST con Swagger en `/api/docs`, caché Redis y cliente gRPC hacia `apps/api`. |
| **Frontend CRM (`frontend`)** | ✅ 100% | Next.js 16 App Router con 34 rutas operativas, React Query y Tailwind CSS. |
| **Contratos & gRPC Protos** | ✅ 100% | 22 definiciones `.proto` en `@crm/contracts` alojadas en el puerto 50059. |
| **Persistencia & RLS** | ✅ 100% | Esquemas Drizzle ORM, aislamiento multi-tenant por RLS y migraciones automáticas. |
| **Outbox & NATS JetStream** | ✅ 100% | Despachador transaccional y consumidores reactivos con DLQ. |
| **Pruebas Automatizadas** | ✅ 100% | 8 suites de tests unitarios y 51 pruebas pasando en verde. |

---

## 🎯 Hitos Completados y Próximos Pasos

### ✅ Hito 1: Monolito Modular y Consolidación DDD (Completado)
- [x] Consolidación de todos los microservicios en `apps/api/src/modules/`.
- [x] Estandarización de `module.public-api.ts` en los 21 bounded contexts.
- [x] Límite estricto de $\le 200$ líneas por archivo y 1 clase/caso de uso por archivo.
- [x] Aislamiento de base de datos y prohibición de cross-module SQL joins.
- [x] Registro centralizado de los 22 contratos gRPC en el puerto 50059.

### ✅ Hito 2: Gateway BFF y Optimización Frontend (Completado)
- [x] Unificación del cliente gRPC del BFF hacia el puerto 50059 del backend.
- [x] Compilación standalone y optimización Turbopack en Next.js.
- [x] Limpieza de dependencias y lockfiles obsoletos.

### 🚀 Hito 3: Escalabilidad y Observabilidad Avanzada (En Roadmap)
- [ ] Telemetría distribuida con OpenTelemetry (trazabilidad BFF -> gRPC -> Outbox).
- [ ] Métricas Prometheus y dashboard Grafana para monitoreo de latencia y cola NATS.
- [ ] Pipeline CI/CD con pruebas de integración E2E automatizadas.
