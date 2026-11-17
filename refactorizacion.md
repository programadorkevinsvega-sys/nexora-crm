# Reglas Estrictas de Arquitectura — Monolito Modular
## DDD + Clean Architecture + Hexagonal + SOLID

> **Propósito de este documento:** este archivo es el contrato de arquitectura que debe respetarse en TODO momento al crear o modificar código en este proyecto. Debe entregarse como contexto/system prompt a cualquier agente (Claude, Codex, Copilot, etc.) antes de generar código. Ninguna regla aquí es "sugerencia": son restricciones obligatorias. Si una petición del usuario contradice una regla, el agente debe señalarlo antes de generar código que la viole.

> **Importante:** este documento mezcla reglas objetivo con un inventario histórico. Las reglas son criterios de diseño, no prueba de que el código actual cumpla cada una. La sección 19 se actualiza con inventario de archivos; las coberturas y ejecuciones solo se consideran confirmadas cuando se adjuntan resultados reproducibles y fechados.

---

## 0. Objetivo estratégico (léelo primero)

Este es un **monolito modular preparado para fisión a microservicios**. Eso significa:

- Cada módulo/bounded context se comporta como si ya fuera un microservicio, solo que se despliega junto a los demás.
- **Ningún módulo importa código interno de otro módulo directamente.** La única comunicación permitida entre módulos es a través de: (a) el contrato público del módulo (`public-api`, expuesto técnicamente como servicio **gRPC**), o (b) eventos de dominio publicados en **NATS JetStream**.
- Si en el futuro un módulo se extrae a microservicio, el cambio debe limitarse a: mover la carpeta, desplegar su servicio gRPC en su propio proceso/host y ajustar el `docker-compose`/deployment. **La lógica de dominio y aplicación NO debe tocarse**, porque el contrato gRPC y los eventos NATS ya se comportan como remotos desde el día uno.
- Por eso: trata cada carpeta bajo `modules/<nombre>` como un "servicio en potencia" con su propio dominio, aplicación, infraestructura y puertos de entrada/salida.
- **Capas de la arquitectura completa (de afuera hacia adentro):**
  1. **Frontend** (web/mobile): sin lógica de negocio. Solo consume los endpoints **REST (HTTP fetch)** del BFF.
  2. **BFF (REST API Gateway)**: sin lógica de negocio. Adapta y compone respuestas REST, comunicándose con los módulos exclusivamente por **gRPC**.
  3. **Módulos del monolito modular**: únicos dueños de su lógica de negocio, dominio, casos de uso y persistencia. Exponen su `public-api` como servicio **gRPC** y se comunican entre sí de forma asíncrona vía **NATS JetStream**.
  - El detalle completo de esta capa BFF/REST/Frontend está en la sección 9.
- **Nombres de módulos siempre genéricos en este documento** (`module-a`, `module-b`, `module-c`...). Este documento es un contrato de arquitectura reutilizable entre proyectos — nunca se ata a un dominio de negocio específico. En el proyecto real, usa los nombres de negocio reales, pero mantén la misma disciplina de límites entre módulos.

### 0.1 Diagrama canónico de la arquitectura

Este es el diagrama de referencia obligatorio. Cualquier código generado debe ser consistente con esta forma:

```
Frontend
   │
   │ HTTP fetch / REST
   ▼
 BFF
   │
   │ gRPC
   ▼
┌────────────────────────────────┐
│        Monolito Modular         │
│                                  │
│ module-a   module-b   module-c  │
│    │           │           │    │
│   DB          DB          DB    │
│    │           │           │    │
│    └───────────┴───────────┘    │
│                │                 │
│          NATS JetStream          │
└────────────────────────────────┘
```

### 0.2 Responsabilidad de cada componente (contrato fijo, no se mezcla)

| Componente | Responsabilidad única |
|---|---|
| **Frontend** | UI/presentación. Sin lógica de negocio (sección 9). |
| **BFF (REST Gateway)** | Adaptación y composición de respuestas REST para el frontend. Sin lógica de negocio (sección 9). |
| **gRPC** | Contrato síncrono entre BFF↔módulos y entre módulos entre sí (secciones 3 y 9). |
| **Módulo** | Dueño exclusivo de su lógica de negocio: dominio, casos de uso y persistencia (secciones 1-8). |
| **DB** | Fuente de verdad de cada módulo — una DB/schema por módulo, nunca compartida (sección 6). |
| **Redis** | Cache, proyecciones de lectura o estado técnico (locks, rate limiting) según corresponda — nunca fuente de verdad de negocio (sección 7). |
| **NATS JetStream** | Comunicación asíncrona entre módulos — eventos de dominio/integración (sección 8). |
| **OpenTelemetry** | Tracing y métricas distribuidas de extremo a extremo, en todas las capas (sección 12). |
| **k6** | Pruebas de rendimiento y carga sobre operaciones críticas (sección 15). |
| **Chaos Engineering** | Validación activa de resiliencia del sistema ante fallos reales (sección 17). |

Ninguna de estas responsabilidades se invierte ni se mezcla: el Frontend nunca decide reglas de negocio, el BFF nunca las implementa, y un módulo nunca delega su lógica a otra capa.

---

## 1. Principios SOLID — aplicación obligatoria

| Principio | Regla obligatoria en este proyecto |
|---|---|
| **S**RP | Una clase/función = una razón para cambiar. Prohibido "manager", "helper" o "util" genéricos que mezclen responsabilidades. Casos de uso (`UseCase`) hacen UNA sola acción de negocio. |
| **O**CP | Extender comportamiento mediante nuevas implementaciones de puertos/interfaces, nunca modificando código existente con `if/switch` de tipos. Usar patrones Strategy/Polymorphism. |
| **L**SP | Toda implementación de una interfaz de puerto debe ser sustituible sin romper el contrato (mismas precondiciones/postcondiciones). Prohibido lanzar excepciones no declaradas en el contrato del puerto. |
| **I**SP | Interfaces pequeñas y específicas por caso de uso (`IResourceReader`, `IResourceWriter`) en vez de una interfaz gorda (`IResourceRepository` con 20 métodos) cuando los consumidores no usan todo. |
| **D**IP | Las capas de dominio y aplicación **jamás** dependen de infraestructura concreta. Dependen de abstracciones (puertos) definidas en el dominio/aplicación. La infraestructura implementa esas abstracciones (inversión de dependencia real, no solo inyección). |

