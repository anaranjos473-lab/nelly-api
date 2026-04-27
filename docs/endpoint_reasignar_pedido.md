# Documentación rápida: Endpoint de Reasignación de Pedido

**POST** `/api/pedidos/reasignar`

Reasigna un pedido en curso a otro repartidor disponible.

## Body (JSON)
```json
{
  "pedidoId": "string",           // ID del pedido a reasignar (ej: "PED12345")
  "nuevoRepartidorId": "string"   // UID del repartidor destino (ej: "UID67890")
}
```

## Respuesta exitosa
```json
{
  "ok": true,
  "mensaje": "Pedido PED12345 reasignado a UID67890"
}
```

## Errores comunes
- 400: Faltan datos requeridos
- 404: Pedido no encontrado
- 500: Error interno al reasignar

## Notas
- El cambio se refleja en RTDB bajo `pedidos_en_camino/{pedidoId}/logistica/repartidor_id`.
- Se envía alerta a Discord si está configurado.
- Útil para bots, paneles administrativos y flujos de rescate.
