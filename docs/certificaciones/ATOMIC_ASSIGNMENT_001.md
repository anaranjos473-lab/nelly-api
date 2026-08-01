# ATOMIC_ASSIGNMENT_001

## Estado

`OPEN`

## Objetivo

Certificar que `accept-order` adjudica un pedido exactamente una vez, incluso bajo concurrencia.

## Alcance

- `POST /api/delivery/accept-order`
- Concurrencia entre dos o mas repartidores
- Persistencia del pedido y del repartidor
- Respuesta HTTP y estado final del pedido

## No alcance

- `dispatch-order`
- `complete-order`
- UI de panel
- Reglas de finanzas ajenas a la adjudicacion
- Cambios de contrato

## Hipotesis de trabajo

1. La validacion ocurre antes de una escritura atomica.
2. La operacion no usa `runTransaction()` o equivalente.
3. El bloqueo es insuficiente bajo concurrencia real.
4. El estado se lee de forma correcta, pero la escritura no protege la ventana de carrera.

## Evidencia requerida

- `traceId`
- `pedidoId`
- `driverId`
- `payload`
- `HTTP status`
- `estado inicial`
- `estado final`
- logs relevantes
- resultado `PASS` o `FAIL`

## Criterio de salida

El frente solo puede cerrarse cuando:

- un solo repartidor obtiene `200`
- los repartidores concurrentes reciben el rechazo esperado
- el pedido queda asignado exactamente una vez
- la evidencia demuestra atomicidad real

