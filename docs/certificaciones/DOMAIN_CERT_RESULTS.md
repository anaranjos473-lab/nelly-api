# DOMAIN_CERT_RESULTS_001

## Proposito

Registrar el resultado oficial de la ejecucion de la certificacion funcional del dominio.

## Resultado final

| Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|
| POS-001 | `200` | `200` | `PASS` |
| POS-002 | `200` | `200` | `PASS` |
| POS-003 | `200` | `200` | `PASS` |
| NEG-001 | `403` | `403` | `PASS` |
| NEG-002 | `409` | `409` | `PASS` |
| NEG-003 | `403` | `403` | `PASS` |

## Evidencia resumida

- `POS-001`: `dispatch-order` devolvio `200` y dejo el pedido en `LISTO`.
- `POS-002`: `dispatch-order` + `accept-order` devolvieron `200`; el pedido quedo en `EN_CURSO`.
- `POS-003`: `dispatch-order` + `accept-order` + `complete-order` devolvieron `200`; el pedido quedo en `ENTREGADO`.
- `NEG-001`: `accept-order` con repartidor bloqueado devolvio `403` y el pedido permanecio en `LISTO`.
- `NEG-002`: `complete-order` sin reparto previo devolvio `409` y el pedido permanecio en `LISTO`.
- `NEG-003`: `accept-order` con deuda superior al limite devolvio `403` y el pedido permanecio en `LISTO`.

## Evidencia requerida

Cada caso registra:

- `traceId`
- fecha y hora
- endpoint
- payload enviado
- payload recibido
- HTTP status
- estado inicial
- estado final
- logs relevantes
- resultado `PASS` / `FAIL`

## Cierre

La matriz queda cerrada con evidencia reproducible y lista para integrarse a la suite de regresion.
