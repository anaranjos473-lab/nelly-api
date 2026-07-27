# ARQUITECTURA DE DATOS NELLY V1

## Estado
Documento rector de datos para el piloto controlado de Nelly OS y arquitectura objetivo post-piloto.

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
La fuente de verdad operativa certificada para el piloto es:

`Backend -> Firebase RTDB -> Android/Web`

Los paneles y clientes no deben mutar entidades criticas directamente en Firebase.

Regla obligatoria:

`Centro de Trabajo -> Backend API -> Fuente oficial`

Nunca:

`Centro de Trabajo -> Firebase directo`

## Decision Firestore + RTDB
Se adopta una separacion formal entre base persistente de negocio y memoria operativa.

### Baseline piloto
Durante el piloto, el runtime certificado permanece en RTDB para pedidos, reparto y finanzas operativas.

No se migra una entidad critica a Firestore sin plan, adaptador backend, pruebas y certificacion.

### Arquitectura objetivo post-piloto
Firestore sera la fuente oficial persistente de negocio.

RTDB sera memoria operativa y capa de proyecciones vivas.

| Capa | Responsabilidad |
| --- | --- |
| Firestore | Verdad oficial de negocio, historico, auditoria, finanzas persistentes, configuracion durable. |
| RTDB | Estado en vivo, GPS, presence, heartbeat, cola operativa, snapshots y vistas temporales. |

Referencia:
- `ADR-011-ESTRATEGIA-SSOT-FIRESTORE-RTDB.md`
- `MANIFIESTO_DEL_DATO_NELLY_V1.md`
- `CATALOGO_OFICIAL_ENTIDADES_NELLY_V1.md`
- `ROADMAP_ELIMINACION_DUPLICIDADES_DATOS_V1.md`

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

Esta matriz describe el baseline actual del piloto. La columna de fuente oficial no debe cambiarse en runtime sin una migracion certificada.

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

## Arquitectura objetivo por dominio

Esta matriz define la direccion post-piloto. No sustituye el baseline actual hasta que exista migracion certificada.

| Dominio | Fuente oficial objetivo | Proyeccion RTDB permitida | Propietario | Centros consumidores |
| --- | --- | --- | --- | --- |
| Pedidos | Firestore `orders/{id}` | `operational_view/orders/{id}`, `pedidos_para_reparto`, `pedidos_en_camino` durante transicion | Servicio de Pedidos | Operaciones, Comercio, Logistica, CRM, Finanzas, Analytics |
| Restaurantes | Firestore `restaurants/{id}` o `market/restaurants/{id}` | Snapshot de disponibilidad si se requiere | Servicio de Comercio/Admin | Gobierno, Comercio, Operaciones |
| Clientes | Firestore `customers/{id}` | Resumen CRM si se requiere | Servicio CRM | CRM, Comercio, Analytics |
| Usuarios y roles | Firestore `users/{id}` | Presence/online en RTDB si aplica | Servicio de Identidad | Gobierno, Developer |
| Finanzas | Firestore `finance/*` | `dashboard_finanzas`, `ventas_hoy`, `saldo_actual` | Servicio Financiero | Finanzas, Gobierno, Analytics |
| Metricas persistentes | Firestore `metrics/*` | Snapshots operativos de lectura rapida | Servicio Analytics | Analytics, Ejecutivo futuro |
| Configuracion | Firestore `configuration/*` | Cache RTDB para agentes si se justifica | Servicio Gobierno/Config | Gobierno, Developer |
| Bitacora y auditoria | Firestore `audit/*`, `forensics/*` | Alertas vivas en RTDB | Servicio Auditoria/Developer | Gobierno, Developer, Soporte |
| Estado online/GPS | RTDB `conductores_activos`, `presence`, `heartbeat` | No aplica; RTDB es fuente viva | Servicio Logistico | Logistica, Operaciones |
| Cola operativa | RTDB `cola_operativa`, snapshots | No aplica; RTDB es fuente viva | Servicio Operaciones | Operaciones, Logistica |

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

## Duplicidades no permitidas en arquitectura objetivo

| Dato | Regla |
| --- | --- |
| Estado oficial de pedido | Solo Firestore `orders/{id}` cuando la migracion este certificada. |
| Dinero, deuda, comisiones y liquidaciones | Solo Firestore `finance/*` como verdad persistente post-piloto. |
| GPS y presencia | Solo RTDB como verdad viva. |
| Configuracion persistente | Firestore; RTDB solo cache operativa si hay justificacion. |
| Metricas historicas | Firestore; RTDB solo snapshot de visualizacion. |

## Relacion con documentos existentes

Este documento es la referencia oficial de arquitectura de datos.

Documentos relacionados:

- `CATALOGO_OFICIAL_ENTIDADES_NELLY_V1.md`: tabla unica de referencia por entidad, fuente, propietario, lectura, escritura y Centro de Trabajo.
- `ROADMAP_ELIMINACION_DUPLICIDADES_DATOS_V1.md`: objetivos de salida para advertencias conocidas.
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
| Pertenece a Firestore o RTDB? | Firestore para negocio persistente; RTDB para estado vivo/proyeccion. |
| Puede existir como proyeccion? | Si, pero debe declarar su fuente canonica. |

## Implementacion operativa inicial

La arquitectura queda instrumentada con un endpoint backend de diagnostico:

`GET /api/data-architecture/status`

Uso:

- en desarrollo puede consultarse para auditoria local;
- en produccion requiere token autorizado;
- no escribe datos;
- revisa nodos RTDB y colecciones Firestore;
- detecta coexistencias de riesgo;
- mantiene visible que el modo runtime del piloto es `pilot_rtdb_baseline`;
- confirma que la arquitectura objetivo es Firestore para negocio persistente y RTDB para memoria viva.

Este endpoint no migra datos. Sirve como control operativo para decidir futuras migraciones con evidencia.

La arquitectura tambien queda protegida por una auditoria automatica local/CI:

`npm run validate:data-architecture`

Esta auditoria:

- verifica que las reglas de coexistencia obligatorias sigan declaradas;
- falla si la regla financiera deja de ser de severidad alta;
- detecta escrituras criticas directas desde `public/`;
- detecta rutas financieras RTDB fuera de catalogo;
- confirma que las entidades del servicio de diagnostico tengan propietario, rol y Centros declarados.

El workflow `Security Gate` ejecuta esta auditoria antes de la auditoria de dependencias.

Evidencia:
- `VALIDACION_ARQUITECTURA_DATOS_ENDPOINT_V1.md`

## Decision
ARQUITECTURA DE DATOS NELLY V1 queda adoptada como documento rector para el piloto controlado.

A partir de esta version, ninguna funcionalidad nueva debe escribir datos criticos sin verificar primero esta matriz.