---

## 1.bis Límite de tamaño de archivo y "una función/clase por archivo"

Esta regla es tan obligatoria como SOLID y se verifica en cada archivo generado:

- **Máximo 200 líneas de código por archivo** (sin contar imports, comentarios de licencia ni líneas en blanco). Si un archivo se acerca a ese límite, es señal de que está violando SRP y debe dividirse — no se "estira" la regla, se refactoriza.
- **Un archivo = una función pública, una clase, un caso de uso, un componente o un hook.** No se permiten archivos "bolsa" con múltiples clases/funciones no relacionadas (`utils.ts` con 15 funciones sueltas está prohibido).
  - Excepciones válidas (y únicas): tipos/interfaces estrechamente acoplados a la clase principal del archivo (ej. el `Props` de un componente, el `Input`/`Output DTO` de un use case), constantes privadas usadas solo por esa función/clase, y funciones privadas auxiliares (`private`/no exportadas) que existen solo para descomponer la función principal y no se usan en ningún otro lugar.
  - Si una función auxiliar podría reutilizarse en más de un archivo, se **extrae a su propio archivo** con su propio nombre — no se deja "flotando" dentro de otro archivo ni se duplica.
- **Nombre de archivo = nombre de lo que exporta.** `ExecuteActionUseCase.ts` exporta `ExecuteActionUseCase`; `Email.ts` exporta el VO `Email`. Evita `index.ts` como contenedor de lógica (solo puede usarse como barrel de re-exports, sin lógica propia).
- Cuando un archivo supera 200 líneas, las estrategias de división correctas (en orden de preferencia) son:
  1. Extraer funciones privadas reutilizables o con su propia responsabilidad a archivos propios en la misma carpeta.
  2. Extraer sub-tipos/DTOs a su propio archivo dentro de `dto/` o `value-objects/` según corresponda.
  3. Si la clase/función realmente hace más de una cosa, dividir en dos casos de uso, dos servicios o dos componentes distintos (síntoma de violación de SRP, no solo de tamaño).
- Esta regla aplica a TODAS las capas: dominio, aplicación, infraestructura, controladores, componentes de UI, mappers, tests.

---

## 2. Regla de dependencias (Clean Architecture / Hexagonal)

```
        ┌─────────────────────────────────────────┐
        │           INFRASTRUCTURE (adapters)       │  ← DB, Redis, NATS, HTTP, CLI
        │  ┌─────────────────────────────────────┐  │
        │  │        APPLICATION (use cases)        │  │  ← orquesta, no contiene reglas de negocio complejas
        │  │  ┌─────────────────────────────────┐  │  │
        │  │  │           DOMAIN (core)           │  │  │  ← entidades, VOs, agregados, reglas puras
        │  │  └─────────────────────────────────┘  │  │
        │  └─────────────────────────────────────┘  │
        └─────────────────────────────────────────┘
```

**Regla de oro:** las flechas de dependencia (imports) SIEMPRE apuntan hacia adentro. El dominio no importa nada de aplicación ni de infraestructura. La aplicación no importa nada de infraestructura. La infraestructura importa e implementa lo que dominio/aplicación exponen como puertos.

- Prohibido: `import { PrismaClient } from '@prisma/client'` dentro de `domain/` o `application/`.
- Prohibido: entidades de dominio con decoradores de ORM (`@Entity`, `@Column`) — el dominio es POJO/POTS puro, sin dependencias de framework.
- Prohibido: lógica de negocio dentro de controladores, listeners de eventos o repositorios. Esas capas solo traducen/orquestan.
- El **mapeo** entre modelo de persistencia y entidad de dominio se hace SIEMPRE en infraestructura (mappers/adapters), nunca al revés.

---

## 3. Estructura de carpetas obligatoria (por módulo)

```
apps/
  bff/                                  # API Gateway REST — SIN lógica de negocio (ver sección 9)
    src/
      modules/
        <domain>/
          controllers/                  # controladores REST expuestos al frontend
          dto/                          # DTOs REST y schemas Zod
      common/
        grpc/                           # clientes gRPC tipados hacia cada módulo
    server.ts
  api/                                  # proceso que hostea los módulos del monolito
    main.ts

src/
  modules/
    <bounded-context>/                 # ej: module-a, module-b, module-c (nombres genéricos; usar dominio real en el proyecto)
      domain/
        entities/                      # entidades con identidad
        value-objects/                 # objetos de valor inmutables
        aggregates/                    # raíces de agregado + invariantes
        events/                        # domain events (internos al módulo)
        repositories/                  # INTERFACES (puertos de salida)
        services/                      # domain services (reglas que no pertenecen a 1 entidad)
        errors/                        # errores de dominio tipados
      application/
        use-cases/                     # 1 archivo = 1 caso de uso
        ports/
          in/                          # puertos de entrada (interfaces que exponen los use cases)
          out/                         # puertos de salida (interfaces: cache, publisher, notificador...)
        dto/                           # DTOs de entrada/salida de application
        mappers/                       # domain <-> dto
      infrastructure/
        persistence/
          <orm>/                       # implementación concreta (ej: prisma, typeorm, drizzle)
            entities/                  # modelos de persistencia (schema)
            repositories/              # implementan domain/repositories
            mappers/                   # persistence <-> domain
        cache/
          redis/                       # implementan application/ports/out (ICachePort)
        messaging/
          nats/
            publishers/                # implementan application/ports/out (IEventPublisher)
            subscribers/                # consumidores de eventos (entrantes)
            schemas/                    # contratos de evento (versión, payload)
        grpc/
          proto/                       # <modulo>.proto — contrato gRPC versionado (expone module.public-api)
          server/                      # implementación del servicio gRPC, adapta al use case correspondiente
          dto/                         # mapeo proto <-> application DTO
        http/                         # SOLO webhooks/health-checks/casos externos al BFF — nunca contrato principal
          controllers/
          dto/                         # request/response HTTP (NO reutilizar los DTO de application)
          validators/
      module.config.ts                 # composition root del módulo (wiring de DI)
      module.public-api.ts             # contrato lógico del módulo; se expone técnicamente vía infrastructure/grpc
  shared-kernel/                       # SOLO tipos/contratos verdaderamente compartidos (ver sección 8)
  platform/                            # infraestructura transversal (bootstrap, config, logger, tracing)
  main.ts
```

