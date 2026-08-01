# ATOMIC_ASSIGNMENT_001 - Casos

## Casos positivos

| Caso | Escenario | Resultado esperado |
|---|---|---|
| AA-001 | Un solo repartidor acepta un pedido libre | `200` |
| AA-002 | El pedido queda asignado una sola vez | Unico ganador |

## Casos negativos

| Caso | Escenario | Resultado esperado |
|---|---|---|
| AA-003 | Dos repartidores aceptan al mismo tiempo | Un solo `200` |
| AA-004 | Segundo intento sobre pedido ya asignado | `409` o rechazo definido por dominio |

