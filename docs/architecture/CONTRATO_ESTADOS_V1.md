# CONTRATO_ESTADOS_V1

## Objetivo

Alinear temporalmente el backend con la APK Android instalada sin iniciar SSOT V2 ni cambiar la estructura de Firebase.

Este contrato existe porque la APK instalada reconoce estados diferentes a los que el backend SSOT actual produce en `estado`.

## Tabla de compatibilidad

| Estado canonico | Alias aceptados | Alias Android instalado |
| --- | --- | --- |
| `LISTO` | `PENDIENTE`, `LISTO_PARA_REPARTO`, `ESPERANDO_REPARTIDOR`, `DESPACHO` | `PENDIENTE` |
| `EN_CAMINO` | `EN_CURSO`, `EN_REPARTO`, `REPARTO` | `EN_CURSO` |
| `ENTREGADO` | `FINALIZADO` | `ENTREGADO` |

## Regla V1

- El backend debe aceptar alias canonicos y alias Android durante Gate 3.
- `pedidos/{id}` sigue siendo el registro maestro operativo actual.
- `pedidos_para_reparto/{id}` y `pedidos_en_camino/{id}` pueden exponer `estado` en formato Android para compatibilidad con la APK instalada.
- `estado_pedido` conserva el estado canonico backend cuando exista.

## No hacer en V1

- No iniciar SSOT V2.
- No cambiar reglas Firebase.
- No tocar Render como parte de esta decision.
- No modificar Android hasta confirmar que el backend compatible permite completar Gate 3.

## Hipotesis a validar

Si `pedidos_para_reparto/{id}/estado = PENDIENTE` y `pedidos_en_camino/{id}/estado = EN_CURSO`, la APK instalada deja de caer en el fallback visual `OPERACION ACTIVA`.

## Gate 3

Validar desde telefono real:

1. Admin crea pedido.
2. Cocina despacha.
3. Android ve pedido disponible.
4. Android acepta.
5. Android entrega.
6. Repetir tres veces seguidas.

Resultado requerido:

`PASS`

`PASS`

`PASS`
