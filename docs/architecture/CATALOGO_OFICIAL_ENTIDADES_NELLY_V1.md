# CATALOGO OFICIAL DE ENTIDADES NELLY V1

## Estado
Referencia unica de entidades para piloto controlado y evolucion post-piloto.

Fecha: 2026-07-26

## Proposito
Consolidar en una sola tabla:

- fuente oficial del piloto;
- fuente oficial objetivo;
- servicio propietario;
- quien puede escribir;
- quien puede leer;
- si existe proyeccion en Realtime Database;
- Centro de Trabajo consumidor;
- estado de gobierno del dato.

Este catalogo es la referencia que debe consultarse antes de agregar una entidad nueva, crear una coleccion, escribir en Firebase o modificar una fuente existente.

## Regla de uso
Ningun dato critico entra al ecosistema si no puede responder:

`Entidad -> Fuente oficial -> Propietario -> Escritor autorizado -> Consumidor -> Proyeccion permitida`

Si una entidad no aparece aqui, debe pasar por el Gate de Cambio de Datos antes de implementarse.

## Catalogo oficial

| Entidad | Fuente oficial piloto | Fuente oficial objetivo | Servicio propietario | Puede escribir | Puede leer / Centros | Proyeccion RTDB | Estado | Objetivo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `pedidos/{pedidoId}` | RTDB | Firestore `orders/{id}` | PedidoService / DeliveryService | Backend | Operaciones, Comercio, Logistica, CRM, Finanzas, Analytics, Tracking | Es canonica piloto; luego sera proyeccion operativa | Canonica piloto | Migrar post-piloto con adaptador certificado. |
| `orders/{id}` | No oficial en piloto | Firestore | PedidoService | Backend post-migracion | Operaciones, Comercio, Logistica, CRM, Finanzas, Analytics | `operational_view/orders/{id}` futura | Objetivo documentado | No activar como escritor paralelo durante piloto. |
| Firestore `pedidos` | Ninguna | Ninguna | Sin propietario activo | Nadie | Ninguno oficial | No aplica | Deprecada | Eliminar o aislar referencias legacy. |
| `pedidos_para_reparto/{pedidoId}` | RTDB | RTDB proyeccion | DispatchService | Backend | Driver, Operaciones, Logistica | Si | Proyeccion viva | Mantener como indice derivado. |
| `pedidos_en_camino/{pedidoId}` | RTDB | RTDB proyeccion | DeliveryService | Backend | Driver, Cliente, Operaciones, Logistica | Si | Proyeccion viva | Mantener derivada y limpiar al cerrar. |
| `pedidos_activos/{pedidoId}` | RTDB | RTDB proyeccion | OperationalService | Backend | Operaciones, Gobierno, Analytics | Si | Proyeccion | Mantener derivada. |
| `pedidos_completados/{pedidoId}` | RTDB | Firestore historial / RTDB proyeccion | CompletionService | Backend | Finanzas, Analytics, Gobierno | Si | Proyeccion historica | Consolidar con historial post-piloto. |
| `order_events` | Firestore / auditoria objetivo | Firestore | EventService | Backend / agentes | Developer, Operaciones, Analytics | Alertas vivas si aplica | Auditoria | Usar como trazabilidad historica. |
| `repartidores/{uid}` | RTDB | Firestore `drivers/{uid}` + RTDB estado vivo | DriverService / DebtLockService | Backend | Logistica, Finanzas, Gobierno, Driver | Estado vivo separado | Canonica piloto | Separar perfil persistente y presencia post-piloto. |
| `usuarios/repartidores/{uid}` | RTDB legacy | Firestore `users/{uid}` | IdentityService | Backend/admin autorizado | Gobierno, compatibilidad legacy | Si, espejo parcial | Legacy | Migrar lecturas legacy. |
| `conductores_activos/{uid}` | RTDB | RTDB | DriverPresenceService | Backend ubicacion/elegibilidad | Logistica, Operaciones, mapa, despacho | Es fuente viva | Operativa | Mantener como nombre objetivo para presencia. |
| `repartidores_activos/{uid}` | RTDB legacy | Ninguna | DriverPresenceService legacy | Backend legacy | Logistica legacy | Si | Advertencia | Unificar hacia `conductores_activos` post-piloto. |
| `gps_history` | No activo/candidato | RTDB o historico agregado | TrackingService | Backend tracking | Logistica, Developer | Si | Candidata | Activar solo si el piloto lo justifica. |
| `presence` / `heartbeat` | RTDB | RTDB | DriverPresenceService | Backend/app autorizada | Logistica, Operaciones, Developer | Es fuente viva | Operativa futura | Formalizar si se usa para disponibilidad. |
| `finanzas` | RTDB agregado operativo | Firestore `finance/*` | FinanceService | Backend/agentes autorizados | Finanzas, Operaciones, Analytics | Dashboard solamente | Sin duplicidad critica | Mantener sin escritor paralelo. |
| `historial_ventas` | RTDB derivado | Firestore `finance/sales_history` | FinanceService / CompletionService | Backend | Finanzas, Analytics, Comercio | Si | Proyeccion historica | Consolidar en ledger post-piloto. |
| `liquidaciones/{id}` | RTDB | Firestore `finance/settlements/{id}` | FinanceService | Backend financiero | Finanzas, Gobierno | Proyeccion/dashboard futura | Canonica financiera piloto | Migrar solo con conciliacion certificada. |
| `liquidaciones_auditoria/{id}` | RTDB | Firestore `audit/finance/*` | FinanceService / AuditService | Backend financiero | Finanzas, Gobierno, Developer | Si | Auditoria | Mantener trazabilidad. |
| `pagos_confirmados/{id}` | RTDB | Firestore `finance/payments/{id}` | FinanceService | Backend | Finanzas, Gobierno | Proyeccion futura | Operativa piloto | Mantener por backend. |
| `market_v1/restaurantes/{id}` | RTDB | Firestore `restaurants/{id}` | AdminCommerceService | Backend admin | Gobierno, Comercio, Operaciones | Snapshot disponibilidad si aplica | Canonica piloto | Migrar despues del piloto. |
| Firestore `restaurants` | No oficial en piloto | Firestore | AdminCommerceService | Backend post-migracion | Gobierno, Comercio | Cache RTDB si aplica | Objetivo documentado | No activar en paralelo durante piloto. |
| `clientes` | Firestore objetivo / derivado CRM | Firestore `customers/{id}` | CRMService | Backend CRM | CRM, Comercio, Analytics | Resumen CRM si aplica | Objetivo | Mantener lectura/proyecciones controladas. |
| `users` | Firestore legacy | Firestore | IdentityService | Backend usuarios | Gobierno, Developer | Presence RTDB si aplica | Legacy/objetivo parcial | Definir identidad oficial post-piloto. |
| `configuracion/sistema` | RTDB | Firestore `configuration/*` | ConfigService / Gobierno | Backend admin autorizado | Gobierno, Developer, agentes | Cache RTDB permitida | Configuracion piloto | Migrar configuracion persistente post-piloto. |
| `metricas` | Firestore objetivo / derivados | Firestore `metrics/*` | AnalyticsService | Backend/agentes | Analytics, Ejecutivo | Snapshots RTDB permitidos | Objetivo | Solo lectura para paneles. |
| `bitacora_forense` | Firestore objetivo | Firestore | AuditService | Backend/agentes | Developer, Gobierno | Alertas vivas si aplica | Auditoria | Mantener inmutable cuando sea posible. |
| `notificaciones` | RTDB | RTDB proyeccion | SupportAgentService | Backend/agentes | Operaciones, Gobierno, Soporte | Si | Proyeccion | No usar como fuente canonica. |
| `eventos_operativos` | RTDB | Firestore audit + RTDB alertas | OperationalEventsService | Backend/agentes | Developer, Gobierno, Operaciones | Si | Auditoria operativa | Mantener como evidencia operacional. |
| `zonas_calor` | RTDB | Firestore config/analytics + RTDB snapshot | AnalyticsService / LogisticsService | Backend/admin/analytics | Operaciones, Logistica, Analytics | Si | Config/proyeccion | Mantener derivada. |
| `chats/{pedidoId}` | Candidata | Firestore/RTDB segun ADR futuro | ChatService futuro | Ninguno en piloto | Soporte, Cliente, Operaciones | Pendiente | Candidata | No activar sin backend propietario. |
| `cola_operativa` | RTDB futura | RTDB | OperationsService | Backend | Operaciones, Logistica | Es fuente viva | Candidata | Activar solo si reemplaza indices actuales. |
| `snapshots_operativos` | RTDB futura | RTDB | OperationsService / AnalyticsService | Backend/agentes | Operaciones, Analytics | Es snapshot | Candidata | Usar solo como lectura rapida. |