**Reglas de esta estructura:**
- Todo módulo expone su comunicación entrante ÚNICAMENTE vía `module.public-api.ts`, técnicamente materializado como servicio **gRPC** en `infrastructure/grpc`. Ningún otro módulo (ni el BFF) hace `import` de rutas internas (`../otro-modulo/domain/...`). Reforzar con linter de límites de arquitectura (ej. `eslint-plugin-boundaries`, `dependency-cruiser` o `nx module boundaries`).
- Si módulo A necesita datos de módulo B de forma síncrona, invoca el **mismo servicio gRPC** de B que también usa el BFF (un único contrato público por módulo, sin duplicar formas de exponerlo). Si la necesidad es asíncrona (reaccionar a algo que pasó en B), A se suscribe a los eventos de dominio que B publica en **NATS JetStream**. Nunca se accede a la base de datos ni a Redis de otro módulo.

---

## 4. Reglas de DDD

1. **Bounded Context primero.** Antes de escribir código, define el lenguaje ubicuo y los límites del contexto. Un mismo término (ej. "Cliente") puede significar cosas distintas en distintos módulos — está permitido y es deseable, no lo unifiques artificialmente.
2. **Entidades**: identidad estable (`id`), mutables mediante métodos de negocio explícitos (`recurso.desactivar()`), nunca setters genéricos (`recurso.setActive(false)`).
3. **Value Objects**: inmutables, se comparan por valor, se auto-validan en el constructor (ej. `Email`, `Money`, `DocumentId`). Prohibido representar VOs como `string`/`number` sueltos en las firmas de dominio.
4. **Agregados**:
   - Una raíz de agregado (`AggregateRoot`) es el único punto de entrada para modificar su árbol de objetos internos.
   - **Preferencia arquitectónica (no ley absoluta):** por defecto, un caso de uso modifica **un solo agregado por transacción** — es la forma más simple de mantener límites de consistencia fuertes y evitar acoplamiento oculto entre agregados. Prioriza resolver la necesidad de tocar varios agregados con **consistencia eventual vía eventos de dominio** siempre que el negocio lo tolere.
   - Existen casos legítimos donde una misma transacción debe involucrar más de un agregado dentro del mismo límite transaccional (ej. invariantes fuertes que el negocio no permite dejar temporalmente inconsistentes). En esos casos está permitido, siempre que: (a) ambos agregados pertenezcan al mismo módulo/bounded context — nunca a través de un límite de módulo, (b) la decisión esté documentada explícitamente en el código (comentario o ADR) explicando por qué la consistencia eventual no era aceptable, y (c) se evalúe primero si el diseño del agregado está mal delimitado (a veces la necesidad de tocar dos agregados a la vez es señal de que en realidad deberían ser uno solo).
   - Los agregados exponen invariantes protegidas: es imposible dejar el agregado en estado inválido desde fuera.
5. **Domain Events**:
   - Toda mutación de negocio relevante emite un evento de dominio (`ResourceUpdated`, `ProcessFailed`) recolectado en el agregado y despachado por la capa de aplicación DESPUÉS de que la transacción de persistencia haya confirmado (ver Outbox Pattern, sección 6).
   - Eventos de dominio internos (dentro del módulo) ≠ eventos de integración publicados a NATS (entre módulos/servicios). Los de integración son un mapeo explícito y versionado del evento interno, nunca el mismo objeto serializado directamente.
6. **Repositorios**: interfaz vive en `domain/repositories`, solo con métodos orientados a agregados completos (`save`, `findById`, `nextIdentity`). Prohibido exponer métodos tipo query builder (`findWhere`, `queryRaw`) en la interfaz de dominio — esos van en adaptadores de lectura específicos (ver CQRS ligero, sección 7).
7. **Domain Services**: solo cuando una regla de negocio involucra a más de una entidad/agregado y no pertenece naturalmente a ninguna. Si puede vivir dentro de una entidad, va en la entidad.
8. **Anti-Corruption Layer (ACL)**: al consumir eventos o llamadas de otro módulo/servicio externo, traduce SIEMPRE su modelo al lenguaje ubicuo propio mediante un mapper dedicado. Nunca dejes "fugarse" el modelo del otro contexto dentro de tu dominio.

---

## 5. Reglas de Casos de Uso (Application Layer)

- 1 clase/función = 1 caso de uso = 1 archivo (`ExecuteActionUseCase`, `RevertActionUseCase`).
- Firma estándar: recibe un `Input DTO`, devuelve un `Output DTO` o `Result<T, DomainError>`. Nunca expone entidades de dominio ni modelos de persistencia hacia afuera.
- Orquesta: valida input → recupera agregado(s) vía puerto → invoca métodos de negocio del dominio → persiste vía puerto → despacha eventos. **No contiene reglas de negocio propias**, solo orquestación.
- Manejo de errores: usa un tipo `Result`/`Either` o excepciones de dominio tipadas y capturables — prohibido `throw new Error("algo salió mal")` genérico.
- Idempotencia: todo caso de uso que reacciona a un evento externo (NATS) debe ser idempotente (usar `eventId`/`idempotencyKey` para deduplicar).

---

## 6. Base de datos

- **Un módulo = su propio esquema/schema lógico** (namespace, schema de Postgres, o incluso su propia base de datos si el motor lo permite). Prohibido hacer JOINs SQL entre tablas de módulos distintos: si necesitas ese dato, pídelo vía `public-api` o mantenlo desnormalizado localmente vía evento.
- **Migraciones versionadas por módulo**, independientes entre sí (carpeta `infrastructure/persistence/<orm>/migrations` dentro del propio módulo).
- **Transacción = límite del agregado, por defecto.** No abrir una transacción que cruce dos módulos, nunca. Cruzar dos agregados del mismo módulo dentro de una misma transacción solo se permite en los casos excepcionales y documentados que describe la sección 4 (Agregados) — no como práctica habitual.
- **Outbox Pattern obligatorio** para publicar eventos de dominio de forma consistente con la escritura en DB:
  1. Dentro de la MISMA transacción que persiste el cambio de estado, inserta el evento en una tabla `outbox_events`.
  2. Un proceso/worker separado (relay) lee `outbox_events` y publica a NATS JetStream, marcando como enviado.
  3. Esto evita el problema de "guardé en DB pero no publiqué el evento" (o viceversa).
