# ADR-002: Data Model Canonicalization

## Estado

Activo

## Contexto

El ecosistema mantiene múltiples rutas para representar repartidores y presencia. Eso provoca contradicciones, lecturas duplicadas y decisiones inconsistentes entre panel, backend y Android.

## Decisión

- `repartidores/{uid}` es la fuente canónica del repartidor.
- `repartidores_activos/{uid}` representa presencia o telemetría.
- `pedidos/{pedidoId}` es la fuente canónica del pedido.
- `usuarios/repartidores` queda como compatibilidad temporal o semilla heredada.

## Consecuencias

- Android y backend deben leer el mismo perfil canónico.
- El panel debe preferir endpoints agregados del backend.
- Los datos legados deben fusionarse solo si no rompen la fuente oficial.

## Relación con el sistema

Este ADR complementa:

- [`DATA_MODEL.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/DATA_MODEL.md)
- [`AGENTS.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/AGENTS.md)

