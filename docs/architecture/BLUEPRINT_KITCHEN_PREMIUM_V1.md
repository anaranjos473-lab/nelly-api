# BLUEPRINT - NELLY KITCHEN PREMIUM V1

## Proposito
Definir como se construira Nelly Kitchen Premium dentro del repositorio, sin alterar de golpe el flujo certificado del panel actual.

## Alcance
Este blueprint cubre:
- arquitectura de modulos,
- modelo de estado,
- contratos entre backend, Firebase y panel,
- componentes visuales,
- estrategia de migracion incremental.

## Principios
1. Migracion incremental
   - No reemplazar el panel certificado de una sola vez.
   - Avanzar por capas verificables.

2. Estado unico
   - La interfaz debe leer de un solo origen de estado.
   - La UI no debe consultar Firebase por su cuenta cuando el estado ya fue consolidado.

3. Contratos explicitos
   - Cada integracion debe documentar entrada, salida, errores y estados.

4. Modulos con responsabilidad unica
   - Cada modulo debe tener una funcion clara y dependencias limitadas.

5. Seguridad y trazabilidad
   - No exponer secretos.
   - No perder evidencia operativa.

## Arquitectura de Modulos

### auth/
Responsabilidad:
- Autenticacion del panel.
- Validacion de permisos.
- Obtencion de token para backend.

Dependencias permitidas:
- `firebase/`
- `api/`
- `state/`

Dependencias prohibidas:
- `render/`
- `timeline/`
- `orders/`

Interfaces publicas:
- `getSession()`
- `requirePanelAccess()`
- `getBackendToken()`

### sync/
Responsabilidad:
- Sincronizacion con RTDB.
- Suscripciones.
- Resiliencia de reconexion.
- Consolidacion de snapshots.

Dependencias permitidas:
- `firebase/`
- `state/`
- `orders/`
- `metrics/`

Dependencias prohibidas:
- `ui/` directa
- `alerts/` directo sin pasar por estado

Interfaces publicas:
- `startSync()`
- `stopSync()`
- `resyncNow()`

### state/
Responsabilidad:
- Estado global de la aplicacion.
- Reducir duplicacion de consultas y mapas dispersos.

Dependencias permitidas:
- Ninguna dependencia de UI.
- Puede ser usado por cualquier modulo de dominio.

Dependencias prohibidas:
- Llamadas directas al DOM.
- Mutacion desde vistas.

Interfaces publicas:
- `getKitchenState()`
- `setKitchenState(partial)`
- `subscribeKitchenState(listener)`
- `resetKitchenState()`

### render/
Responsabilidad:
- Renderizado de vistas.
- Actualizacion visual a partir del estado.

Dependencias permitidas:
- `state/`
- `ui/`
- `orders/`

Dependencias prohibidas:
- Consultas directas a Firebase.
- Logica de negocio.

Interfaces publicas:
- `renderDashboard()`
- `renderKanban()`
- `renderOrderDetail()`
- `renderAlerts()`

### orders/
Responsabilidad:
- Logica de pedidos.
- Normalizacion de estados.
- Agrupacion por fase.
- Acciones operativas.

Dependencias permitidas:
- `state/`
- `api/`
- `timeline/`

Dependencias prohibidas:
- Render directo.
- Acceso a DOM.

Interfaces publicas:
- `normalizeOrderState()`
- `classifyOrderPhase()`
- `buildOrderViewModel()`
- `dispatchOrderAction()`
- `completeOrderAction()`

### alerts/
Responsabilidad:
- Centro de alertas.
- Clasificacion de severidad.
- Cola de notificaciones operativas.

Dependencias permitidas:
- `state/`
- `ui/`

Dependencias prohibidas:
- Firebase directo.
- Logica de render completa.

Interfaces publicas:
- `pushAlert()`
- `clearAlert()`
- `getActiveAlerts()`

### metrics/
Responsabilidad:
- KPI del dashboard.
- Latencia.
- Conteos operativos.
- Tendencias basicas.

Dependencias permitidas:
- `state/`
- `sync/`

Dependencias prohibidas:
- DOM directo.
- Mutacion de pedidos.

Interfaces publicas:
- `recalculateMetrics()`
- `getMetricsSnapshot()`

### timeline/
Responsabilidad:
- Historial por pedido.
- Linea de tiempo de eventos.

Dependencias permitidas:
- `state/`
- `orders/`

Dependencias prohibidas:
- Consultas UI.

Interfaces publicas:
- `buildTimeline()`
- `appendTimelineEvent()`

### audit/
Responsabilidad:
- Registro de acciones operativas.
- Evidencia para soporte y certificacion.

Dependencias permitidas:
- `state/`
- `api/`

Dependencias prohibidas:
- Exponer secretos.
- Depender del DOM.

Interfaces publicas:
- `recordAuditEvent()`
- `flushAuditBuffer()`

### ui/
Responsabilidad:
- Componentes reutilizables.
- Elementos visuales atomicos.

Dependencias permitidas:
- `state/`
- `render/`

Dependencias prohibidas:
- Firebase directo.
- Lógica de backend.