- Repositorios de infraestructura devuelven SIEMPRE entidades de dominio reconstituidas (nunca el modelo ORM crudo) mediante un mapper.
- Prohibido usar el ORM/query builder directamente dentro de use cases o dominio — solo dentro de las implementaciones concretas de repositorio en `infrastructure/persistence`.

---

## 7. Redis (cache y lecturas)

- Redis se accede SIEMPRE a través de un puerto de salida definido en `application/ports/out` (ej. `ICachePort`), implementado en `infrastructure/cache/redis`. Nunca importar el cliente de Redis directamente en dominio o aplicación.
- Usos permitidos:
  - **Cache de lectura** (cache-aside): siempre con TTL explícito y estrategia de invalidación documentada (por evento de dominio, no por "TTL y ya").
  - **Modelos de lectura desnormalizados (CQRS ligero)**: cuando un caso de uso de consulta necesita datos combinados de varios agregados, no hagas eso con JOINs de dominio — mantiné una proyección de lectura en Redis (o tabla de lectura), actualizada por los propios eventos de dominio/integración.
  - Locks distribuidos (idempotencia, evitar dobles ejecuciones) — usar librerías probadas (ej. Redlock), nunca `SETNX` casero sin expiración.
  - Rate limiting, sesiones, colas de trabajo ligeras.
- Prohibido usar Redis como fuente única de verdad para datos de negocio críticos — siempre debe poder reconstruirse desde la DB/eventos.
- Namespacing de keys obligatorio por módulo: `<modulo>:<entidad>:<id>:<subrecurso>`.

---

## 8. Eventos con NATS JetStream

- **Contrato de evento versionado**: cada evento de integración tiene un schema explícito (`schemas/resource-updated.v1.ts`) con: `eventId`, `eventType`, `eventVersion`, `occurredAt`, `producerModule`, `payload`, `traceId`. Cambios incompatibles → nueva versión (`v2`), nunca mutar el contrato existente.
- **Naming de subjects/streams**: `<contexto>.<agregado>.<evento>` en minúsculas y en pasado (`module-a.resource.updated`, `module-b.resource.reserved`). Stream de JetStream por bounded context (`STREAM: MODULE_A_EVENTS`).
- **Publicador (`IEventPublisher`)**: puerto de salida en `application/ports/out`, implementado en `infrastructure/messaging/nats/publishers`. Los use cases NUNCA importan el cliente de NATS directamente.
- **Suscriptor**: cada handler de evento entrante:
  - Vive en `infrastructure/messaging/nats/subscribers`.
  - Traduce el evento externo a un comando/DTO propio (ACL, sección 4.8) y llama a un caso de uso — nunca ejecuta lógica de negocio directamente en el handler.
  - Es idempotente (dedupe por `eventId`) y usa **ack manual** (no auto-ack) — solo hace `ack()` tras persistir con éxito.
  - Define política de reintentos + dead-letter subject/stream explícito para mensajes que fallan repetidamente.
- **At-least-once, nunca exactly-once asumido**: diseña todo consumidor asumiendo que puede recibir el mismo evento más de una vez.
- Persistencia de stream: usar JetStream (no Core NATS) para todo evento de dominio/integración que deba sobrevivir reinicios y permitir replay; Core NATS solo aceptable para señales efímeras no críticas (ej. invalidación de cache en tiempo real).
- Comunicación síncrona (BFF → módulo, o módulo → módulo) NUNCA se hace vía NATS request-reply si puede evitarse — resérvalo para eventos asíncronos; para lo síncrono usa siempre el servicio **gRPC** que expone el `public-api` del módulo (ver sección 9).

---

## 9. BFF, REST y Frontend

- **Frontend** (web/mobile): sin lógica de negocio. Consume ÚNICAMENTE los endpoints **REST (HTTP fetch)** expuestos por el BFF. Solo maneja presentación, estado de UI y validaciones superficiales de formulario (nunca reglas de negocio duplicadas del backend).
- **REST / OpenAPI**: es el contrato/API de entrada del BFF hacia el frontend, nada más. Los endpoints REST y schemas Zod definen la forma de los datos y operaciones disponibles — no contienen lógica de negocio. Los controladores REST son adaptadores puros: reciben la petición, la traducen y delegan a un cliente gRPC hacia el módulo correspondiente.
- **BFF**:
  - Capa 100% de adaptación/composición: arma la respuesta que el frontend necesita combinando llamadas a uno o varios módulos.
  - **Nunca implementa ni duplica reglas de negocio.** Si un endpoint REST empieza a tener condicionales de negocio, cálculos, validaciones de dominio o cualquier decisión que dependa del estado de un agregado, esa lógica está en el lugar equivocado — pertenece al módulo correspondiente (dominio/aplicación).
  - Responsabilidades técnicas permitidas: enrutamiento y validación REST/OpenAPI, verificación de sesión/token del cliente (no reglas de negocio de permisos de dominio), agregación de respuestas de varios módulos, mapeo de errores gRPC → errores HTTP REST, cache de presentación de corta duración (no reemplaza el cache de dominio en Redis de cada módulo).
  - **Prohibido de forma terminante**: que el BFF acceda directo a la base de datos, a Redis, a entidades, agregados, repositorios o cualquier clase de `domain/`, `application/` o `infrastructure/persistence` de un módulo. El BFF solo conoce el contrato gRPC público de cada módulo — nada más.
- **Comunicación BFF → módulos = gRPC**:
  - Cada módulo expone su `public-api` como servicio **gRPC** (`infrastructure/grpc/`), definido con un contrato `.proto` versionado.
  - El BFF actúa como cliente gRPC de cada módulo que necesita consultar. Nunca importa código interno del módulo ni conoce su implementación — solo el `.proto`.
  - El contrato gRPC no cambia si el módulo sigue dentro del monolito o si ya fue extraído a microservicio — solo cambia la dirección de red del servicio.
