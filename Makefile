.PHONY: help db-up db-migrate db-seed db-reset db-studio db-truncate dev dev-api dev-bff build lint typecheck test docker-up docker-down docker-dev-up docker-dev-down

COMPOSE_FILES = \
	-f compose/postgres/docker-compose.yml \
	-f compose/redis/docker-compose.yml \
	-f compose/nats/docker-compose.yml \
	-f compose/mailhog/docker-compose.yml

help:
	@echo '┌──────────────────────────────────────────────────────────┐'
	@echo '│ CRM Platform — Comandos de Desarrollo (Monolito Modular) │'
	@echo '├──────────────────────────────────────────────────────────┤'
	@echo '│ make dev             → Levanta apps/api y apps/bff       │'
	@echo '│ make build           → Build de todo el monorepo         │'
	@echo '│ make test            → Ejecuta pruebas unitarias         │'
	@echo '│ make typecheck       → TypeScript strict check           │'
	@echo '│ make lint            → Validación ESLint                 │'
	@echo '│ make db-up           → Migraciones + seed de datos       │'
	@echo '│ make db-reset        → Truncate + db-up (reset total)    │'
	@echo '│ make db-migrate      → Solo migraciones Drizzle          │'
	@echo '│ make db-seed         → Solo carga de datos demo          │'
	@echo '│ make db-studio       → Abre Drizzle Studio en navegador  │'
	@echo '│ make docker-up       → Levanta todo el stack (Docker)    │'
	@echo '│ make docker-down     → Detiene el stack (Docker)         │'
	@echo '│ make docker-dev-up   → Levanta Postgres/Redis/NATS local │'
	@echo '│ make docker-dev-down → Detiene infraestructura local     │'
	@echo '└──────────────────────────────────────────────────────────┘'

dev:
	pnpm dev

dev-api:
	pnpm --filter api dev

dev-bff:
	pnpm --filter bff dev

start:
	pnpm start

start-api:
	pnpm start:api

start-bff:
	pnpm start:bff

build:
	pnpm build

test:
	pnpm test

lint:
	pnpm lint

typecheck:
	pnpm typecheck

db-up:
	pnpm db:migrate
	pnpm db:seed

db-reset:
	pnpm db:truncate
	pnpm db:migrate
	pnpm db:seed

db-migrate:
	pnpm db:migrate

db-seed:
	pnpm db:seed

db-truncate:
	pnpm db:truncate

db-studio:
	pnpm db:studio

docker-up:
	docker compose $(COMPOSE_FILES) up -d

docker-down:
	docker compose $(COMPOSE_FILES) down
