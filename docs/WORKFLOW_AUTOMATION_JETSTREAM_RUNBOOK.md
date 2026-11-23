# Runbook: despliegue del runtime diferido NATS JetStream

Este procedimiento acompaña al PR del runtime JetStream de workflows. No se ejecuta automáticamente desde GitHub Actions: el pipeline de producción transfiere el código y recarga PM2, pero no recrea el contenedor NATS.

## Cambios incluidos

- NATS Server fijado en `2.15.3-alpine` para soportar mensajes programados.
- JetStream habilitado con `-js`.
- Store persistente en `/data` mediante `-sd /data`, respaldado por el volumen Docker `nats_data`.
- Streams de workflow con almacenamiento de archivo, límites de bytes/edad y réplicas por defecto en 1.
- Proceso PM2 `nexora-workflow-worker` separado de la API.

## Advertencia antes de recrear el contenedor

El compose anterior montaba `/data` pero no pasaba `-sd /data`. NATS utiliza `/tmp` como directorio JetStream predeterminado cuando no se especifica `store_dir`; por tanto, no se debe asumir que el volumen `nats_data` contiene los datos activos actuales.

**No ejecutar `docker compose down -v`, no borrar el contenedor antiguo ni eliminar volúmenes antes de identificar y respaldar el directorio JetStream que realmente está usando el proceso actual.** Un `docker compose up` que recree el contenedor puede perder el store que estaba dentro de la capa efímera del contenedor.

## Preflight

1. Registrar el contenedor actual, imagen, argumentos y montajes:

   ```bash
   docker inspect crm-nats --format 'Image={{.Config.Image}} Cmd={{json .Config.Cmd}} Mounts={{json .Mounts}}'
   ```

2. Confirmar el `store_dir` efectivo de NATS y el volumen que lo contiene. Revisar el log de arranque y la configuración real del proceso; el montaje en `/data` no demuestra por sí solo que JetStream lo use.

3. Detener temporalmente los procesos productores/consumidores de NATS durante la copia final de datos. Hacer un respaldo consistente del directorio JetStream activo identificado en el paso anterior y verificar que el respaldo se puede leer. Conservar el contenedor/almacenamiento anterior hasta completar la validación.

4. Si el store actual está bajo `/tmp` dentro del contenedor, copiarlo fuera del contenedor antes de recrearlo y planificar su restauración en el volumen persistente. No copiar un store en uso sin detener ordenadamente NATS.

## Actualización

Desde la raíz del repositorio en la VM:

```bash
docker compose -f compose/nats/docker-compose.yml config
docker compose -f compose/nats/docker-compose.yml pull
docker compose -f compose/nats/docker-compose.yml up -d
docker compose -f compose/nats/docker-compose.yml ps
docker logs --tail=100 crm-nats
```

El archivo compose conserva el volumen nombrado `nats_data` y ahora inicia NATS con `-sd /data`. Si se necesita restaurar un store respaldado desde la ubicación anterior, hacerlo antes de iniciar el servidor nuevo y comprobar su compatibilidad con NATS 2.15.3.

No usar `down -v` ni limpiar el volumen persistente.

## Comprobaciones

1. Confirmar que el servidor arranca con JetStream habilitado y sin errores de recuperación del store:

   ```bash
   docker exec crm-nats wget -qO- http://127.0.0.1:8222/healthz?js-enabled-only=true
   docker exec crm-nats wget -qO- http://127.0.0.1:8222/jsz
   ```

2. Confirmar el volumen montado:

   ```bash
   docker inspect crm-nats --format '{{json .Mounts}}'
   ```

3. Después de desplegar el código que contiene la migración `0041_workflow_jetstream_delays.sql`, comprobar que la migración terminó correctamente y que existen las columnas `resume_at` y `resume_token`.

4. Recargar PM2 desde la raíz del proyecto:

   ```bash
   pm2 startOrReload ecosystem.config.js --update-env
   pm2 save
   pm2 status
   pm2 logs nexora-workflow-worker --lines 100
   ```

5. Verificar en los logs que el worker creó/abrió los consumidores durables de reanudación y de advisories DLQ. Ejecutar después una prueba de delay corta en un workflow de prueba y comprobar:
   - transición a `WAITING_DELAY` con `resume_at` y `resume_token`;
   - reanudación desde el siguiente paso;
   - persistencia del mensaje en JetStream;
   - ruta de DLQ ante una entrega agotada.

## Límites operativos

- La configuración actual es de un solo servidor NATS y `num_replicas=1`; no proporciona alta disponibilidad del broker. Para HA se necesita un clúster NATS con discos locales separados y réplicas coordinadas.
- Los streams tienen límites de tamaño y retención. Monitorizar espacio libre del volumen y crecimiento de `workflow_dlq` y `workflow_advisories`.
- Las ejecuciones antiguas que ya estaban en `WAITING_DELAY` antes de la migración 0041 no tienen fecha/token históricos. La migración no inventa estos valores; deben identificarse y reconciliarse explícitamente.
- El runtime entrega al menos una vez. Cualquier dispatcher externo futuro debe usar claves idempotentes propias; no afirmar efectos externos exactamente una vez.
