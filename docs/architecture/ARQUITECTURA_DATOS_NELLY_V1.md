# ARQUITECTURA DE DATOS NELLY V1

## Estado
Documento rector de datos para el piloto controlado de Nelly OS.

Fecha: 2026-07-26

## Proposito
Definir, para cada entidad relevante del ecosistema:

- fuente oficial;
- propietario tecnico;
- quien puede escribirla;
- quien puede leerla;
- si existe una proyeccion en Realtime Database;
- que Centro de Trabajo la consume.

Este documento convierte el inventario previo en una arquitectura operativa de datos. Su objetivo es evitar inconsistencias entre Firestore, Realtime Database, backend, paneles web y Android.

## Principio rector
La fuente de verdad operativa para el piloto es:

`Backend -> Firebase RTDB -> Android/Web`

Los paneles y clientes no deben mutar entidades criticas directamente en Firebase.

Regla obligatoria:

`Centro de Trabajo -> Backend API -> Fuente oficial`

Nunca:

`Centro de Trabajo -> Firebase directo`

## Clasificacion de datos

| Clasificacion | Descripcion | Regla |
| --- | --- | --- |
| Canonico | Registro que representa la verdad oficial del negocio. | Solo backend escribe. |
| Proyeccion | Vista derivada para lectura rapida, paneles o compatibilidad. | Solo backend/agentes actualizan. |
| Auditoria | Registro de eventos, evidencias o trazabilidad. | Solo backend/agentes escriben. |
| Configuracion | Parametros operativos o de gobierno. | Solo backend/admin autorizado escribe. |
| Legacy | Entidad existente por compatibilidad o migracion. | No debe crecer sin ADR. |
| Candidata | Entidad prevista para una fase posterior. | No activar sin backend propietario. |

## Matriz oficial de entidades

