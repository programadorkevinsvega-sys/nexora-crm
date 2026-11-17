# Registro de pruebas de resiliencia y fault injection

Este documento describe los escenarios definidos en [`chaos-fault-injection.spec.ts`](./apps/api/src/common/observability/test/chaos-fault-injection.spec.ts), relacionados con la sección 17 de [`refactorizacion.md`](./refactorizacion.md).

> **Alcance verificado en el código:** los tres escenarios son pruebas automatizadas locales con dobles o estados simulados. No son experimentos destructivos sobre Redis, una red, un clúster o dependencias productivas. La revisión documental no ejecutó la suite; por tanto, el resultado de la última ejecución no está confirmado.

## Experimento 1: Redis no disponible (simulado)

- **Hipótesis:** si el adaptador de caché no tiene Redis disponible, `getOrSet()` usa la función de origen.
- **Alcance:** prueba del `RedisCacheAdapter` instanciado en estado desconectado; no se corta una conexión Redis real.
- **Comprobación definida:** la función de origen se invoca una vez y su valor se devuelve.
- **Estado:** prueba presente en el código; ejecución actual y fallback en un entorno real no verificados.
- **Pendiente:** probar desconexión/reconexión contra Redis real en un entorno controlado y medir el comportamiento HTTP de la aplicación.

Referencias: [`RedisCacheAdapter`](./apps/api/src/common/cache/redis-cache.adapter.ts), [`docker-compose.dev.yml`](./docker-compose.dev.yml).

## Experimento 2: Circuit breaker

- **Hipótesis:** tras fallos consecutivos, el circuito pasa a `OPEN`, rechaza una llamada adicional y permite recuperar el estado tras el enfriamiento.
- **Alcance:** el test usa una función mock que rechaza con un error; no invoca un servicio de red ni provoca una sobrecarga real.
- **Comprobación definida:** transición `CLOSED → OPEN → HALF_OPEN → CLOSED` y fast-fail.
- **Estado:** prueba unitaria presente; resultado de ejecución actual no verificado.
- **Pendiente:** integrar métricas/alertas y validar el circuito junto a una dependencia real en un entorno controlado.

Referencia: [`CircuitBreaker`](./packages/shared/src/resilience/circuit-breaker.ts).

## Experimento 3: Reintentos y jitter

- **Hipótesis:** `retryWithBackoff` vuelve a intentar una operación transitoria y puede completarla si un intento posterior tiene éxito.
- **Alcance:** la prueba simula dos fallos y una recuperación con una función en memoria y retrasos breves; no introduce jitter o latencia de red reales.
- **Comprobación definida:** la llamada devuelve el resultado del tercer intento.
- **Estado:** prueba unitaria presente; ejecución actual no verificada.
- **Pendiente:** probar fallos de red en una integración controlada y documentar límites, métricas y recuperación observada.

Referencia: [`retryWithBackoff`](./packages/shared/src/resilience/retry-with-backoff.ts).

## Pruebas de caos pendientes

No se encontró evidencia en este repositorio de experimentos k6 ni de pruebas de caos sobre un clúster desplegado. Antes de ejecutarlos, definir entorno aislado, límites de impacto, criterio de parada, recuperación y responsable. No ejecutar experimentos destructivos en producción.