- **Diagrama de capas** (ver diagrama canónico completo en la sección 0.1; detalle de esta capa específica):

```
Frontend
   │  HTTP fetch / REST — sin lógica de negocio
   ▼
 BFF
   │  gRPC — solo composición/adaptación, sin lógica de negocio
   ▼
 module-a   module-b   module-c   ← lógica de negocio, dominio, casos de uso, persistencia
```

- **La comunicación entre módulos NO pasa por el BFF.** El BFF nunca es intermediario de una llamada módulo-a-módulo; esa comunicación sigue las reglas de la sección 3 (gRPC directo entre módulos para lo síncrono, NATS JetStream para lo asíncrono).

---

## 10. Preparación explícita para extracción a microservicios

Para que sacar un módulo a microservicio sea "mover carpeta + cambiar adapter", respeta siempre:

1. **Cero imports cruzados de código interno entre módulos** (regla ya cubierta en sección 3) — es la regla más importante de todas.
2. **La comunicación ya es gRPC + eventos NATS desde el día uno** (no in-process): tanto el BFF como los demás módulos ya hablan con cada módulo a través de su contrato `.proto` versionado. Extraer un módulo a su propio proceso/host no cambia el contrato, solo cambia la dirección de red — cero reescritura de clientes.
3. **Cada módulo posee sus propios datos** (schema separado desde el día 1, sección 6) — así el día de la extracción solo mueves ese schema a su propia instancia de DB.
4. **Los eventos de integración ya están versionados y desacoplados** (sección 8) — el microservicio extraído simplemente se conecta al mismo stream de NATS JetStream, sin cambiar contratos.
5. **Config por módulo, no global**: variables de entorno, feature flags y configuración de cada módulo deben estar aisladas (`module.config.ts`) para poder copiarse tal cual al nuevo servicio.
6. **Observabilidad por módulo desde ya**: logs estructurados con `module` y `traceId` (propagado también en llamadas gRPC y eventos NATS), métricas y tracing distribuido (OpenTelemetry) por bounded context, para que al extraer no pierdas visibilidad.
7. Antes de extraer, el checklist debe ser: ¿este módulo importa algo interno de otro? ¿comparte transacción de DB con otro? ¿comparte estado en memoria (cache local, singleton) con otro? Si las 3 respuestas son "no", la extracción es segura — solo se despliega su servicio gRPC en un proceso propio.

---

## 11. Shared Kernel — uso muy restringido

- `shared-kernel/` SOLO contiene: tipos primitivos verdaderamente universales (`Result<T,E>`, `UUID`, `Money` si es un VO realmente compartido por contrato de negocio, no por pereza), interfaces de infraestructura transversal (`ILogger`, `IClock`), y errores base.
- Prohibido meter ahí "por si acaso" cualquier entidad o VO específico de un dominio. Si dos módulos necesitan un concepto similar pero con reglas distintas, **duplícalo** en cada módulo (preferible a un acoplamiento oculto). Duplicación > acoplamiento incorrecto, siempre.

---

## 12. Observabilidad (logs, métricas, tracing)

- Instrumentación obligatoria en TODA capa (módulos, BFF, REST, gRPC, NATS, DB, Redis): logs estructurados, métricas, distributed tracing, correlation ID, trace ID.
- **Propagación de contexto obligatoria** a lo largo de toda la cadena: `HTTP/REST → BFF → gRPC → Module → Database/Redis → NATS JetStream → otro Module`.
- **OpenTelemetry** como estándar de instrumentación en todo el stack.
- Métricas segmentadas por módulo/bounded context, por endpoint REST, por método gRPC, y por consumidor/productor NATS — nunca solo un agregado global del proceso.
- Prohibido usar `console.log`/`print`/`dbg!` o cualquier logging no estructurado como mecanismo de observabilidad de producción. Todo log de producción es estructurado (JSON o formato equivalente parseable) y va al pipeline de logging.
- Campos mínimos obligatorios por log: `timestamp`, `service`, `module`, `environment`, `level`, `trace_id`, `span_id`, `request_id`/`correlation_id`, `operation`, `error` (cuando aplica), `duration` (cuando aplica).
- **Prohibido registrar** secretos, tokens, contraseñas, credenciales o cualquier dato sensible/PII en logs, métricas o trazas — sanitizar/enmascarar antes de loguear.

### 12.1 Métricas mínimas obligatorias por capa

| Capa | Métricas mínimas |
|---|---|
| HTTP/REST | `requests_total`, `requests_failed_total`, `request_duration`, `request_rate`, `status_codes`, `active_requests` |
| gRPC | `calls_total`, `calls_failed_total`, `call_duration`, `status/code`, `active_calls` |
| Base de datos | `query_duration`, `query_errors`, `connection_pool_size`, `active_connections`, `idle_connections`, `pool_wait_time` |
| Redis | `operations_total`, `operation_duration`, `errors`, `hit_rate`, `miss_rate`, `connection_errors` |
| NATS/JetStream | `messages_published`, `messages_consumed`, `processing_duration`, `ack_failures`, `redeliveries`, `consumer_lag`, `pending_messages`, `dlq_messages` |
| Sistema | CPU, RAM, disco, red, file descriptors, contadores de proceso/hilo/tarea cuando corresponda |

### 12.2 Latencia — nunca solo el promedio

- Medir siempre percentiles: `p50`, `p90`, `p95`, `p99`, y `p99.9` cuando sea relevante para el SLO. El promedio **NUNCA** es la única métrica de latencia reportada — oculta la experiencia real de las solicitudes lentas.
- Toda operación crítica debe tener objetivos de latencia documentados y parametrizables (ver sección 13).

---

## 13. SLO / SLA / SLI y Health Checks

### 13.1 SLI / SLO / Error Budget

- Para toda operación crítica, definir explícitamente: **SLI** (qué se mide), **SLO** (objetivo) y el **error budget** derivado.
- Formato de referencia (los valores son ejemplo, no obligatorios):
  ```
  Availability SLO: 99.9%
  Latency SLO: p99 < X ms
  Error rate: < X%
  ```