| Entidad | Fuente oficial | Propietario | Puede escribir | Puede leer | Proyeccion RTDB | Centros consumidores | Clasificacion |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `pedidos/{pedidoId}` | RTDB | Backend pedidos/delivery | Backend (`routes/admin.js`, `routes/delivery.js`, `src/controllers/ordersController.js`) | Operaciones, Cocina, Driver, Tracking, CRM, Analytics, Finanzas | Es la entidad canonica; genera indices derivados | Operaciones, Comercio, Logistica, CRM, Finanzas, Analytics | Canonico |
| `pedidos_para_reparto/{pedidoId}` | RTDB | Backend despacho | Backend (`routes/delivery.js`, `ordersManager`) | Driver, Operaciones, Logistica | Si, derivada de `pedidos` | Operaciones, Logistica | Proyeccion |
| `pedidos_en_camino/{pedidoId}` | RTDB | Backend entrega | Backend (`routes/delivery.js`) | Driver, Tracking, Operaciones, Logistica | Si, derivada de `pedidos` | Operaciones, Logistica, Cliente | Proyeccion |
| `pedidos_activos/{pedidoId}` | RTDB | Backend operativo | Backend operativo | Operaciones, Admin, Analytics | Si, derivada de `pedidos` | Operaciones, Gobierno, Analytics | Proyeccion |
| `pedidos_completados/{pedidoId}` | RTDB | Backend cierre | Backend de cierre | Finanzas, Analytics, Auditoria | Si, derivada de `pedidos` | Finanzas, Analytics, Gobierno | Proyeccion historica |
| `repartidores/{uid}` | RTDB | Backend repartidores/elegibilidad | Backend repartidores, delivery, deuda | Driver, Logistica, Finanzas, Gobierno | Es canonica del conductor operativo | Logistica, Finanzas, Gobierno | Canonico |
| `usuarios/repartidores/{uid}` | RTDB | Backend usuarios/admin | Backend/admin autorizado | Gobierno, compatibilidad legacy | Si, espejo parcial de conductor | Gobierno | Legacy/proyeccion |
| `conductores_activos/{uid}` | RTDB | Backend ubicacion/despacho | Backend de ubicacion y elegibilidad | Logistica, Operaciones, mapa, despacho | Si, derivada de `repartidores` y telemetria | Logistica, Operaciones | Proyeccion viva |
| `repartidores_activos/{uid}` | RTDB | Backend legacy repartidores | Backend legacy | Pantallas legacy, mapa antiguo | Si, indice legacy | Logistica legacy | Legacy/proyeccion |
| `finanzas` | RTDB | Backend financiero/agentes | Backend financiero y agentes autorizados | Finanzas, Operaciones, Analytics | Si, agregado derivado | Finanzas, Operaciones, Analytics | Proyeccion financiera |
| `historial_ventas` | RTDB | Backend cierre/finanzas | Backend de cierre/finanzas | Finanzas, Analytics, Comercio | Si, derivada de pedidos entregados | Finanzas, Analytics, Comercio | Proyeccion historica |
| `liquidaciones/{id}` | RTDB | Backend financiero | Backend financiero (`routes/panel.js`) | Finanzas, Gobierno auditor | Es canonica del flujo de liquidacion piloto | Finanzas, Gobierno | Canonico financiero |
| `liquidaciones_auditoria/{id}` | RTDB | Backend financiero | Backend financiero | Finanzas, Gobierno, soporte | Si, auditoria derivada de liquidaciones | Finanzas, Gobierno, Developer | Auditoria |
| `market_v1/restaurantes/{id}` | RTDB | Backend admin/restaurantes | Backend admin | Gobierno, Comercio, Operaciones | Es canonica del restaurante piloto | Gobierno, Comercio, Operaciones | Canonico |
| `notificaciones` | RTDB | Backend/agentes | Backend/agentes | Operaciones, Soporte, Gobierno | Si, derivada de eventos | Operaciones, Gobierno | Proyeccion |
| `eventos_operativos` | RTDB | Backend/agentes | Backend/agentes | Developer, Soporte, Gobierno | Si, bitacora operativa | Developer, Gobierno, Operaciones | Auditoria |
| `configuracion/sistema` | RTDB | Backend admin/agentes | Backend admin autorizado | Gobierno, Developer, agentes | Es configuracion oficial | Gobierno, Developer | Configuracion |
| `zonas_calor` | RTDB | Backend/admin/analytics | Backend admin/analytics | Operaciones, Logistica, Analytics | Si, derivada/configurable | Operaciones, Logistica, Analytics | Config/proyeccion |
| `chats/{pedidoId}` | RTDB | Futuro backend de chat | Ninguno en piloto sin backend dedicado | Pendiente | Candidata futura | Soporte, Cliente, Operaciones | Candidata |
| Firestore `users` | Firestore | Backend usuarios legacy | Backend usuarios | API legacy/admin tecnico | No oficial en RTDB | Gobierno legacy | Legacy |
| Firestore `pedidos` | Ninguna para piloto | Sin propietario activo | Nadie debe escribir en piloto | Nadie como fuente oficial | No aplica; RTDB `pedidos` reemplaza | Ninguno oficial | Deprecada |

## Lectura por Centro de Trabajo

| Centro de Trabajo | Entidades que puede consumir | Regla de escritura |
| --- | --- | --- |
| Gobierno del Ecosistema | `market_v1/restaurantes`, `repartidores`, `usuarios/repartidores`, `configuracion/sistema`, `liquidaciones_auditoria` | Escribe solo via backend admin. |
| Centro de Operaciones | `pedidos`, `pedidos_activos`, `pedidos_para_reparto`, `pedidos_en_camino`, `conductores_activos`, `notificaciones`, `zonas_calor` | Acciones de pedido solo via backend. |
| Centro Comercial | `market_v1/restaurantes`, `pedidos`, `historial_ventas`, proyecciones comerciales | Mutaciones de tienda/menu/pedido solo via backend. |
| Centro Logistico | `repartidores`, `conductores_activos`, `pedidos_para_reparto`, `pedidos_en_camino`, `zonas_calor` | Estados de conductor y entrega solo via backend. |
| CRM | `pedidos`, proyecciones CRM/comerciales, clientes derivados | Lectura prioritaria; escrituras futuras via backend CRM. |
| Finanzas | `liquidaciones`, `liquidaciones_auditoria`, `finanzas`, `historial_ventas`, `repartidores` | Pagos, reinicios y liquidaciones solo via backend financiero. |
| Analytics | `historial_ventas`, `finanzas`, `pedidos_completados`, `zonas_calor`, proyecciones | Solo lectura. |
| Developer | `eventos_operativos`, health, logs, configuracion tecnica | Diagnostico; cambios tecnicos solo via backend/admin autorizado. |
| Cliente/Tracking | `pedidos/{pedidoId}` via endpoint de seguimiento | Solo lectura via backend publico controlado. |
| App Driver | `pedidos_para_reparto`, `pedidos_en_camino`, `repartidores`, `conductores_activos` | Mutaciones solo via endpoints de delivery. |

