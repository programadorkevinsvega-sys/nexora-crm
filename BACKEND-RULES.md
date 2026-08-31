# Reglas Estrictas de Arquitectura — Monolito Modular
## DDD + Clean Architecture + Hexagonal + SOLID

> **Propósito de este documento:** Contrato de arquitectura obligatorio que debe respetarse en TODO momento al crear o modificar código en este proyecto.

---

## 0. Objetivo Estratégico

Este es un **Monolito Modular preparado para fisión a microservicios**:
- Cada módulo/bounded context se comporta como si ya fuera un microservicio, pero se ejecuta y despliega en un proceso unificado ([`apps/api`](file:///home/servidor-nitro/ARCHIVOS-KEVINS/NUEVO/DESARROLLO/crm/crm-service/apps/api)).
- **Ningún módulo importa código interno de otro módulo directamente.**
- La comunicación síncrona entre el BFF y el backend se realiza vía **gRPC**.
- La comunicación entre el Frontend y el BFF se realiza vía **HTTP fetch / REST**.
- La comunicación asíncrona entre módulos se realiza vía **NATS JetStream** mediante el **Transactional Outbox Pattern**.

---

## 1. Topología del Monorepo

```text
crm-service/
├── apps/
│   ├── api/                     # Monolito Modular (NestJS — 21 Bounded Contexts)
│   │   └── src/modules/<domain>/
│   │       ├── domain/          # Entidades puras, Value Objects, Eventos, Repositorios (Interfaces)
│   │       ├── application/     # Casos de uso (1 por archivo), DTOs, Mappers, Ports (In/Out)
│   │       ├── infrastructure/  # Repositorios Drizzle, Grpc Controllers, NATS Outbox/Inbox
│   │       ├── module.config.ts # Composición e inyección de dependencias de NestJS
│   │       └── module.public-api.ts # ÚNICO punto de exportación pública del módulo
│   └── bff/                     # API Gateway BFF (NestJS — REST + Swagger + gRPC Client)
├── packages/
│   ├── contracts/               # Contratos gRPC Protobuf (.proto) + Esquemas Zod
│   ├── database/                # Drizzle ORM schemas, migraciones y pool PostgreSQL
│   ├── iam/                     # JWT Guards, Permission Guard y decoradores RBAC
│   └── shared/                  # Clases base DDD (DomainEvent, AggregateRoot, ValueObject)
└── frontend/                    # Aplicación Next.js 16 (React 19 + TailwindCSS)
```

---

## 2. Reglas de Estilo y Código No Negociables

1. **Límite de 200 líneas por archivo:**
   - Ningún archivo de código fuente puede superar 200 líneas (excluyendo comentarios y líneas en blanco).
   - Si un archivo se acerca a 200 líneas, DEBE dividirse (ej. separar casos de uso, mappers o Value Objects).

2. **Un elemento público por archivo (SRP estricto):**
   - 1 archivo = 1 clase / 1 caso de uso / 1 entidad / 1 evento / 1 puerto.
   - Prohibido crear archivos tipo bolsa como `handlers.ts`, `types.ts` o `utils.ts`.

3. **Independencia Absoluta de Módulos:**
   - Prohibido importar rutas relativas hacia dentro de otro módulo (ej. `import ... from '../users/domain/...'` es ILEGAL).
   - Para consumir funcionalidad de otro módulo, se debe hacer mediante su `module.public-api.ts` o vía gRPC / NATS.

4. **Dominio Puro (POJOs / POTS):**
   - Las entidades en `domain/entities/` y Value Objects en `domain/value-objects/` son TypeScript puro.
   - Prohibido usar decoradores de ORM, NestJS o dependencias de infraestructura en la capa de dominio.

5. **Aislamiento de Base de Datos:**
   - Cada repositorio de infraestructura interactúa únicamente con las tablas de su bounded context.
   - Prohibido realizar `JOIN`s SQL entre tablas de diferentes bounded contexts.

6. **Outbox Pattern para Eventos Asíncronos:**
   - Al mutar el estado del dominio, los eventos de dominio se registran en la tabla `outbox_events` de forma transaccional.
   - El worker `OutboxPublisherService` despacha los eventos pendientes a NATS JetStream bajo el subject `crm.<aggregate>.<event>`.
   - Los consumidores de eventos deben ser idempotentes, deduplicar por `eventId` y derivar a Dead Letter Queue (DLQ) en caso de fallos reiterados.

---

## 3. Catálogo de los 21 Bounded Contexts

| Bounded Context | Responsabilidad Principal |
|---|---|
| `auth` | Autenticación, JWT, MFA/TOTP, recuperación de contraseñas y sesiones Redis. |
| `users` | Identidades, usuarios, perfiles de persona natural, jurídica y dispositivos. |
| `tenants` | Aprovisionamiento multi-tenant, dominios personalizados, marcas y configuración. |
| `iam` | Control de acceso basado en roles (RBAC), permisos granulares y asignaciones. |
| `contacts` | Gestión integral de contactos, clasificación, estados de lead y relaciones. |
| `companies` | Directorio de empresas, cuentas comerciales y jerarquías organizacionales. |
| `pipelines` | Pipelines de ventas, etapas, embudos y gestión de tratos (deals). |
| `interactions` | Registro de llamadas, notas, tareas y seguimiento comercial. |
| `support-tickets` | Tickets de soporte al cliente, prioridades, estados y respuestas. |
| `campaigns` | Campañas de marketing, segmentos, presupuestos y conversiones. |
| `contracts` | Contratos de clientes, cotizaciones y firmas. |
| `sales-teams` | Equipos de ventas, cuotas comerciales y asignación de metas. |
| `loyalty` | Programas de fidelización, acumulación y canje de puntos. |
| `affiliates` | Programas de afiliados, comisiones y seguimiento de referidos. |
| `helpdesk` | Mesa de ayuda compartida, buzones de correo, agentes y conversaciones. |
| `personal-crm` | Registro de fechas importantes, regalos, eventos de vida y relaciones. |
| `tags` | Sistema centralizado de etiquetas polimórficas para categorización. |
| `notifications` | Envío multicanal de notificaciones (Email vía SES/Resend, Push vía FCM, SMS). |
| `audit` | Registro de auditoría inmutable de actividades y trazabilidad del sistema. |
| `storage` | Gestión de archivos y multimedia con almacenamiento en Cloudflare R2. |
| `scheduler` | Motor de tareas programadas (cron), recordatorios automáticos y control de SLAs. |