Interfaces publicas:
- `OrderCard`
- `DashboardCard`
- `MetricKPI`
- `TimelineItem`
- `SystemStatusBadge`
- `Toast`
- `AlertPanel`
- `ConfirmDialog`

### api/
Responsabilidad:
- Cliente HTTP hacia backend.
- Encapsular endpoints y headers.

Dependencias permitidas:
- `auth/`
- `state/`

Dependencias prohibidas:
- UI directo.

Interfaces publicas:
- `getPanelToken()`
- `dispatchOrder()`
- `completeOrder()`
- `fetchKitchenBootstrap()`

### firebase/
Responsabilidad:
- Inicializacion de Firebase.
- Acceso a RTDB.
- Separacion entre configuracion y uso.

Dependencias permitidas:
- Ninguna dependencia de UI.

Dependencias prohibidas:
- Logica de pedidos.

Interfaces publicas:
- `initFirebaseApp()`
- `getRtdb()`
- `getAuth()`

## Modelo de Estado

El panel debe consolidarse en un estado unico.

```text
KitchenState
├── session
├── systemHealth
├── metrics
├── orders
├── drivers
├── alerts
├── timeline
├── audit
└── ui
```

### session
- usuario autenticado.
- metodo de autenticacion.
- permisos.
- expiracion.

### systemHealth
- backend.
- firebase.
- rtdb.
- latencia.
- ultima sincronizacion.

### metrics
- pedidos activos.
- pedidos urgentes.
- tiempo promedio.
- ventas del dia.
- ticket promedio.

### orders
- pedidos por fase.
- pedidos por prioridad.
- pedidos con conflicto.
- pedidos con espera excesiva.

### drivers
- conectados.
- ocupados.
- disponibles.
- desconectados.

### alerts
- criticas.
- importantes.
- informativas.

### timeline
- eventos por pedido.

### audit
- acciones recientes.

### ui
- panel abierto.
- tarjeta seleccionada.
- modales activos.
- filtros.
- preferencias visuales.

## Contratos

### Backend -> Panel
#### Entrada
- JWT o token de panel.
- payload de pedidos.
- estado operativo.

#### Salida
- JSON estable.
- error explicito.
- codigos HTTP coherentes.

#### Errores
- 401: autenticacion invalida.
- 403: permisos insuficientes.
- 409: conflicto de operacion.
- 5xx: error del backend.

### Firebase -> Panel
#### Entrada
- snapshot de RTDB.
- cambios incrementales.

#### Salida
- estado consolidado.
- alertas de sincronizacion.

#### Errores
- permission denied.
- offline.
- stale snapshot.

### Panel -> Backend
#### Operaciones
- obtener token del panel.
- despachar pedido.
- completar pedido.
- registrar eventos de auditoria.

#### Reglas
- toda accion critica debe pasar por backend.
- la UI no decide estados finales.

## Componentes Visuales

### Componentes atomicos
- `SystemStatusBadge`
- `MetricKPI`
- `Toast`
- `ConfirmDialog`

### Componentes de dominio
- `OrderCard`
- `OrderDetailPanel`
- `TimelinePanel`
- `AlertPanel`
- `KitchenMonitor`
- `KitchenKanban`

### Composicion de pantalla
1. Header operativo.
2. Dashboard superior.
3. Kanban principal.
4. Panel lateral de salud y alertas.
5. Vista detalle bajo demanda.

## Estrategia de Migracion

### Etapa B0
Inventario y mapa de dependencias.
- Identificar variables, funciones, listeners y escrituras.
- Definir modulo destino antes de mover codigo.
- No tocar comportamiento.

### Etapa A
Crear la nueva estructura de carpetas.
- Sin cambiar comportamiento.
- Sin mover logica todavia.

### Etapa B
Extraer logica existente a modulos.
- Mantener la misma interfaz.
- Validar cada extraccion con compile y pruebas.

### Etapa C
Sustituir la UI por la version Premium.
- Reutilizar el estado consolidado.
- Mantener contratos ya certificados.

### Regla de migracion
Cada paso debe preservar:
- cierre de pedido,
- sincronizacion,
- autenticacion,
- auditoria,
- certificacion previa.

## Fuera de Alcance para P1
- Drag and drop real.
- IA de prediccion.
- Balanceo automatico.
- Analitica avanzada.
- Mapa como vista principal.
- Automatizaciones complejas.

## Entregables Esperados
- `PRD_NELLY_KITCHEN_PREMIUM_V1.md`
- `BLUEPRINT_KITCHEN_PREMIUM_V1.md`
- `B0_MATRIZ_DEPENDENCIAS_KITCHEN_PREMIUM_V1.md`
- Estructura modular inicial en `public/js/` y `public/css/`
- `KitchenState` unico
- Capa de render separada
- Contratos documentados

## Criterio de Aceptacion
El blueprint sera correcto si permite ejecutar una migracion incremental del panel certificado hacia Kitchen Premium sin duplicar fuentes de verdad, sin romper el flujo operativo y sin mezclar logica de negocio con presentacion.
