# DOMAIN_CERT_DATASET_001

## Proposito

Definir el dataset fijo y reproducible para certificar el dominio sin depender
de pedidos reales en produccion.

## Driver A - Ruta feliz

| Campo | Valor esperado |
|---|---|
| `bloqueado_por_deuda` | `false` |
| `deuda` | `0` |
| `limite` | Mayor que `deuda` |
| `disponible` | `true` |

## Driver B - Ruta negativa financiera

| Campo | Valor esperado |
|---|---|
| `bloqueado_por_deuda` | `true` |
| `deuda` | Igual o superior al limite, o el valor definido por la regla de bloqueo |
| `disponible` | `true` |

## Pedido base

| Campo | Valor esperado |
|---|---|
| Estado inicial | `LISTO` |
| Asignado | `false` |

## Reglas de uso

- El dataset debe reutilizarse en cada certificacion.
- No debe usarse para operacion real.
- Cualquier cambio al dataset debe documentarse antes de la prueba.
