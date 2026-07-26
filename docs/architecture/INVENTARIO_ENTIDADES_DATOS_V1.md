# INVENTARIO DE ENTIDADES Y FUENTES OFICIALES V1

## Estado
Auditoria de gobierno de datos previa a nuevas funcionalidades del piloto controlado.

Fecha: 2026-07-26

## Proposito
Definir:

- que entidades existen en Firebase;
- que servicio administra cada entidad;
- cual es la fuente oficial;
- que duplicidades se aceptan solo como indices derivados;
- que escrituras quedan prohibidas desde paneles web;
- que acciones de limpieza ya fueron aplicadas.

Esta auditoria no cambia contratos certificados. Su funcion es reducir ambiguedad antes de seguir agregando producto.

## Regla principal
Para datos operativos o financieros criticos:

`Panel Web -> Backend -> Firebase RTDB`

Nunca:

`Panel Web -> Firebase directo`

Los paneles pueden leer modelos de consulta cuando corresponda, pero las mutaciones criticas deben pasar por endpoints del backend con autenticacion, validacion, trazabilidad y reglas de negocio.

## Inventario de entidades

| Entidad | Fuente oficial | Propietario | Tipo | Escritura permitida | Consumidores | Estado piloto |
| --- | --- | --- | --- | --- | --- | --- |
| `pedidos/{pedidoId}` | RTDB | Backend de pedidos (`routes/admin.js`, `routes/delivery.js`, `src/controllers/ordersController.js`) | Pedido canonico | Backend solamente | Operaciones, Cocina, Driver, Tracking, CRM, Analytics | Canonica |
| `pedidos_para_reparto/{pedidoId}` | RTDB | Backend de despacho (`routes/delivery.js`, `ordersManager`) | Indice derivado para pool | Backend solamente | Driver, Logistica, Operaciones | Derivada temporal |
| `pedidos_en_camino/{pedidoId}` | RTDB | Backend de entrega (`routes/delivery.js`) | Indice derivado de entrega activa | Backend solamente | Driver, Logistica, tracking operativo | Derivada temporal |
| `pedidos_activos/{pedidoId}` | RTDB | Backend operativo | Indice de pedidos activos | Backend solamente | Admin, Operaciones, metricas | Derivada temporal |
| `pedidos_completados/{pedidoId}` | RTDB | Backend de cierre | Indice historico de pedidos cerrados | Backend solamente | Finanzas, Analytics, auditoria | Derivada/historica |
| `repartidores/{uid}` | RTDB | Backend de repartidores, deuda y entrega | Perfil operativo canonico del conductor | Backend solamente | Driver, Logistica, Finanzas, Admin | Canonica |
| `usuarios/repartidores/{uid}` | RTDB | Backend/admin de usuarios | Espejo legacy de identidad/perfil | Backend solamente | Admin legacy, compatibilidad | Duplicada controlada |
| `conductores_activos/{uid}` | RTDB | Backend de ubicacion y elegibilidad | Indice vivo de disponibilidad/ubicacion | Backend solamente | Logistica, mapa, despacho | Derivada |
| `repartidores_activos/{uid}` | RTDB | Backend legacy de repartidores | Indice vivo legacy | Backend solamente | Pantallas antiguas/compatibilidad | Duplicada a migrar |
| `finanzas` | RTDB | Backend financiero y agentes | Agregado financiero operativo | Backend/agentes solamente | Finanzas, Operaciones, Analytics | Derivada |
| `historial_ventas` | RTDB | Backend de cierre/finanzas | Historial de ventas | Backend solamente | Analytics, Finanzas, Comercial | Derivada de pedidos |
| `liquidaciones/{id}` | RTDB | Backend financiero (`routes/panel.js`) | Liquidacion o pago conciliable | Backend solamente | Centro Financiero | Canonica financiera del piloto |
| `liquidaciones_auditoria/{id}` | RTDB | Backend financiero | Auditoria de liquidaciones | Backend solamente | Finanzas, auditoria, soporte | Auditoria |
| `market_v1/restaurantes/{id}` | RTDB | Backend admin de restaurantes | Alta controlada de restaurantes | Backend solamente | Gobierno, Comercio | Canonica piloto |
| `notificaciones` | RTDB | Backend/agentes | Modelo de consulta de alertas | Backend/agentes solamente | Operaciones, soporte | Derivada |
| `eventos_operativos` | RTDB | Backend/agentes | Bitacora tecnica/operativa | Backend/agentes solamente | Developer, soporte, auditoria | Auditoria |
| `configuracion/sistema` | RTDB | Backend/admin/agentes | Parametros operativos | Backend solamente | Agentes, Developer, Admin | Configuracion |
| `zonas_calor` | RTDB | Backend/admin/analytics | Zonas y lectura territorial | Backend solamente | Analytics, Operaciones, Logistica | Config/derivada |
| `chats/{pedidoId}` | RTDB | Futuro servicio backend de chat | Conversacion por pedido | Backend solamente | Pendiente | Candidata post-piloto |
| `users` | Firestore | `src/controllers/usersController.js` | Usuarios legacy/API generica | Backend solamente | API legacy | Requiere decision si se mantiene |
| `pedidos` | Firestore | Ninguno activo para piloto | Duplicado legacy de pedidos | Prohibida para paneles | Ninguno oficial | Deprecada |

