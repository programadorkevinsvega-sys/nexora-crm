# 🔑 Guía de Usuario y Credenciales de Prueba

Este documento contiene la información de acceso, credenciales de prueba y endpoints para interactuar con la plataforma CRM.

---

## 🏢 Inquilino Demo (Multi-Tenant)

| Campo | Valor |
|---|---|
| **Tenant ID** | `00000000-0000-0000-0000-000000000001` |
| **Nombre** | Ultra ERP Demo |
| **Razón Social** | Ultra ERP Solutions S.A.S. |
| **Estado** | Activo |

Estos datos coinciden con el seed actual de `packages/database/src/seed/seed-extended.ts`.

---

## 👥 Usuarios de Prueba (Seed Demo)

| Email | Contraseña | Rol IAM | Nivel de Acceso |
|---|---|:---:|---|
| `demo@nexoracrm.com` | `Password123!` | **admin** | Usuario demo del seed. |
| `admin@nexoracrm.com` | `Password123!` | **admin** | Usuario administrador del seed. |
| `sarah.connor@nexoracrm.com` | `Password123!` | **manager** | Usuario manager del seed. |
| `alex.mercer@nexoracrm.com` | `Password123!` | **agent** | Usuario agente del seed. |
| `elena.rostova@nexoracrm.com` | `Password123!` | **agent** | Usuario agente del seed. |

Los usuarios y la contraseña se verificaron en `packages/database/src/seed/seed.ts`. Son credenciales únicamente para desarrollo/demo; nunca usarlas en producción.

---

## 🌐 URLs y Endpoints del Sistema

* **Frontend Web (Next.js):** [http://localhost:3000](http://localhost:3000)
* **Documentación Interactiva API (Swagger / OpenAPI):** [http://localhost:3006/api/docs](http://localhost:3006/api/docs)
* **API Gateway BFF (REST):** [http://localhost:3006/api](http://localhost:3006/api)
* **Backend Monolito Modular (gRPC):** `localhost:50059`
* **MailHog (Bandeja de correos de prueba):** [http://localhost:8025](http://localhost:8025)

---

## 🛠️ Comandos Frecuentes

```bash
# 1. Aplicar migraciones y datos de prueba
make db-up

# 2. Resetear base de datos completa desde cero
make db-reset

# 3. Abrir visor de tablas Drizzle Studio
make db-studio
```
