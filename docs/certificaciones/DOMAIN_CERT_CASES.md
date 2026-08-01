# DOMAIN_CERT_CASES_001

## Proposito

Consolidar la matriz oficial de casos positivos y negativos para la certificacion
funcional del dominio.

## Casos positivos

| ID | Objetivo | Accion | Resultado esperado | Estado esperado |
|---|---|---|---|---|
| POS-001 | Certificar `dispatch-order` | `dispatch-order` | `HTTP 200` | `LISTO` |
| POS-002 | Certificar `accept-order` | `accept-order` | `HTTP 200` | `EN_CURSO` |
| POS-003 | Certificar `complete-order` | `complete-order` | `HTTP 200` | `ENTREGADO` |

## Casos negativos

| ID | Objetivo | Escenario | Resultado esperado | Mensaje esperado |
|---|---|---|---|---|
| NEG-001 | Driver bloqueado | `accept-order` con driver bloqueado | `HTTP 403` | `Limite de deuda alcanzado` |
| NEG-002 | Pedido fuera de estado | `complete-order` sin aceptar | `HTTP 409` | `Transicion invalida` |
| NEG-003 | Deuda superior al limite | `accept-order` con deuda superior al limite | `HTTP 403` | `Limite de deuda alcanzado` |

## Criterio de certificacion

Los casos negativos se consideran `PASS` cuando el dominio devuelve el rechazo
esperado y mantiene la consistencia del estado.