- **Prohibido inventar valores arbitrarios.** Si el proyecto aún no tiene objetivos definidos, dejar los valores parametrizables/documentados (ej. configuración o un `slo.md` por módulo) para establecerlos formalmente después — nunca hardcodear un número "porque suena razonable".

### 13.2 Health checks

- Implementar **liveness**, **readiness**, y **startup check** cuando corresponda.
- **Liveness**: determina únicamente si el proceso está vivo — no debe depender de dependencias externas.
- **Readiness**: determina si el servicio puede recibir tráfico — sí puede depender de dependencias críticas.
- Prohibido un health check que solo devuelva `200 OK` sin verificar el estado real necesario.
- Evitar que la caída de una dependencia externa no crítica marque innecesariamente todo el servicio como muerto — diferenciar dependencias críticas de no críticas en el readiness check.

---

## 14. Testing (obligatorio, no opcional)

Mantener los siguientes niveles, cada uno con un propósito definido, sin que uno sustituya a otro: Unit, Integration, Contract, Component, End-to-End, Performance (Load/Stress/Spike/Soak/Breakpoint), Chaos.

### 14.1 Unit Testing (Domain)

- El **dominio** debe poder probarse sin Docker, sin DB, sin Redis, sin NATS, sin red y sin ninguna infraestructura externa. Tests rápidos y deterministas.
- Probar obligatoriamente: invariantes, reglas de negocio, Value Objects, Aggregates, Domain Services, Domain Events.

### 14.2 Application Testing (Use Cases)

- Se prueban con implementaciones fake/in-memory de los puertos de salida — nunca acoplar estos tests a PostgreSQL, Redis, NATS, HTTP o gRPC reales. Nunca mockear el dominio.
- Deben verificar: flujo correcto, manejo de errores, idempotencia, autorización cuando corresponda, publicación de eventos, y comportamiento ante fallos de las dependencias.

### 14.3 Integration Testing

- Los adapters reales (persistencia, cache, mensajería) se prueban contra infraestructura real o equivalente controlada — preferiblemente **Testcontainers** para PostgreSQL, Redis y NATS JetStream. Un mock no es suficiente para validar una integración real.
- Deben verificar: migrations, repositories, transactions, serialización/deserialización, comportamiento de Redis, publishing/consuming de NATS, acknowledgements, retries, idempotencia, Outbox, y deduplicación (Inbox).

### 14.4 Contract Testing

- Todo contrato externo debe tener contract tests: **contratos REST / OpenAPI**, **protobuf gRPC**, y **schemas de eventos NATS**.
- Un cambio incompatible debe detectarse automáticamente en CI antes del deployment. Los contratos versionados no deben romper consumidores existentes.

### 14.5 End-to-End Testing

- Los flujos críticos se prueban siguiendo la cadena completa: `Frontend/API → REST → BFF → gRPC → Module → Database → NATS/JetStream` (cuando corresponda).
- Cubren únicamente flujos críticos de negocio — nunca reemplazan a los unit/integration tests.

---

## 15. Rendimiento y Pruebas de Carga

- Herramienta estándar: **k6** para load testing, stress testing, spike testing, soak testing y performance regression testing.
- Medir como mínimo: `requests/sec`, `throughput`, `latency p50/p95/p99`, `error rate`, `concurrent users/connections`.
- Ejecutar siempre contra ambientes controlados y reproducibles. **Prohibido usar producción para pruebas destructivas de carga.**

### 15.1 Perfiles de prueba de carga

- **Load Test**: carga esperada normal.
- **Stress Test**: incrementar progresivamente la carga hasta encontrar el límite del sistema.
- **Spike Test**: incrementos bruscos de tráfico.
- **Soak Test**: carga sostenida durante un período prolongado, para detectar memory leaks, connection leaks, degradación progresiva, acumulación de mensajes y crecimiento de latencia.
- **Breakpoint Test**: determinar el punto donde el throughput deja de crecer y comienzan a aumentar significativamente p99, errores, timeouts y saturación.

### 15.2 Performance Budgets

- Definir budgets explícitos para: latencia, error rate, CPU, memoria, conexiones a base de datos, latencia de Redis, y consumer lag de NATS.
- Una modificación que empeore significativamente una métrica crítica es una **regresión de rendimiento** y debe investigarse antes de aprobarse (idealmente bloqueando el merge/deploy si el budget está integrado al CI).

---

## 16. Resiliencia

Implementar cuando corresponda: timeouts, retries con exponential backoff y jitter, circuit breakers, bulkheads, rate limiting, backpressure, load shedding, idempotencia, dead-letter queues/streams, y graceful degradation.

- **Nunca** implementar retries infinitos.
- **Nunca** hacer retry agresivo sin backoff y jitter.
- **Nunca** reintentar automáticamente errores no recuperables (ej. errores de validación no deben tratarse como transitorios).

### 16.1 Timeouts

- Toda comunicación externa debe tener timeout explícito: HTTP, gRPC, PostgreSQL, Redis, y NATS request/reply cuando corresponda.
- Nunca depender de un timeout implícito indefinido. Los timeouts deben ser configurables por entorno.

### 16.2 Retries

- Límite máximo de reintentos, exponential backoff, jitter, y aplicación únicamente a errores recuperables.
- Deben ser compatibles con idempotencia. Evitar retry storms: un retry no debe convertir una dependencia degradada en una cascada de fallos.

### 16.3 Circuit Breaker

- Usar circuit breaker cuando una dependencia externa pueda provocar cascading failures.
- Estados: `CLOSED → OPEN → HALF_OPEN → CLOSED`.
- Debe estar acompañado de métricas y logs que permitan observar los cambios de estado.

### 16.4 Bulkhead

- Aislar recursos críticos (connection pools, worker pools, límites de tareas asíncronas, límites de concurrencia) para que una operación saturada no consuma todos los recursos disponibles. Una operación lenta no debe bloquear necesariamente todas las demás.

### 16.5 Graceful Shutdown

Todo servicio debe implementar graceful shutdown. Al recibir señal de terminación:
1. Dejar de aceptar nuevo tráfico.
2. Marcar readiness como no disponible.
3. Permitir terminar solicitudes activas dentro de un límite de tiempo.
4. Detener consumidores cuando corresponda.
5. Procesar/confirmar correctamente los mensajes pendientes según la estrategia definida.
6. Cerrar conexiones y liberar recursos.
7. Finalizar el proceso.

