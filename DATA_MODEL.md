# DATA_MODEL.md
# Nelly Delivery

Este documento fija las rutas canónicas del modelo de datos para evitar lecturas duplicadas, ramas paralelas y decisiones inconsistentes.

## Principio

- Una entidad operativa debe tener una sola fuente oficial.
- Si existe una ruta de compatibilidad, debe quedar marcada como legado o auxiliar.
- El panel debe leer del backend cuando sea posible.
- La fuente canónica de cada entidad debe estar declarada explícitamente.

## Rutas Oficiales

| Entidad | Ruta canónica | Escritura principal | Lectura principal | Notas |
| --- | --- | --- | --- | --- |
| Repartidor | `repartidores/{uid}` | Backend | Backend, Android | Fuente oficial del perfil operativo, deuda, estado y pedido activo. |
| Presencia repartidor | `repartidores_activos/{uid}` | Backend / procesos de presencia | Panel, soporte, mapas | Solo presencia y telemetría en vivo. No es fuente financiera ni de identidad. |
| Pedido | `pedidos/{pedidoId}` | Backend | Backend, Android, panel | Fuente oficial del ciclo del pedido. |
| Pedido en reparto | `pedidos_en_camino/{pedidoId}` | Backend | Backend | Nodo auxiliar para transición operativa. |
| Pedido disponible para reparto | `pedidos_para_reparto/{pedidoId}` | Backend | Backend, Android, radar | Nodo auxiliar del radar. |
| Finanzas agregadas | `finanzas` | Backend | Panel | Resumen de ingresos y métricas globales. |
| Historial ventas | `historial_ventas` | Backend | Panel | Historial agregado para métricas. |

## Decisiones Actuales

### Repartidores

- `repartidores/{uid}` es la rama canónica para el flujo operativo.
- `usuarios/repartidores` se considera compatibilidad temporal o semilla de panel.
- `repartidores_activos/{uid}` se usa como vista de presencia, no como perfil oficial.

### Bloqueo por deuda

- `bloqueado_por_deuda`, `deuda_actual` y `limite_deuda` deben vivir en `repartidores/{uid}`.
- El panel puede reflejar esos campos, pero no debe inventar una fuente distinta.
- `accept-order` debe validar contra la misma rama canónica.

### Android

- Android lee estado operativo desde `repartidores/{uid}` a través de `PedidoRepository`.
- Android no decide el estado final del pedido.

### Panel

- El panel debe consultar endpoints agregados del backend.
- Evitar lecturas directas a RTDB desde la UI para datos que puedan consolidarse en backend.

## Contratos Críticos

| Contrato | Propósito | Invariante |
| --- | --- | --- |
| `accept-order` | Aceptar pedido | Solo acepta si el pedido está `LISTO` y el repartidor no está bloqueado. |
| `complete-order` | Cerrar pedido | Siempre termina en `ENTREGADO` y limpia `pedido_activo` + nodos auxiliares. |
| `driver-token` | Autenticación repartidor | Debe producir identidad válida para Android y panel de pruebas. |
| `manual-lock` | Bloqueo manual | Debe escribir en la rama canónica del repartidor. |
| `metricas/rentabilidad` | Resumen financiero | Debe leer datos agregados, no recorrer rutas operativas en el cliente. |

## Regla Operativa

Si una nueva tarea requiere tocar una de estas rutas:

1. Confirmar si la ruta es canónica o auxiliar.
2. Confirmar qué componente escribe.
3. Confirmar qué componente lee.
4. Confirmar si existe compatibilidad con datos legados.
5. Cambiar solo una fuente de verdad, nunca dos.
