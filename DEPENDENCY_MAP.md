# DEPENDENCY_MAP.md
# Matriz de Dependencias Nelly OS

| Componente | Depende de | Impacta |
| --- | --- | --- |
| Radar | `pedidos`, `repartidores/{uid}` | Android, panel, aceptación |
| `complete-order` | `pedidos/{pedidoId}`, `repartidores/{uid}/pedido_activo` | Android, finanzas, panel |
| Finanzas | `pedidos`, `historial_ventas`, `finanzas` | panel, reportes, bloqueo por deuda |
| Android Tracking | `FirebaseAuth`, `repartidores/{uid}`, `pedidos/{pedidoId}` | seguimiento, cierre, UI |
| Admin Dashboard | backend API, `finanzas`, `repartidores` | operación, bloqueo, métricas |
| `driver-token` | Firebase Admin, UID de repartidor | Android, panel de pruebas |

## Regla

Antes de tocar un componente, revisar sus dependencias directas y sus impactos para evitar regresiones en cadena.

