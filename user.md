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

---

## 👥 Usuarios de Prueba (Seed Demo)

| Email | Contraseña | Rol IAM | Nivel de Acceso |
|---|---|:---:|---|
| `admin@example.com` | `seedpassword123` | **admin** | Acceso administrativo completo y configuración. |
| `manager@example.com` | `seedpassword123` | **manager** | Gestión de equipos comerciales, campañas y reportes. |
| `employee@example.com` | `seedpassword123` | **agent** | Atención de tickets de soporte y gestión de contactos. |
| `company@example.com` | `seedpassword123` | **viewer** | Vista de solo lectura para auditorías y consultas. |

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
