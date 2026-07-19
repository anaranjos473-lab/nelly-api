# ACCEPT_ORDER.md

## Objetivo

Aceptar un pedido disponible desde el repartidor autenticado.

## Endpoint

`POST /api/delivery/accept-order`

## Request

```json
{
  "pedidoId": "PED_123"
}
```

## Response

```json
{
  "ok": true,
  "pedidoId": "PED_123",
  "repartidorId": "uid"
}
```

## Validaciones

- `pedidoId` es obligatorio.
- El token debe corresponder a un usuario autenticado.
- El pedido debe existir.
- El pedido debe estar en estado `LISTO`.
- El repartidor no debe estar bloqueado por deuda.
- Si el pedido ya tiene repartidor asignado, debe coincidir con el solicitante o rechazarse.

## Códigos de Error

- `400` pedidoId faltante.
- `401` token inválido o ausente.
- `403` repartidor no autorizado o bloqueado.
- `404` pedido no disponible.
- `409` transición inválida o pedido ya tomado.

## Invariantes

- Un solo repartidor puede ganar la aceptación.
- La aceptación es atómica.
- El backend actualiza el pedido y `repartidores/{uid}/pedido_activo`.

## Dependencias

- `repartidores/{uid}`
- `pedidos/{pedidoId}`
- `pedidos_para_reparto/{pedidoId}`
- `pedidos_en_camino/{pedidoId}`

## Casos de Prueba

- aceptar un pedido `LISTO` con repartidor válido
- rechazar intento con pedido no disponible
- rechazar intento con repartidor bloqueado
- rechazar intento concurrente duplicado

## Historial de Cambios

- 2026-07-19: documento base creado.

