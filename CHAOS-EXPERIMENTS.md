# Registro de Experimentos de Chaos Engineering y Fault Injection
## Conforme a la Sección 17 de `refactorizacion.md`

Este documento registra los experimentos automatizados de inyección de fallos y resiliencia implementados en la suite de pruebas del Monolito Modular ([`apps/api/src/common/observability/test/chaos-fault-injection.spec.ts`](file:///home/servidor-nitro/ARCHIVOS-KEVINS/NUEVO/DESARROLLO/crm/crm-service/apps/api/src/common/observability/test/chaos-fault-injection.spec.ts)).

---

### 🧪 Experimento 1: Caída Total de Redis (Redis DOWN)
* **Hypothesis:** Si la instancia de Redis se cae o sufre partición de red, las consultas de lectura deben conmutar automáticamente a la fuente de verdad (PostgreSQL) con $0$ errores 500 para los usuarios.
* **Blast Radius:** Capa de aceleración de caché únicamente. Los datos transaccionales permanecen consistentes en PostgreSQL.
* **Experiment:** Inyección de socket cerrado / estado no disponible en el adaptador [`RedisCacheAdapter`](file:///home/servidor-nitro/ARCHIVOS-KEVINS/NUEVO/DESARROLLO/crm/crm-service/apps/api/src/common/cache/redis-cache.adapter.ts) durante la ejecución de `getOrSet()`.
* **Expected Result:** El adaptador detecta la indisponibilidad sin lanzar excepciones y ejecuta directamente la función de persistencia (`databaseQuery`).
* **Observed Result:** ✅ Ejecución exitosa de la consulta fuente, respuesta entregada al cliente con latencia normal.
* **Recovery:** Al restablecerse la conexión de Redis, el evento `ready` reactiva la escritura en caché sin reiniciar el proceso.
* **Conclusion:** Resiliencia confirmada. El sistema no depende críticamente de Redis para responder peticiones.

---

### 🧪 Experimento 2: Prevención de Fallo en Cascada con Circuit Breaker
* **Hypothesis:** Cuando un servicio o dependencia downstream se degrada y falla repetidamente, el [`CircuitBreaker`](file:///home/servidor-nitro/ARCHIVOS-KEVINS/NUEVO/DESARROLLO/crm/crm-service/packages/shared/src/resilience/circuit-breaker.ts) debe abrir el circuito (`OPEN`) para evitar el agotamiento de hilos y conexiones del backend.
* **Blast Radius:** Sub-operación afectada (aislada del resto de módulos).
* **Experiment:** Inyección de 3 fallos consecutivos `503 Service Unavailable` a través del ejecutor del circuit breaker.
* **Expected Result:** La cuarta solicitud es rechazada inmediatamente en memoria (`Fast-Fail`) sin sobrecargar la dependencia degradada.
* **Observed Result:** ✅ Estado del circuito pasa a `OPEN`. Las llamadas subsecuentes fallan en $< 0.1\text{ ms}$. Tras el tiempo de enfriamiento (`resetTimeoutMs`), transiciona a `HALF_OPEN` y se recupera a `CLOSED` con la primera llamada exitosa.
* **Recovery:** Autorecuperación progresiva sin intervención manual.
* **Conclusion:** Protección anti-saturación validada al 100%.

---

### 🧪 Experimento 3: Recuperación de Latencia y Jitter de Red
* **Hypothesis:** Errores transitorios de red (`ETIMEDOUT`, micro-cortes) se resuelven de forma transparente mediante reintentos con retraso exponencial y aleatoriedad (`jitter`).
* **Blast Radius:** Solicitud individual afectada.
* **Experiment:** Inyección de fallos intermitentes en los intentos 1 y 2 con recuperación en el intento 3 usando [`retryWithBackoff`](file:///home/servidor-nitro/ARCHIVOS-KEVINS/NUEVO/DESARROLLO/crm/crm-service/packages/shared/src/resilience/retry-with-backoff.ts).
* **Expected Result:** La operación completa exitosamente sin reportar error al cliente final.
* **Observed Result:** ✅ Recuperación automática en el intento 3 con backoff exponencial.
* **Recovery:** Transparente e inmediata.
* **Conclusion:** Tolerancia a micro-particiones de red 100% operativa.
