# Invitaciones seguras de miembros por tenant (P0.4)

## Alcance

Este flujo permite que un administrador de una empresa invite a miembros reales del mismo tenant, seleccione un rol local y permita que la persona cree su contraseña. No forma parte de la administración interna de plataforma. Las invitaciones se almacenan en el bounded context `users`, los cambios de roles pertenecen a IAM y el envío de correo utiliza Notifications.

## Contratos HTTP del BFF

Los endpoints administrativos requieren una sesión CRM válida y autorización actual de administrador del tenant:

| Método | Ruta | Función |
| --- | --- | --- |
| POST | `/api/tenant/team/invitations` | Crea la invitación y envía el enlace |
| GET | `/api/tenant/team/invitations` | Lista las invitaciones del tenant |
| POST | `/api/tenant/team/invitations/:id/resend` | Rota el token y vuelve a enviar |
| DELETE | `/api/tenant/team/invitations/:id` | Revoca una invitación pendiente o vencida |

Cuerpo de creación:

```json
{ "email": "member@example.com", "roleId": "UUID-del-rol-del-tenant" }
```

La respuesta de creación contiene el registro público y `emailSent`; nunca devuelve el token.

Los endpoints públicos de aceptación son limitados por tasa y no exponen el token en las URLs HTTP:

| Método | Ruta | Función |
| --- | --- | --- |
| POST | `/api/team-invitations/preview` | Valida el token y devuelve email/expiración |
| POST | `/api/team-invitations/accept` | Prepara la cuenta, asigna rol y activa al miembro |

El token se transporta desde el correo como fragmento `#token=...`; el navegador lo elimina de la barra de direcciones inmediatamente y lo envía en el cuerpo del POST.

## Estados de invitación

- `PENDING`: creada y disponible hasta su expiración.
- `ACCEPTING`: el enlace fue reclamado y se creó un usuario INACTIVE; IAM todavía debe confirmar el rol y la aceptación puede reintentarse con el mismo token.
- `ACCEPTED`: IAM asignó el rol y la cuenta quedó ACTIVE con email verificado.
- `REVOKED`: invalidada por un administrador; su hash de token se elimina.
- `EXPIRED`: venció; la lista o una nueva invitación actualiza el estado.

El token contiene 256 bits aleatorios. En la tabla se conserva únicamente su SHA-256. La expiración predeterminada es siete días. El índice único parcial impide dos invitaciones PENDING/ACCEPTING para el mismo correo y tenant.

## Secuencia de aceptación y recuperación

1. La persona abre el enlace del correo y consulta la vista previa usando un POST.
2. Introduce nombre, apellido y contraseña. El servidor aplica mínimo de 12 caracteres y requisitos de mayúscula, minúscula, número y símbolo; la contraseña se hashea con bcrypt.
3. Una transacción reclama el token y crea el perfil y el usuario con estado INACTIVE.
4. IAM asigna el rol validado dentro del mismo tenant.
5. Sólo después de que IAM responde correctamente, otra transacción marca el usuario ACTIVE, verifica su correo y marca la invitación ACCEPTED.

Si el proceso falla después de reclamar el token, el registro permanece ACCEPTING y conserva el usuario preparado; reintentar no crea otro usuario ni cambia el identificador. El usuario podrá iniciar sesión con las credenciales introducidas al preparar la cuenta una vez que la aceptación termine.

## Protección del token en correo y registros

- La base de datos de invitaciones sólo guarda `token_hash`.
- Los eventos Outbox de invitaciones contienen metadatos, nunca el token.
- Notifications usa `SendTransientEmail`: el proveedor recibe el mensaje real, mientras la cola y los logs guardan un cuerpo redactado.
- El enlace lleva el token en el fragmento, que no se envía en la petición HTTP ni en el encabezado Referer.
- La respuesta BFF sólo expone `emailSent`, no el enlace ni el token.
- Reenviar rota el hash; el enlace anterior queda invalidado.

La entrega de correo depende de la configuración externa del proveedor. Cuando `emailSent=false`, la invitación queda creada, pero el administrador debe revisar el proveedor y usar Reenviar.

## Último administrador

Las mutaciones de roles que podrían retirar la última asignación `admin` se serializan con `pg_advisory_xact_lock(hashtextextended(tenantId, 0))` dentro de IAM. La regla se aplica en repositorio, no sólo en el BFF: reemplazo, eliminación y asignación de roles, además de borrado o renombrado del rol administrador. Una transacción concurrente vuelve a evaluar las asignaciones después de obtener el bloqueo.

## Migración y configuración de despliegue

La migración nueva es:

`packages/database/src/migrations/0038_tenant_member_invitations.sql`

El runner del proyecto aplica los archivos SQL ordenados y registra cada nombre en `public.crm_schema_migrations`:

```bash
pnpm --filter @crm/database db:migrate
```

Configurar en el entorno del BFF:

- `APP_PUBLIC_URL`: origen público de la aplicación, por ejemplo `https://crm.example.com`. En producción el código exige HTTPS.
- `EMAIL_PROVIDER` y sus credenciales (por ejemplo `RESEND_API_KEY` o credenciales de SES).
- `EMAIL_FROM`: remitente permitido por el proveedor.

No desplegar el flujo de invitaciones a producción hasta configurar y verificar esas variables y aplicar la migración.

## Verificación recomendada

- Invitar a una dirección nueva en tenant A y comprobar que aparece sólo en ese tenant.
- Intentar invitar dos veces el mismo correo en el mismo tenant; la segunda operación debe devolver conflicto.
- Aceptar con enlace vigente y comprobar el estado ACTIVE, email verificado y rol correcto.
- Reutilizar el mismo enlace después de ACCEPTED; debe fallar.
- Reenviar una invitación y comprobar que el enlace anterior deja de funcionar.
- Revocar una invitación y comprobar que el token deja de resolver.
- Esperar o simular expiración y comprobar que no puede aceptarse.
- Provocar fallo temporal de IAM después de crear la cuenta INACTIVE y reintentar con el mismo enlace; debe completarse sin duplicar la cuenta.
- Intentar degradar, quitar, eliminar o renombrar el rol admin mientras es la única asignación; IAM debe rechazarlo, incluso con dos operaciones concurrentes.
- Confirmar en la base de datos y en logs que ni el token ni el enlace completo aparecen en invitaciones, Outbox, queue o notification logs.