## Entidades criticas

Estas entidades requieren validacion extra antes de cualquier cambio:

- pedidos y estados;
- finanzas, deuda, comisiones, pagos y liquidaciones;
- repartidores, elegibilidad, bloqueo y presencia;
- restaurantes activos;
- configuracion del sistema.

## Reglas de escritura

| Tipo de dato | Escritor permitido | Escritura prohibida |
| --- | --- | --- |
| Pedidos | Backend de pedidos/delivery | Paneles directos a Firebase. |
| Finanzas | Backend financiero | Paneles directos a Firebase. |
| Deuda y bloqueo | Backend financiero/admin autorizado | Android o web directo. |
| Presencia/GPS | Backend o canal autorizado de telemetria | Panel administrativo manual. |
| Restaurantes | Backend admin/comercio | Frontend directo. |
| Configuracion | Backend admin autorizado | Scripts publicos. |

## Relacion con documentos

- `ARQUITECTURA_DATOS_NELLY_V1.md`: arquitectura rectora.
- `INVENTARIO_ENTIDADES_DATOS_V1.md`: auditoria inicial.
- `ROADMAP_ELIMINACION_DUPLICIDADES_DATOS_V1.md`: salida de advertencias actuales.
- `MANIFIESTO_DEL_DATO_NELLY_V1.md`: principio SSOT.
- `ADR-011-ESTRATEGIA-SSOT-FIRESTORE-RTDB.md`: decision Firestore + RTDB.

## Criterio de aceptacion

Una nueva entidad se acepta solo si:

- aparece en este catalogo o en un ADR aprobado;
- tiene fuente oficial unica;
- tiene propietario tecnico;
- no crea escritura directa desde paneles;
- no duplica informacion critica sin declararse como proyeccion temporal;
- pasa `npm run validate:data-architecture`.