## Duplicidades identificadas

| Informacion duplicada | Riesgo | Decision para piloto | Accion |
| --- | --- | --- | --- |
| `pedidos/{id}` en RTDB vs `pedidos/{id}` en Firestore | Estados divergentes y cierres inconsistentes | RTDB es fuente oficial | Se retiraron utilidades publicas que escribian Firestore `pedidos`. |
| `repartidores/{uid}` vs `usuarios/repartidores/{uid}` | Deuda, bloqueo o perfil pueden leerse desde el espejo equivocado | `repartidores/{uid}` es canonico operativo/financiero | Finanzas y elegibilidad deben priorizar `repartidores`. |
| `conductores_activos/{uid}` vs `repartidores_activos/{uid}` | Dos indices vivos de conductor | Mantener como derivados hasta migracion | No escribir desde paneles; migrar consumidores gradualmente. |
| `pedidos_para_reparto`, `pedidos_en_camino`, `pedidos_activos` vs `pedidos` | Indices pueden quedar sucios si se escriben fuera del backend | Solo backend los mantiene | No permitir mutaciones directas de panel. |
| `finanzas`, `historial_ventas`, `liquidaciones` vs pedidos entregados | Metricas financieras pueden no cuadrar | Pedidos entregados + liquidaciones son base operativa | Pagos y reinicios pasan por backend financiero. |

## Auditoria de escrituras desde paneles

Resultado de la auditoria en `public/`:

| Archivo | Hallazgo | Riesgo | Accion aplicada |
| --- | --- | --- | --- |
| `public/js/admin-dashboard.js` | Bloqueo manual intentaba escribir RTDB directo antes del backend. | Mutacion critica sin trazabilidad suficiente. | Se elimino la escritura directa; ahora usa solo `/api/admin/repartidores/manual-lock`. |
| `public/subirEvidencia.js` | Actualizaba Firestore `pedidos` desde frontend. | Duplicidad Firestore/RTDB y cierre de pedido fuera del contrato backend. | Archivo retirado de `public`. |
| `public/test_evidencia.js` | Prueba publica que dependia de `subirEvidencia.js`. | Exposicion de flujo legacy. | Archivo retirado de `public`. |
| `public/test_chat_listener.js` | Escribia RTDB `chats` directo desde navegador. | Mutacion directa de entidad candidata sin backend. | Archivo retirado de `public`. |
| `public/js/finanzas.js` | Registra pagos via `/api/panel/finanzas/registrar-pago-deuda`. | Correcto. | Sin cambio. |

## Propietarios por dominio

| Dominio | Propietario tecnico | Entidades principales |
| --- | --- | --- |
| Pedidos y estados | Backend pedidos/delivery | `pedidos`, `pedidos_para_reparto`, `pedidos_en_camino`, `pedidos_activos` |
| Repartidores y elegibilidad | Backend repartidores + `debtLockService` | `repartidores`, `conductores_activos`, `usuarios/repartidores` |
| Finanzas | Backend financiero (`routes/panel.js`, servicios de deuda/liquidacion) | `finanzas`, `historial_ventas`, `liquidaciones`, `liquidaciones_auditoria` |
| Restaurantes | Backend admin | `market_v1/restaurantes` |
| Soporte y agentes | Backend/agentes | `notificaciones`, `eventos_operativos` |
| Configuracion | Backend admin/agentes | `configuracion/sistema`, `zonas_calor` |
| Usuarios legacy | Backend usuarios | Firestore `users` |

## Reglas de integracion

1. Toda escritura financiera debe pasar por backend.
2. Toda escritura de pedido debe pasar por backend.
3. Toda escritura de deuda, bloqueo o elegibilidad de repartidor debe pasar por backend.
4. Firestore `pedidos` no debe usarse como fuente de verdad del piloto.
5. Los indices derivados pueden existir, pero no pueden ser editados directamente por paneles.
6. Si un nuevo modulo necesita mutar datos, debe crear o reutilizar un endpoint backend.
7. Si una entidad existe en Firestore y RTDB, debe documentarse cual es canonica antes de escribir.

## Pendientes controlados

| Pendiente | Severidad | Motivo |
| --- | --- | --- |
| Decidir futuro de Firestore `users`. | Baja | No bloquea piloto; requiere ADR si se convierte en identidad oficial. |
| Migrar consumidores de `repartidores_activos` hacia `conductores_activos` o viceversa. | Media | Evita doble indice vivo en versiones posteriores. |
| Definir backend de chat si se activa mensajeria. | Baja | `chats` queda como candidata post-piloto. |
| Consolidar historicos financieros contra pedidos entregados. | Media | Necesario antes de contabilidad completa, no bloquea alcance minimo de piloto. |

## Criterio de cierre

Esta auditoria queda valida para piloto si:

- no existen escrituras directas desde `public/` sobre `pedidos`, `finanzas`, `liquidaciones`, `repartidores` o deuda;
- el Centro Financiero registra pagos por backend;
- las duplicidades quedan documentadas;
- cualquier nueva mutacion futura pasa por el gate de arquitectura.
