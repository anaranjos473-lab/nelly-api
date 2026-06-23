# SSOT_MIGRATION_MAP_2026_06_23.md

## Objetivo
Consolidar la operación viva de Nelly alrededor de una única fuente de verdad para pedidos y dejar claros los índices derivados que aún pueden existir temporalmente.

## Fuente de verdad operativa

### Canonical order record
El registro maestro de cada pedido debe vivir en:

- `pedidos/{pedidoId}`

Ejemplo:

```json
{
  "id": "pedido_123",
  "estado": "LISTO",
  "cliente": "Juan",
  "monto": 129,
  "repartidor_id": null,
  "updatedAt": 1710000000000
}
```

## Estados canónicos

Se recomienda usar un conjunto fijo de estados:

- `PENDIENTE`
- `LISTO`
- `EN_CURSO`
- `ENTREGADO`
- `CANCELADO`

Las pantallas y textos de UI pueden traducir esos estados a etiquetas amigables, pero el backend debe trabajar con estos valores únicos.

## Mapa de componentes

| Componente | Fuente actual | Fuente objetivo | Observación |
| --- | --- | --- | --- |
| Cocina | `pedidos`, `pedidos_para_reparto`, `pedidos_en_camino` | `pedidos` filtrando `estado in [PENDIENTE, LISTO]` | Debe ver el estado operativo del pedido sin depender de índices dedicados. |
| Admin Dashboard | endpoints de métricas sobre `pedidos`, `finanzas`, `historial_ventas` | `pedidos` para ciclo operativo y `finanzas`/`historial_ventas` solo para métricas | Las métricas deben derivarse desde el mismo ciclo de vida. |
| Repartidor Web | `pedidos_para_reparto` | `pedidos` filtrando `estado=LISTO` | Evitar depender de una vista derivada. |
| Android | actualmente escucha `pedidos_para_reparto`; la APK instalada muestra evidencia de `pedidos_en_camino` | `pedidos` filtrando `estado=LISTO` para disponibles y `estado=EN_CURSO` para activo | Pendiente validar en dispositivo real. |
| Finanzas | `finanzas`, `historial_ventas`, y algunos datos transaccionales del repartidor | `pedidos` con `estado=ENTREGADO` como fuente de verdad de ciclo y `finanzas` como registro de impacto | Las métricas financieras deben derivarse del cierre real del pedido. |

## Índices derivados temporales

Los siguientes nodos pueden existir temporalmente mientras Android y otros consumidores todavía dependen de ellos:

- `pedidos_para_reparto` → índice de pedidos en estado `LISTO`
- `pedidos_en_camino` → índice de pedidos en estado `EN_CURSO`
- `pedidos_completados` → índice de pedidos ya entregados

## Flujo propuesto

```text
ADMIN -> PENDIENTE
COCINA -> LISTO
ANDROID -> EN_CURSO
ANDROID -> ENTREGADO
```

## Reglas de arquitectura

1. `pedidos/{pedidoId}` es la única verdad operativa.
2. Los índices derivados no deben ser la fuente de decisión para ninguna pantalla.
3. Cada cambio de estado debe actualizar el registro maestro y, si aplica, los índices derivados.
4. Las pantallas deben leer filtros sobre `pedidos` y no duplicar lógica de negocio.

## Orden de migración

### Fase 1 - Cerrar Gate 3 Android
- Confirmar que la APK instalada recibe un pedido real.
- Confirmar que acepta y cambia a `EN_CURSO`.
- Confirmar que completa y cambia a `ENTREGADO`.

### Fase 2 - Consolidar el contrato de estados
- Definir el estado canónico.
- Implementar la lectura de pantallas desde `pedidos`.
- Mantener los índices derivados solo como sincronización.

### Fase 3 - Migración de consumidores
- Cocina pasa a leer `pedidos` con filtros de estado.
- Android pasa a leer `pedidos` con filtros de disponibilidad y actividad.
- Dashboard y finanzas pasan a derivar métricas desde el mismo ciclo de vida.

### Fase 4 - Deprecación gradual
- Reducir el uso de `pedidos_para_reparto` y `pedidos_en_camino` como fuentes de lectura.
- Eliminar o convertir a índices temporales en cuanto todos los consumidores estén migrados.

## Criterio de aceptación

Se considera migración exitosa cuando:

- todos los componentes operan desde el mismo estado del pedido;
- una actualización del pedido cambia la experiencia de todas las pantallas sin depender de rutas alternas;
- las métricas se derivan del mismo ciclo de vida y ya no muestran inconsistencias visibles.
