# Estado técnico de implementación

Este documento describe lo que está presente en el repositorio; no sustituye una validación de despliegue ni certifica que cada función esté operativa en producción. Los inventarios son una fotografía del código y deben actualizarse cuando cambien módulos, rutas o pruebas.

## Arquitectura actual

El repositorio está organizado como monorepo con pnpm y Turborepo:

- **API (`apps/api`)**: aplicación NestJS que reúne los módulos de negocio. Por defecto expone HTTP en `3005` y gRPC en `50059`; ambos puertos se pueden configurar por entorno.
- **BFF (`apps/bff`)**: gateway HTTP/REST que usa gRPC para comunicarse con la API. Por defecto escucha en `3006`; Swagger se configura en `/api/docs` cuando está habilitado.
- **Frontend (`frontend`)**: aplicación Next.js con App Router; el paquete declara Next.js 16 y React 19.
- **Contratos (`packages/contracts/grpc`)**: 34 archivos `.proto`, incluyendo el contrato común.
- **Persistencia e infraestructura (`packages/database`, `packages/shared`)**: esquemas/migraciones y utilidades compartidas. La arquitectura documentada también contempla PostgreSQL, Redis, NATS JetStream y el patrón Outbox; la configuración efectiva depende del entorno.

En la revisión de esquemas y migraciones no se localizaron políticas SQL explícitas de Row-Level Security (RLS). `tenant_id` por sí solo no demuestra aislamiento de base de datos; verificar las políticas antes de afirmar cumplimiento RLS.

Guías relacionadas: [README.md](./README.md), [BACKEND-RULES.md](./BACKEND-RULES.md) y [refactorizacion.md](./refactorizacion.md).

## Módulos de la API

Hay **33 directorios de módulos** bajo `apps/api/src/modules/`, cada uno con un archivo `module.public-api.ts`:

`affiliates`, `ai`, `analytics`, `audit`, `auth`, `automation`, `campaigns`, `companies`, `contacts`, `contracts`, `cpq`, `customer-360`, `developer`, `helpdesk`, `iam`, `inbox`, `interactions`, `knowledge-base`, `lead-scoring`, `loyalty`, `meta-leads`, `notifications`, `personal-crm`, `pipelines`, `sales-teams`, `scheduler`, `social-inbox`, `storage`, `support-tickets`, `tags`, `tenants`, `users` y `web-forms`.

El servidor gRPC registra paquetes para estos contextos además de `crm.common`; en el repositorio hay 34 archivos `.proto` contando el contrato común. La existencia de un módulo o contrato no implica que todas sus operaciones estén completas ni que todas las reglas arquitectónicas estén verificadas automáticamente.

## Superficie del frontend

El árbol `frontend/app` contiene **99 archivos `page.tsx`**. Es un recuento de páginas fuente, no necesariamente de rutas públicas únicas ni una comprobación de que cada pantalla funcione de extremo a extremo.

## Pruebas y automatización

Inventario de archivos de prueba encontrados en el repositorio:

| Área | Archivos de prueba |
|---|---:|
| API (`apps/api/src`) | 126 |
| BFF (`apps/bff/src`) | 40 |
| E2E del frontend (`frontend/e2e`) | 13 |

Estos números cuentan archivos `*.spec.ts` / `*.test.ts` en backend y BFF, y `*.spec.ts` en E2E; **no** son números de casos individuales ni resultados de ejecución.

El workflow [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) define typecheck, lint, pruebas y build para backend/paquetes, además de typecheck y build de producción para el frontend. La definición del workflow no confirma que la última ejecución haya pasado. El frontend también declara `pnpm test:e2e`, pero el workflow actual no ejecuta ese comando.

Comandos disponibles en la raíz:

- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm build`

Para E2E del frontend: `cd frontend && pnpm test:e2e`.

## Situación y próximos pasos

- La base funcional y la estructura modular son amplias; este documento no asigna porcentajes de completitud porque no se ha auditado cada caso de uso.
- Ejecutar y registrar los resultados actuales de CI y de las pruebas E2E antes de afirmar que los checks están en verde.
- Verificar en un entorno desplegado los flujos críticos, integraciones y controles multi-tenant; la presencia de configuración o pruebas no demuestra por sí sola el comportamiento operativo.
- Mantener sincronizados los inventarios de módulos, páginas y contratos cuando cambie el código.
