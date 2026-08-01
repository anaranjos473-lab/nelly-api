# REGRESSION_SUITE_DOMAIN

## Objetivo

Mantener una suite de regresion minima que proteja las reglas criticas del dominio antes de cada liberacion relevante.

## Casos positivos

| ID | Accion | HTTP esperado | Estado esperado |
|---|---|---|---|
| POS-001 | `dispatch-order` | `200` | `LISTO` |
| POS-002 | `accept-order` | `200` | `EN_CURSO` |
| POS-003 | `complete-order` | `200` | `ENTREGADO` |

## Casos negativos

| ID | Accion | HTTP esperado | Estado esperado |
|---|---|---|---|
| NEG-001 | `accept-order` con driver bloqueado | `403` | `LISTO` |
| NEG-002 | `complete-order` sin aceptar | `409` | `LISTO` |
| NEG-003 | `accept-order` con deuda superior al limite | `403` | `LISTO` |

## Criterios

- Un `403` o `409` puede ser exito si corresponde al comportamiento del dominio.
- El objetivo no es evitar rechazos, sino certificar que ocurren donde deben ocurrir.