Nunca terminar abruptamente una operación crítica si puede evitarse.

### 16.6 NATS JetStream Resilience

- Los consumidores deben asumir **at-least-once delivery** — nunca asumir exactly-once.
- Los consumidores deben ser idempotentes.
- Implementar: acknowledgements explícitos, retry policy, backoff, manejo de redelivery, deduplicación, estrategia de dead-letter, y monitoreo de consumer lag.
- Un mensaje nunca debe perderse silenciosamente.

---

## 17. Chaos Engineering y Fault Injection

- Implementar pruebas de resiliencia de forma progresiva: detener/reiniciar un módulo, introducir latencia o errores, cortar Redis/PostgreSQL/NATS, provocar pérdida de conexiones, aumentar latencia de DB, saturar CPU/memoria, aumentar temporalmente el tráfico.
- Cada experimento de chaos debe documentar: **Hypothesis**, **Blast Radius**, **Experiment**, **Expected Result**, **Observed Result**, **Recovery**, **Conclusion**.
- **Nunca** ejecutar experimentos destructivos sin limitar previamente el blast radius.
- **Fault injection**: las pruebas deben validar que el sistema se comporta correctamente cuando una dependencia falla (ej. `Module → Redis DOWN`, `Module → Database SLOW`). Ante una dependencia degradada debe existir: timeout, backpressure, límites de concurrencia, observabilidad y recuperación definida.

---

## 18. Alerting y Observabilidad de Extremo a Extremo

- Crear alertas sobre **síntomas reales** de negocio/usuario, no únicamente sobre utilización de recursos. Priorizar: error rate, latencia p95/p99, saturación, consumer lag, queue depth, agotamiento de conexiones de DB, fallos de Redis, redeliveries de NATS, OOM, crash loops, disponibilidad.
- No crear alertas excesivamente sensibles que produzcan alert fatigue.
- Toda solicitud debe poder rastrearse de extremo a extremo mediante `trace_id`/propagación de contexto a través de: `Frontend → REST → BFF → gRPC → Module → DB/Redis → NATS JetStream → otro Module`. Debe ser posible investigar una operación completa sin depender únicamente de logs manuales.

---

## 19. Definition of Done — checklist antes de dar por terminada una funcionalidad

El agente **no debe considerar una implementación completa únicamente porque el código compile o existan pruebas**. Antes de declarar una funcionalidad terminada, ejecutar las validaciones pertinentes y registrar su resultado. El siguiente inventario es una revisión de archivos fuente, no un informe de cobertura ni de pruebas ejecutadas:

| Área | Inventario localizado | Estado que sí puede afirmarse |
|---|---|---|
| Módulos y contratos | 33 módulos con `module.public-api.ts`; 34 archivos `.proto`, incluido `common.proto`. | Presentes en el repositorio; cumplimiento de límites y completitud funcional no auditados. |
| API / BFF | 126 archivos de prueba bajo `apps/api/src` y 40 bajo `apps/bff/src`. | Archivos presentes; número de casos y último resultado de ejecución no verificados. |
| Frontend | 99 archivos fuente `page.tsx` y 13 archivos E2E Playwright. | Código y pruebas presentes; no implica que todas las rutas sean operativas ni que E2E pase. |
| Persistencia y eventos | Esquemas Drizzle, pruebas de repositorios, Outbox y consumidores NATS localizados. | Existencia en código; no se localizaron políticas SQL explícitas de RLS en los esquemas/migraciones revisados. Infraestructura real, DLQ y operación en producción no verificadas. |
| Métricas y logs | `LatencyTracker`, `MetricsService` y `StructuredLoggingInterceptor`; se generan identificadores de traza locales. | Implementación propia presente; no equivale a tracing distribuido OpenTelemetry ni a exportación Prometheus/Grafana. |
| Resiliencia | Utilidades de retry/circuit breaker e interceptor de idempotencia con pruebas. | Componentes presentes; su cobertura y configuración en todos los flujos no auditadas. |
| Rendimiento | No se localizaron scripts k6 en el repositorio revisado. | Pruebas load/stress/spike/soak pendientes. |
| Chaos | Existe una suite de fault injection con simulaciones locales. | No hay evidencia de experimentos destructivos sobre un clúster real; ver [`CHAOS-EXPERIMENTS.md`](./CHAOS-EXPERIMENTS.md). |
| CI | Workflow con validaciones backend/paquetes y build/typecheck frontend. | Configurado, pero el resultado de la última ejecución no se consultó; E2E frontend no está incluido. |

No se declara ningún porcentaje de cobertura ni de completitud en esta sección sin un reporte actualizado. Mantener como criterios de DoD los niveles unitario, aplicación, integración, contrato, E2E, rendimiento y resiliencia indicados en las subsecciones anteriores.

### 19.1 Matriz histórica de referencia (cobertura no verificada)

La tabla siguiente conserva el catálogo de entidades y operaciones de una versión anterior. **No es un catálogo completo de los módulos actuales ni certifica que las entidades, handlers o suites estén implementados o cubiertos.** Los porcentajes originales se sustituyen por «No auditado».

