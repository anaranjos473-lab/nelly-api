# COMPLETE_ORDER.md

## Objetivo

Cerrar definitivamente una entrega y dejar el sistema en estado consistente.

## Endpoint

`POST /api/delivery/complete-order`

## Request

```json
{
  "pedidoId": "PED_123",
  "completion_type": "normal"
}
```

## Response

```json
{
  "ok": true,
  "pedidoId": "PED_123",
  "estado": "ENTREGADO",
  "repartidorId": "uid",
  "alreadyCompleted": false
}
```

## Validaciones

- `pedidoId` es obligatorio.
- El token debe ser válido.
- El pedido debe existir.
- Si no es panel, debe corresponder al repartidor asignado.
- No se puede cerrar un pedido fuera del flujo operativo.

## Códigos de Error

- `400` pedidoId faltante.
- `401` token inválido o ausente.
- `403` usuario no autorizado.
- `404` pedido no encontrado.
- `409` transición inválida.

## Invariantes

- El pedido siempre termina en `ENTREGADO`.
- `repartidores/{uid}/pedido_activo` se limpia.
- `pedidos_en_camino/{pedidoId}` se elimina.
- `pedidos_para_reparto/{pedidoId}` se elimina.
- `completion_type` y `motivo_cierre` no alteran el cierre base.

## Dependencias

- `pedidos/{pedidoId}`
- `repartidores/{uid}/pedido_activo`
- `pedidos_en_camino/{pedidoId}`
- `pedidos_para_reparto/{pedidoId}`
- finanzas de reparto

## Casos de Prueba

- cerrar pedido activo normalmente
- rechazar cierre de pedido inexistente
- rechazar cierre por usuario no asignado
- verificar limpieza de nodos auxiliares

## Historial de Cambios

- 2026-07-19: documento base creado.

