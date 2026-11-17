# Repository Guidelines

## Project Structure & Module Organization
This repository is a `pnpm` + Turborepo monorepo structured as a **Modular Monolith (DDD + Clean Architecture + Hexagonal + SOLID)**.
- `apps/api`: The unified Modular Monolith currently containing 33 modules under `src/modules/<bounded-context>/`. Exposes HTTP (default port 3005) and unified gRPC (default port 50059); both are configurable.
- `apps/bff`: Backend-For-Frontend API Gateway (default port 3006). Receives HTTP fetch / REST from the frontend and communicates via gRPC with `apps/api`. Exposes OpenAPI / Swagger at `/api/docs` when enabled.
- `packages/*`: Shared internal libraries (`@crm/contracts`, `@crm/database`, `@crm/shared`, `@crm/iam`).
- `frontend/`: Standalone Next.js 16 application (port 3000) using React 19, Tailwind CSS, and layered architecture (`src/{domain,infrastructure,presentation}`).

These are repository structure and architecture intentions, not a claim that every rule or feature has been independently audited or is running in production. Do not label an implementation complete without checking its source and relevant tests.

## Strict Architectural Rules (Non-Negotiable)
1. **Module Independence:** Zero cross-module internal imports. A module may only interact with another module via its `module.public-api.ts` or gRPC / NATS JetStream.
2. **File Size Limit:** Maximum 200 lines per file (excluding comments/blank lines).
3. **Single Responsibility:** Exactly 1 class, use case, domain entity, event, or interface per file.
4. **Pure Domain Entities:** Domain entities & Value Objects must be pure TypeScript (POJOs/POTS) with no framework decorators or ORM imports.
5. **Database Isolation:** Each bounded context interacts exclusively with its own tables. Cross-module SQL `JOIN`s are strictly forbidden.
6. **Outbox Pattern:** Asynchronous cross-module events must use the transactional Outbox Pattern (`outbox_events`) published to NATS JetStream (`crm.<aggregate>.<event>`).

## Build, Test, and Development Commands
- `pnpm dev`: Run Turborepo dev tasks across workspace services.
- `pnpm dev:api`, `pnpm dev:bff`: Run focused dev pipelines.
- `pnpm build`: Build all workspace packages with Turborepo.
- `pnpm lint`: Run ESLint across workspace packages.
- `pnpm typecheck`: Run strict TypeScript check across workspace packages.
- `pnpm test`: Run Jest unit tests across all services.
- `make db-up`, `make db-reset`, `make db-migrate`, `make db-seed`: Database lifecycle shortcuts.
- `cd frontend && pnpm dev`: Run frontend Next.js locally.

## Coding Style & Naming Conventions
- TypeScript is strict (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`).
- Prettier (`.prettierrc`): 2 spaces, single quotes, no semicolons, trailing commas, 120 char width.
- ESLint (`.eslintrc.json`): unused vars warn (prefix with `_` if intentional), `any` warns.
- File naming: kebab-case with clear suffixes (e.g. `contacts.controller.ts`, `CreateContactUseCase.ts`, `DrizzleContactRepository.ts`, `module.public-api.ts`).

## Security & Configuration Tips
- Use `.env.example` as template; keep real secrets in `.env.local` or `.env`.
- Never commit credentials (`JWT_SECRET`, `INTERNAL_API_KEY`, R2/Cloud keys).
- The data model is tenant-aware (`tenant_id`). Do not claim RLS is enforced end-to-end unless database policies and tenant-isolation tests have been verified.