## Escrituras prohibidas desde paneles

Ningun archivo en `public/` debe escribir directamente:

- pedidos;
- estados de pedido;
- deuda de repartidores;
- bloqueos manuales;
- elegibilidad;
- liquidaciones;
- finanzas;
- restaurantes;
- configuracion del sistema.

Si una pantalla necesita cambiar cualquiera de esos datos, debe existir un endpoint backend con:

1. autenticacion;
2. autorizacion;
3. validacion de payload;
4. trazabilidad;
5. manejo de errores;
6. respeto del contrato certificado.

## Proyecciones permitidas en RTDB

| Proyeccion | Fuente canonica | Motivo |
| --- | --- | --- |
| `pedidos_para_reparto` | `pedidos` | Lectura rapida para pool de reparto. |
| `pedidos_en_camino` | `pedidos` | Seguimiento de entregas activas. |
| `pedidos_activos` | `pedidos` | Tableros operativos. |
| `pedidos_completados` | `pedidos` | Historico y finanzas. |
| `conductores_activos` | `repartidores` + telemetria | Mapa y despacho. |
| `repartidores_activos` | `repartidores` + telemetria legacy | Compatibilidad temporal. |
| `finanzas` | pedidos entregados + liquidaciones + deuda | Lectura financiera operativa. |
| `historial_ventas` | pedidos entregados | Reportes y tendencias. |
| `notificaciones` | eventos y agentes | Alertas para operacion. |
| `eventos_operativos` | backend/agentes | Auditoria y diagnostico. |
| `zonas_calor` | pedidos + configuracion territorial | Operacion y analytics. |

## Duplicidades aceptadas temporalmente

| Duplicidad | Decision | Condicion de salida |
| --- | --- | --- |
| RTDB `pedidos` vs Firestore `pedidos` | RTDB es fuente oficial; Firestore `pedidos` queda deprecado. | Eliminar referencias restantes o aislarlas fuera de piloto. |
| `repartidores` vs `usuarios/repartidores` | `repartidores` es canonico operativo y financiero. | Migrar lecturas legacy que dependan del espejo. |
| `conductores_activos` vs `repartidores_activos` | Ambos son proyecciones vivas temporales. | Elegir una proyeccion unica de logistica post-piloto. |
| `finanzas` vs `historial_ventas` vs `liquidaciones` | Finanzas es agregado; liquidaciones y pedidos entregados sustentan conciliacion. | Definir ledger financiero completo post-piloto. |

## Relacion con documentos existentes

Este documento es la referencia oficial de arquitectura de datos.

Documentos relacionados:

- `INVENTARIO_ENTIDADES_DATOS_V1.md`: auditoria previa y evidencia de hallazgos.
- `ARQUITECTURA_NELLY_V1.md`: constitucion tecnica y de producto.
- `MANIFIESTO_NES_V1.md`: regla superior de arquitectura operativa.
- `U1_3_LEDGER_FINANCIERO_V1.md`: fuente oficial del bloque financiero extendido.

## Gate de cambio de datos

Antes de agregar o modificar una entidad, responder:

| Pregunta | Debe quedar claro |
| --- | --- |
| Que problema resuelve la entidad? | Si no hay caso de uso, no se crea. |
| Cual es su fuente oficial? | RTDB, Firestore u otro, pero solo una. |
| Quien puede escribirla? | Servicio backend especifico. |
| Quien puede leerla? | Centros de Trabajo o clientes autorizados. |
| Es canonica o proyeccion? | No mezclar ambas responsabilidades. |
| Duplica informacion existente? | Si duplica, justificar como proyeccion temporal. |
| Afecta finanzas, pedidos o repartidores? | Requiere validacion extra. |
| Rompe algun contrato certificado? | Si rompe, requiere certificacion nueva. |

## Decision
ARQUITECTURA DE DATOS NELLY V1 queda adoptada como documento rector para el piloto controlado.

A partir de esta version, ninguna funcionalidad nueva debe escribir datos criticos sin verificar primero esta matriz.
