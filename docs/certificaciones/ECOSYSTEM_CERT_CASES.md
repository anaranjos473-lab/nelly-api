# ECOSYSTEM_CERT_CASES

## Casos Positivos

| Caso | Objetivo | Resultado esperado |
|---|---|---|
| POS-001 | Flujo completo end to end | `PASS` |
| POS-002 | Dos repartidores | `PASS` |
| POS-003 | Cinco pedidos simultaneos | `PASS` |
| POS-004 | Pago en efectivo | `PASS` |
| POS-005 | Pago con tarjeta | `PASS` |
| POS-006 | Tiempo real | `PASS` |

## Casos Negativos

| Caso | Objetivo | Resultado esperado |
|---|---|---|
| NEG-001 | Driver bloqueado | `403` |
| NEG-002 | Pedido cancelado | `PASS` con estados consistentes |
| NEG-003 | Pedido invalido | `409` |
| NEG-004 | Reconexion | `PASS` con resincronizacion |
| NEG-005 | Concurrencia | `PASS` con adjudicacion unica |
| NEG-006 | Repartidor desconectado | `PASS` con rechazo o replanificacion |

## Regla

Ningun caso debe ejecutarse sin evidencia tecnica, visual y documental.
