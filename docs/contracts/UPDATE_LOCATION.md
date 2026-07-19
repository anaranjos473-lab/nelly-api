# UPDATE_LOCATION.md

## Objetivo

Actualizar la ubicación del repartidor durante el ciclo de entrega.

## Endpoint

`POST /api/delivery/update-location`

## Request

```json
{
  "lat": 16.7528,
  "lng": -93.1167,
  "pedidoId": "PED_123"
}
```

## Response

```json
{
  "ok": true,
  "ubicacion": {
    "lat": 16.7528,
    "lng": -93.1167,
    "timestamp": 1234567890,
    "pedidoId": "PED_123"
  }
}
```

## Validaciones

- `lat` y `lng` deben ser coordenadas válidas.
- Si se envía `pedidoId`, debe corresponder a una misión activa.
- El token debe ser válido.

## Códigos de Error

- `401` token ausente o inválido.
- `400` coordenadas inválidas.
- `404` pedido no encontrado cuando aplique.
- `500` error de persistencia.

## Invariantes

- La ubicación actualiza presencia y contexto operativo.
- No debe alterar el estado final del pedido.

## Dependencias

- `repartidores/{uid}/ubicacion`
- `repartidores/{uid}/ultima_conexion`
- `conductores_activos/{uid}` cuando aplique
- `pedidos/{pedidoId}/ubicacion_repartidor` cuando aplique

## Casos de Prueba

- actualizar ubicación con pedido activo
- actualizar ubicación sin pedido activo
- rechazar coordenadas inválidas

## Historial de Cambios

- 2026-07-19: documento base creado.

