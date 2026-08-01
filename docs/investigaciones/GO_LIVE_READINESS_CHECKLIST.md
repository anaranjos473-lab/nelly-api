# Go-Live Readiness Checklist

Checklist operativa para cerrar bloqueadores antes del piloto controlado.

## Objetivo

Verificar que un operador y un repartidor vean solo informacion real y vigente.

## Orden de ejecucion

### 1. PILOT_DATASET_001

- [ ] Abrir el frente `PILOT_DATASET_001`
- [ ] Tomar 10 pedidos de referencia
- [ ] Llenar [`PILOT_DATASET_001_MATRIX.md`](./PILOT_DATASET_001_MATRIX.md)
- [ ] Para cada pedido, registrar:
  - [ ] existencia en RTDB
  - [ ] estado real en RTDB
  - [ ] presencia en `active_orders`
  - [ ] presencia en `today_orders`
  - [ ] presencia en `historical_orders`
  - [ ] visibilidad en Panel
  - [ ] visibilidad en Driver
- [ ] Marcar el punto exacto donde deja de ser consistente
- [ ] Confirmar si la inconsistencia nace en dataset, contrato o lectura
- [ ] Adjuntar evidencia por pedido

### 2. KITCHEN_SYNC_001

- [ ] Abrir el frente `KITCHEN_SYNC_001`
- [ ] Confirmar que `kitchenState.orders` se reconstruye solo desde el contrato vigente
- [ ] Confirmar que `archiveEngineActiveOrdersCache` no revive pedidos obsoletos
- [ ] Verificar si `window.__nellyOperationOrders` conserva pedidos antiguos
- [ ] Verificar que el mensaje `Pedido no encontrado en cocina` desaparece al operar pedidos vigentes
- [ ] Confirmar que la UI no reutiliza memoria obsoleta tras recarga

### 3. Recertificacion E2E

- [ ] Resolver `GO_LIVE_DRIVER_001`
- [ ] Crear un pedido nuevo
- [ ] Despacharlo
- [ ] Aceptarlo desde un solo driver
- [ ] Entregarlo
- [ ] Confirmar que desaparece de vistas operativas
- [ ] Confirmar que aparece solo en entregados / historico
- [ ] Recargar panel
- [ ] Recargar driver
- [ ] Confirmar que no reaparece como activo

### 4. Criterios de salida

- [ ] No aparecen pedidos historicos en el driver
- [ ] No aparecen pedidos historicos en cocina
- [ ] Los pedidos entregados migran al historico
- [ ] El panel queda vacio cuando no hay pedidos activos
- [ ] Una recarga completa no revive datos antiguos
- [ ] La recertificacion E2E pasa sin observaciones

### 5. Decision de piloto

- [ ] Si todo lo anterior pasa, iniciar piloto controlado
- [ ] Si algo falla, abrir solo el frente causal correspondiente
- [ ] No ampliar alcance
- [ ] No tocar mas de una capa por iteracion

## Acta de liberacion

- [GO_LIVE_CERTIFICATION_001](./../architecture/PILOTO_CONTROLADO/GO_LIVE_CERTIFICATION_001.md)

## Regla de cierre

No iniciar piloto si un operador o un repartidor verian informacion obsoleta, historica o inconsistente.

## Evidencia minima por frente

- Capturas
- Logs
- TraceId
- Payload
- Snapshot RTDB
- Respuesta HTTP