| Bounded Context | Entidades de Dominio | Command Handlers | Query Handlers | Suites de Prueba Jest |
|---|---|---|---|:---:|
| `auth` | User, Session, RefreshToken | Register, Login, Refresh, Logout | GetCurrentSession | No auditado |
| `users` | User, NaturalPerson, LegalEntity | CreateUser, UpdateUser, DeleteUser | GetUser, FindByEmail, ListUsers | No auditado |
| `tenants` | Tenant, Branch, Branding, Feature | CreateTenant, UpdateTenant, AddBranch | GetTenant, GetBranding, ListBranches | No auditado |
| `iam` | Role, Permission, UserRole | CreateRole, UpdateRole, AssignRole | ListRoles, GetPermissions | No auditado |
| `contacts` | Contact, ContactEmail, ContactPhone | CreateContact, UpdateContact, DeleteContact | GetContact, ListContacts | No auditado |
| `companies` | Company, CompanyFilter | CreateCompany, UpdateCompany, DeleteCompany | GetCompany, ListCompanies | No auditado |
| `pipelines` | Pipeline, PipelineStage, Deal | CreatePipeline, CreateDeal, WinDeal, MoveDeal | GetPipeline, ListPipelines, GetDeal | No auditado |
| `interactions`| Note, Task, Call | CreateNote, CreateTask, CreateCall | GetNote, GetTask, GetCall | No auditado |
| `support-tickets` | SupportTicket, TicketReply | CreateTicket, UpdateStatus, AddReply | GetTicket, ListTickets, GetReplies | No auditado |
| `campaigns` | Campaign, CampaignMember | CreateCampaign, ChangeStatus | GetCampaign, ListCampaigns | No auditado |
| `contracts` | Contract, Quote | CreateContract, RenewContract | GetContract, ListContracts | No auditado |
| `sales-teams`| SalesTeam, SalesQuota | CreateTeam, UpdateTeam | GetTeam, ListTeams, GetQuota | No auditado |
| `loyalty` | LoyaltyProfile, CustomerSegment | EarnPoints, RedeemPoints | GetProfile, GetSegments | No auditado |
| `affiliates` | AffiliateProgram, Affiliate, Commission | CreateProgram, RegisterAffiliate | GetProgram, GetAffiliate, GetCommissions | No auditado |
| `helpdesk` | Conversation, Thread, Mailbox | CreateConversation, AssignConversation | GetConversation, ListConversations, ListThreads | No auditado |
| `personal-crm` | LifeEvent, ContactGift, ContactDebt | CreateLifeEvent, CreateGift | ListLifeEvents, ListGifts, ListDebts | No auditado |
| `tags` | Tag | CreateTag, UpdateTag, DeleteTag | ListTags | No auditado |
| `notifications`| Channel, Template, Notification | CreateChannel, UpdateChannel | ListChannels, GetChannel | No auditado |
| `audit` | AuditLog | CreateAuditLog | ListAuditLogs, GetEntityAudit | No auditado |
| `storage` | File | UploadFile, DeleteFile | GetFile, ListFiles, GetFileUrl | No auditado |
| `scheduler` | ScheduledTask, TaskExecution, Reminder | CreateTask, UpdateTask, ExecuteTask | ListTasks, GetTask | No auditado |
| `infra/cross` | Outbox, Cache, Resilience, Chaos | OutboxService, RedisCache, CircuitBreaker | LatencyTracker, MetricsService | No auditado |

---

## 20. Prohibiciones explícitas (checklist rápido para el agente)

Antes de entregar cada cambio, verifica que NO hiciste ninguna de estas cosas. Las casillas se dejan sin marcar porque son una lista de comprobación por cambio, no resultados de una auditoría de todo el repositorio:

- [ ] Importar Prisma/TypeORM/Mongoose/cliente Redis/cliente NATS dentro de `domain/` o `application/`.
- [ ] Poner lógica de negocio en un controlador, listener de evento o repositorio.
- [ ] Hacer `import` directo de la carpeta interna de otro módulo (`../otro-modulo/domain/...`).
- [ ] Modificar dos agregados de módulos distintos dentro de la misma transacción síncrona (prohibido siempre), o modificar dos agregados del mismo módulo en la misma transacción sin justificación documentada (excepción de la sección 4, no regla por defecto).
- [ ] Exponer una entidad de dominio directamente como respuesta HTTP/REST o como payload de evento sin DTO/mapper.
- [ ] Publicar un evento sin Outbox Pattern (riesgo de inconsistencia DB/evento).
- [ ] Crear un consumidor de NATS que no sea idempotente o que haga auto-ack antes de procesar.
- [ ] Usar Redis como única fuente de verdad de un dato crítico de negocio.
- [ ] Añadir algo a `shared-kernel/` que en realidad pertenece a un solo módulo.
- [ ] Nombrar clases genéricas tipo `Manager`, `Helper`, `Util`, `Service` sin responsabilidad clara y acotada.
- [ ] Generar un archivo de más de 200 líneas de código o un archivo "bolsa" con varias funciones/clases no relacionadas (revisar sección 1.bis).
- [ ] Escribir lógica de negocio, cálculos o validaciones de dominio dentro de un controlador REST o de cualquier archivo dentro de `apps/bff/`.
- [ ] Hacer que el BFF acceda directo a una DB, a Redis, a una entidad, agregado o repositorio de un módulo (el BFF solo conoce el `.proto` gRPC del módulo).
- [ ] Comunicar el BFF con un módulo por un medio distinto a gRPC, o comunicar dos módulos de forma síncrona por un medio distinto al gRPC del módulo destino.
- [ ] Usar un nombre de dominio específico de negocio como nombre de módulo dentro de este documento de referencia (usar siempre `module-a`, `module-b`, etc.).
- [ ] Usar logging no estructurado (`console.log`/`print`/`dbg!`) como mecanismo de observabilidad de producción, o registrar secretos/credenciales/PII en logs, métricas o trazas.
- [ ] Implementar un health check que solo devuelva `200 OK` sin verificar dependencias reales, o que mezcle liveness con readiness.
- [ ] Implementar retries infinitos, o retries sin backoff/jitter, o retries sobre errores no recuperables.
- [ ] Reportar latencia usando únicamente el promedio, sin percentiles (p95/p99).
- [ ] Ejecutar pruebas de carga o experimentos de chaos destructivos directamente en producción, o sin blast radius definido.

---

## 21. Instrucción final para el agente (Claude/Codex)

> Cuando generes código para este proyecto, aplica TODAS las reglas anteriores sin excepción. Si el requerimiento del usuario es ambiguo respecto a en qué módulo/capa debe vivir algo, pregunta o indica explícitamente tu suposición antes de generar código. Si detectas que cumplir el requerimiento tal cual lo pide el usuario violaría alguna regla de esta guía (por ejemplo, acceder a datos de otro módulo directamente, omitir observabilidad/resiliencia en una operación crítica, o inventar un SLO sin base), avísalo y propone la alternativa correcta en vez de generar el atajo que rompe la arquitectura. El objetivo permanente es que cada módulo pueda extraerse a microservicio en el futuro con cambios mínimos fuera de la capa de infraestructura, y que todo el sistema sea observable, medible y resiliente por diseño — no como una capa añadida después.