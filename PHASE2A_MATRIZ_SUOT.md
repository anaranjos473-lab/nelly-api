# PHASE 2A - Matriz de Fuente Unica de Verdad (SUOT)

Fecha: 2026-06-17  
Alcance: Nelly Delivery operativo, panel, driver app, RTDB y Firestore.  
Objetivo: definir quien escribe, quien lee y donde vive la verdad antes de tocar codigo.

## Criterio de decision

- RTDB es la fuente operativa para datos vivos: pedidos activos, disponibilidad, GPS, estado de reparto y capital requerido en tiempo real.
- Firestore debe quedar para historico, auditoria durable, usuarios/backoffice de baja frecuencia y reportes.
- Ningun cliente debe hacer doble escritura RTDB + Firestore para la misma entidad critica.
- Si una entidad aparece en dos nodos, la matriz declara un nodo primario y marca el otro como proyeccion, espejo, historico o deuda.

## Matriz ejecutiva compacta

| Entidad | Escritor oficial | Lectores | Nodo canonico |
|---|---|---|---|
| Pedido | Backend | Admin, cocina, driver, soporte | `pedidos/{pedidoId}` |
| Pedido en reparto | Backend | Admin, cocina, driver | `pedidos_para_reparto/{pedidoId}` |
| Pedido en camino | Backend | Admin, driver, tracking | `pedidos_en_camino/{pedidoId}` |
| Tracking GPS | Driver API | Admin, despacho, antifraude | `conductores_activos/{uid}` |
| Capital conductor | Backend | Smart dispatch, driver, admin | `repartidores/{uid}/finanzas` y `repartidores/{uid}/billetera` |
| Liquidacion | Backend | Admin, finanzas, nomina | `liquidaciones/{liquidacionId}` |
| Evento auditoria | Backend | Admin, soporte, conciliacion | `order_events/{pedidoId}/{version}` |
| Configuracion runtime | Backend/admin autorizado | Backend, antifraude | `configuracion/sistema/*` |

## Criterio de certificacion PHASE 2A

| Estado | Significado |
|---|---|
| CERTIFICADA | Solo Backend escribe el nodo o la entidad de negocio |
| CONDICIONADA | Cliente escribe datos efimeros autorizados: GPS, presencia, conectividad |
| DEUDA TECNICA | Cliente escribe estado de negocio o salta el contrato Backend |
| ELIMINAR | Escritura/nodo legacy que ya no deberia existir |

### Estado por nodo critico

| Nodo | Estado objetivo | Estado actual PHASE 2A | Evidencia / cierre requerido |
|---|---|---|---|
| `pedidos` | CERTIFICADA | DEUDA TECNICA parcial | Backend escribe oficialmente, pero `public/panel.html` aun escribe `pedidos/{id}/estado`; cerrar bypass para certificar |
| `pedidos_para_reparto` | DEUDA TECNICA hasta retirar cliente directo | DEUDA TECNICA | `public/panel.html` escribe directo; debe pasar por `POST /api/admin/pedidos/:pedidoId/listo` |
| `pedidos_en_camino` | DEUDA TECNICA hasta retirar cliente directo | DEUDA TECNICA | `public/panel.html` crea nodo directo; solo delivery backend debe hacerlo |
| `conductores_activos` | CONDICIONADA | CONDICIONADA | Cliente/Driver API puede escribir GPS efimero, pero falta validar TTL y cleanup |
| `liquidaciones` | CERTIFICADA | CERTIFICADA con vigilancia | Escritura backend en `run_server.js`; confirmar entrada activa/contrato final |
| `order_events` | CERTIFICADA | CERTIFICADA parcial | Backend escribe; falta cerrar decision de bridge durable a Firestore |

### Gate A - Escrituras

Condicion de cierre: para cada nodo critico debe existir un solo escritor autorizado. No basta con que exista un endpoint correcto; no debe existir ruta alternativa para modificar el mismo dato.

| Nodo | Escritor unico requerido | Segundo escritor detectado | Resultado |
|---|---|---|---|
| `pedidos` | Backend | `public/panel.html` escribe `pedidos/{id}/estado` | No pasa |
| `pedidos_para_reparto` | Backend | `public/panel.html` escribe `pedidos_para_reparto/{id}` | No pasa |
| `pedidos_en_camino` | Backend | `public/panel.html` escribe `pedidos_en_camino/{id}` | No pasa |
| `liquidaciones` | Backend | No detectado en cliente web | Pasa con vigilancia |
| `order_events` | Backend | No detectado en cliente web | Pasa parcial; falta bridge durable |

### Gate B - Lecturas

Condicion de cierre: cada vista operativa debe declarar su listener principal. Si una misma vista se alimenta simultaneamente de varios nodos equivalentes, el problema ya no es escritura sino convergencia visual.

| Vista / flujo | Listener principal esperado | Listeners detectados | Resultado |
|---|---|---|---|
| Pendientes/cocina | `pedidos` | `public/panel.html`: `pedidos` por `onValue`, `onChildAdded`, `onChildChanged` | Pasa con riesgo de duplicidad visual |
| Listos para reparto | `pedidos_para_reparto` | `public/panel.html`, `public/repartidor.html` | Pasa como lectura |
| En camino | `pedidos_en_camino` | `public/panel.html` | Pasa como lectura |
| Vista operacional combinada | Un agregador UI con roles claros | `public/panel.html` escucha `pedidos`, `pedidos_para_reparto`, `pedidos_en_camino` | Condicionado: evitar mezclar estados equivalentes |

### Gate operativo del panel

Busqueda focal ejecutada:

```text
rg -n -C 5 "moverAReparto|finalizarPedido|set\(ref\(|update\(ref\(|push\(ref\(" public\panel.html panel_source.txt public\js\admin-dashboard.js
rg -n "moverAReparto|finalizarPedido|set\(ref\(|update\(ref\(|push\(ref\(" public\panel.html
```

Resultado actual en `public/panel.html`:

| Accion | Escrituras RTDB directas | Estado |
|---|---:|---|
| `window.moverAReparto` | 3 | Bloquea certificacion |
| `window.finalizarPedido` | 0 detectadas con `set/update/push(ref(` | No bloquea por escritura directa detectada |

Escrituras pendientes de eliminar o redirigir a Backend:

| Linea | Escritura | Sustitucion requerida |
|---|---|---|
| `public/panel.html:1712` | `set(ref(rtdb, pedidos_para_reparto/{id}))` | `POST /api/admin/pedidos/:pedidoId/listo` |
| `public/panel.html:1714` | `set(ref(rtdb, pedidos_en_camino/{id}))` | Backend delivery, no panel |
| `public/panel.html:1716` | `set(ref(rtdb, pedidos/{id}/estado), 'listo')` | Backend state machine |

Cuando este conteo llegue a 0 escrituras RTDB operativas dentro del panel, `pedidos`, `pedidos_para_reparto` y `pedidos_en_camino` pueden pasar de DEUDA TECNICA parcial a CERTIFICADA.

## Matriz principal

| Entidad | Escritor oficial | Lectores | Nodo(s) RTDB | Nodo(s) Firestore | Fuente unica definida | Estado PHASE 2A |
|---|---|---|---|---|---|---|
| Pedido operativo | Backend API: `POST /api/admin/pedidos`; integraciones con API key si existen | Admin panel, cocina, diagnostico, soporte, delivery backend | `pedidos/{pedidoId}` | Historico esperado: `historico_pedidos/{pedidoId}`; residuales antiguos: `pedidos`, `orders` segun scripts legacy | RTDB `pedidos/{pedidoId}` mientras el pedido esta activo | OK con deuda de archivado/historico |
| Pedido listo para reparto | Backend API: `POST /api/admin/pedidos/:pedidoId/listo` | Driver app/listener, panel operativo, delivery backend | `pedidos_para_reparto/{pedidoId}` y actualizacion espejo en `pedidos/{pedidoId}` | Evento durable esperado en `order_events` o equivalente | RTDB `pedidos_para_reparto/{pedidoId}` para asignacion | Critico: debe ser transaccional e idempotente |
| Pedido en camino | Backend delivery: `POST /api/delivery/accept-order` | Panel, driver app, tracking/ETA, soporte | `pedidos_en_camino/{pedidoId}`; espejo de estado en `pedidos/{pedidoId}` y `pedidos_para_reparto/{pedidoId}` | Historico/auditoria al cerrar ciclo | RTDB `pedidos_en_camino/{pedidoId}` para reparto vivo | OK operativo; duplicacion controlada por backend |
| Estado de pedido | Backend admin/delivery mediante maquina de estados | Todos los paneles y servicios de flujo | `pedidos/{pedidoId}/estado`, `pedidos_para_reparto/{pedidoId}/estado`, `pedidos_en_camino/{pedidoId}/estado` | Evento/historico durable | Estado maestro de transicion: `pedidos_para_reparto/{pedidoId}` durante LISTO -> EN_CAMINO -> ENTREGADO; `pedidos/{pedidoId}` como vista general | Critico: requiere version en todos los nodos |
| Version de pedido | Backend en cada transicion de estado | Backend, pruebas de concurrencia, auditoria | `pedidos*/{pedidoId}/version`, `updated_at` | `order_events/{eventId}.version_pedido` si se persiste | Version del nodo principal transaccionado | Critico: base de concurrencia |
| Evento de pedido/auditoria | Backend admin/delivery despues de una transicion exitosa | Admin, auditoria, soporte, conciliacion | `order_events/{pedidoId}/{version}`; pruebas tambien contemplan `order_events_pending/{eventId}` | `order_events/{eventId}` como ledger durable | Firestore para ledger durable; RTDB como evento operativo o cola pendiente | Parcial: definir bridge y retencion |
| GPS vivo del conductor | Driver app via `POST /api/delivery/update-location`; endpoint legacy `PATCH /api/repartidores/estado` | Panel mapa, smart dispatch, antifraude, soporte | `conductores_activos/{uid}`, `repartidores/{uid}/ubicacion`, `pedidos_en_camino/{pedidoId}/ubicacion_repartidor` | No aplica para vivo; posible historico de rutas futuro | RTDB `conductores_activos/{uid}` para vivo | OK, pero hay nodos espejo |
| Perfil operativo del repartidor | Backend/driver API | Admin, soporte, smart dispatch | `repartidores/{uid}`, `repartidores_activos/{uid}` en rutas legacy/panel | Posible `users/{uid}` para identidad | RTDB `repartidores/{uid}` para elegibilidad operativa | Deuda: `repartidores_activos` vs `repartidores` |
| Disponibilidad/turno del repartidor | Driver app/backend | Admin panel, asignador, soporte | `repartidores/{uid}/disponible`, `repartidores/{uid}/ultima_conexion`, legacy `repartidores_activos/{uid}` | No aplica | RTDB `repartidores/{uid}` | Deuda: consolidar lectores legacy |
| Capital de guerra/disponible | Backend delivery al reservar/liberar; panel finanzas al registrar deuda | Smart dispatch, driver app, admin finanzas | `repartidores/{uid}/billetera`, `repartidores/{uid}/finanzas`, `repartidores/{uid}/capital_reservado` | Ledger financiero futuro/historico | RTDB `repartidores/{uid}/billetera` + `finanzas` bajo transaccion | Critico: dinero, requiere atomicidad |
| Reserva de capital por pedido | Backend delivery `accept-order` y `complete-order` | Smart dispatch, panel, auditoria | `repartidores/{uid}/finanzas/reservas_capital/{pedidoId}`, `repartidores/{uid}/billetera/reservas_capital/{pedidoId}`, `pedidos*/{pedidoId}/capital_reserva` | Evento financiero durable futuro | RTDB `repartidores/{uid}/finanzas/reservas_capital/{pedidoId}` | Critico: espejo en billetera debe tratarse como compatibilidad |
| Deuda/bloqueo del conductor | Backend delivery y panel finanzas (`registrar-pago-deuda`, `registrar-cobro-efectivo`) | Smart dispatch, panel, soporte | `repartidores/{uid}/finanzas/deuda_actual`, `repartidores/{uid}/estatus/bloqueado_por_deuda`, `repartidores/{uid}/perfil/bloqueado_por_deuda`, `billetera/deuda_comision` | Ledger financiero durable recomendado | RTDB `repartidores/{uid}/finanzas` | Critico: unificar campos de bloqueo |
| Liquidacion | Backend/panel liquidaciones | Admin dashboard, finanzas, nomina | `liquidaciones/{liquidacionId}`, `liquidaciones_auditoria/{id_timestamp}` | Recomendado: Firestore ledger financiero, no confirmado como activo | RTDB `liquidaciones/{liquidacionId}` en implementacion actual | Alta: decidir si migra a Firestore ledger |
| Historial de ventas/metricas | Backend al cerrar pedido o procesos de reporte | Admin dashboard, rentabilidad | `historial_ventas`, `finanzas`, agregados de `pedidos` | Historico recomendado: Firestore | Firestore para historico; RTDB solo cache operativo | Deuda: origen de escritura no queda totalmente consolidado |
| Antifraude entrega | Cloud Function sobre cambios en `pedidos/{pedidoId}` | Admin, soporte, auditoria | Lee `pedidos/{pedidoId}` y `conductores_activos/{uid}`; escribe alerta en `pedidos/{pedidoId}` y estado en `conductores_activos/{uid}` | No aplica actualmente | RTDB durante auditoria inmediata; Firestore recomendado para evidencia durable | Media: side-effect autorizado pero debe registrarse |
| Configuracion sistema | Admin/backoffice autorizado | Backend antifraude, clientes/config | `configuracion/sistema/*` | Posible `config/{key}` si se adopta Firestore | RTDB `configuracion/sistema` para parametros runtime | Baja: documentar propietario |
| Usuarios/admin auth | Firebase Auth + backend usuarios | Backend, panel, seguridad | No aplica salvo perfiles operativos | `users/{userId}` en controlador de usuarios | Firebase Auth + Firestore `users` | Fuera de flujo critico de reparto |
| Notificaciones/FCM | Backend notificaciones/soporte | Driver app, panel soporte | Tokens en `repartidores_activos/{uid}/fcm_token` y/o `repartidores/{uid}/fcm_token` | No aplica | Pendiente: elegir `repartidores/{uid}/fcm_token` | Media: duplicacion legacy |

## Lectores por superficie

| Superficie | Lee principalmente | Uso |
|---|---|---|
| Admin dashboard | `pedidos`, `pedidos_para_reparto`, `pedidos_en_camino`, `conductores_activos`, `liquidaciones`, `liquidaciones_auditoria`, `historial_ventas`, `finanzas` | Operacion, metricas, finanzas |
| Cocina/panel operativo | `pedidos` y/o `pedidos_para_reparto` | Marcar pedido listo y visualizar flujo |
| Driver app | `pedidos_para_reparto`, `pedidos_en_camino`, `repartidores/{uid}` | Ver pedidos, aceptar, completar, elegibilidad |
| Smart dispatch | `repartidores/{uid}`, datos de pedido listo | Validar capital, equipo y distancia |
| Antifraude | `pedidos/{pedidoId}`, `conductores_activos/{uid}`, `configuracion/sistema` | Validar entrega contra ubicacion |
| Finanzas/nomina | `repartidores/{uid}/finanzas`, `liquidaciones`, `liquidaciones_auditoria`, `historial_ventas` | Deuda, pagos, liquidacion |
| Soporte | `pedidos`, `repartidores_activos`, `conductores_activos`, tokens FCM | Diagnostico y contacto |

## Decisiones SUOT para PHASE 2B

1. Pedido activo vive en RTDB. Firestore solo puede recibir historico/auditoria despues de una transicion confirmada.
2. `pedidos_para_reparto/{pedidoId}` es el candado de concurrencia para aceptar/completar. Toda transicion debe ser transaccional, versionada e idempotente.
3. `pedidos_en_camino/{pedidoId}` es vista operativa del reparto vivo. No debe ser el origen para decidir elegibilidad.
4. Capital se decide exclusivamente en `repartidores/{uid}` con transaccion. Cualquier copia en el pedido es evidencia contextual, no saldo oficial.
5. GPS vivo se decide en `conductores_activos/{uid}`. Copias en `repartidores/{uid}/ubicacion` y `pedidos_en_camino/*/ubicacion_repartidor` son vistas de conveniencia.
6. Eventos de pedido deben terminar en un ledger durable. Si se usa RTDB `order_events` u `order_events_pending`, debe existir una regla clara de sincronizacion a Firestore y reintentos.
7. `repartidores_activos` debe clasificarse como legacy/cache. Los lectores nuevos deben preferir `repartidores/{uid}` o `conductores_activos/{uid}` segun el dato.
8. Finanzas y liquidaciones necesitan una decision explicita: RTDB actual para operacion rapida, Firestore para ledger contable durable.

## Duplicados y riesgo

| Duplicado | Riesgo | Decision |
|---|---|---|
| `pedidos` vs `pedidos_para_reparto` vs `pedidos_en_camino` | Estados divergentes si una actualizacion parcial falla | Backend debe escribirlos en bloque despues de transaccion principal; version comun |
| `repartidores/{uid}/billetera` vs `repartidores/{uid}/finanzas` | Saldo disponible incorrecto | Unificar calculo oficial en servicio de deuda/capital; mantener espejo solo por compatibilidad |
| `conductores_activos/{uid}` vs `repartidores/{uid}/ubicacion` | Mapa o antifraude leen ubicacion distinta | `conductores_activos` es vivo; `repartidores/ubicacion` es ultima ubicacion de perfil |
| `repartidores_activos` vs `repartidores` | Panel/soporte pueden ver conductores distintos | Deprecar o convertir `repartidores_activos` en cache generada |
| RTDB `order_events` vs Firestore `order_events` | Auditoria incompleta si se cae el bridge | Definir cola, retry e idempotencia por `pedidoId:version` |
| `liquidaciones` vs posible ledger Firestore | Nomina sin trazabilidad contable | RTDB actual, pero Firestore recomendado como sistema contable |

## Inventario de escrituras RTDB

Busqueda ejecutada:

```text
rg -n "set\(ref\(rtdb|update\(ref\(rtdb|push\(ref\(rtdb" -S .
rg -n "db\.ref\(.*\)\.(set|update|push)|db\.ref\(\)\.update|\.transaction\(" routes src services functions app.js run_server.js -S
```

### Escrituras directas desde cliente web

| Archivo | Nodo | Operacion | Permitido | Decision |
|---|---|---|---|---|
| `public/panel.html` | `pedidos_para_reparto/{rtdbKey}` | `set(ref(rtdb, ...))` | No | Debe pasar por `POST /api/admin/pedidos/:pedidoId/listo` |
| `public/panel.html` | `pedidos_en_camino/{rtdbKey}` | `set(ref(rtdb, ...))` | No | El cliente no debe crear pedidos en camino |
| `public/panel.html` | `pedidos/{rtdbKey}/estado` | `set(ref(rtdb, ...))` | No | Estado solo por backend/maquina de estados |
| `public/js/admin-dashboard.js` | `${activeDriversBasePath}/{uid}` | `update(ref(rtdb, ...))` | No, salvo modo emergencia | Bloqueo/deuda debe pasar por `POST /api/panel/finanzas/registrar-pago-deuda` o endpoint admin dedicado |
| `panel_source.txt` | Copia de `public/panel.html` | `set(ref(rtdb, ...))` | No aplica | Archivo evidencia/copia, no runtime |

### Escrituras backend relevantes

| Archivo | Nodo | Operacion | Permitido | Observacion |
|---|---|---|---|---|
| `routes/admin.js` | `pedidos/{pedidoId}` | `set` | Si | Creador oficial de pedido desde panel |
| `routes/admin.js` | `pedidos/{pedidoId}`, `pedidos_para_reparto/{pedidoId}` | `update` multi-path | Si | Debe mantenerse idempotente/versionado |
| `routes/delivery.js` | `pedidos_para_reparto/{pedidoId}` | `transaction` | Si | Candado principal de concurrencia |
| `routes/delivery.js` | `pedidos/{pedidoId}`, `pedidos_en_camino/{pedidoId}`, `repartidores/{uid}/pedido_activo` | `update` multi-path | Si | Espejos despues de transicion exitosa |
| `routes/delivery.js` | `repartidores/{uid}` | `transaction` | Si | Reserva/liberacion de capital |
| `routes/delivery.js` | `conductores_activos/{uid}`, `repartidores/{uid}/ubicacion`, `pedidos_en_camino/{pedidoId}/ubicacion_repartidor` | `update` multi-path | Si | GPS vivo; siguiente auditoria prioritaria |
| `routes/delivery.js` | `order_events/{pedidoId}/{version}` | `set` | Si | Evento operativo; falta confirmar persistencia durable |
| `routes/panel.js` + `src/services/debtLockService.js` | `repartidores/{uid}` | `transaction` | Si | Pagos/deuda/cobro efectivo |
| `src/controllers/ordersController.js` | `pedidos` | `push/set/update/remove` | Revisar | Ruta `/api/ordenes`; puede saltarse contrato actual de pedidos |
| `src/agentes/agenteDespacho.js` | `pedidos/{pedidoId}` | `update` | Revisar | Agente legacy cambia estado a `en_curso`, fuera de maquina LISTO/EN_CAMINO |
| `src/agentes/agenteSoporte.js` | `pedidos/{pedidoId}` | `update` | Condicionado | Soporte puede intervenir, pero debe registrar evento |
| `src/agentes/agenteSoporte.js` | `conductores_activos/{uid}` | `update` | Condicionado | Pausa por soporte; debe tener TTL/evento |
| `src/agentes/agenteAntifraude.js` | `pedidos/{pedidoId}` | `update` | Condicionado | Alerta antifraude permitida; debe generar evidencia |
| `src/agentes/agenteTarifaDinamica.js` | `configuracion/sistema` | `update` | Si | Config runtime, baja frecuencia |
| `run_server.js` | `pedidos`, `pedidos_en_camino`, `liquidaciones`, `liquidaciones_auditoria` | `set/update` | Legacy/revisar | No debe definir contrato nuevo si `app.js` es entrada activa |

## Inventario inverso: listeners RTDB

Busqueda ejecutada:

```text
rg -n "onValue\(" -S .
rg -n "onChildAdded\(" -S .
rg -n "onChildChanged\(" -S .
rg -n "child_added" -S src routes functions app.js app_test.js run_server.js
rg -n "child_changed" -S src routes functions app.js app_test.js run_server.js
```

### Listeners cliente/web

| Nodo | Archivo | Tipo listener | Lectura esperada | Riesgo |
|---|---|---|---|---|
| `pedidos` | `public/panel.html` | `onValue` sobre query por `estado` | Si | Panel aun usa `pedidos` como fuente de pendientes |
| `pedidos` | `public/panel.html` | `onChildAdded` sobre query por `estado` | Si | Redundante con `onValue`; puede duplicar eventos si no se controla |
| `pedidos` | `public/panel.html` | `onChildChanged` | Si | Puede reactivar flujos legacy de estado |
| `pedidos_para_reparto` | `public/panel.html` | `onValue` | Si | Correcto para visualizacion, pero no para escritura directa |
| `pedidos_para_reparto` | `public/repartidor.html` | `onValue` | Si | Driver ve pedidos listos desde nodo canonico |
| `pedidos_en_camino` | `public/panel.html` | `onValue` | Si | Correcto como vista operativa |
| `liquidaciones_auditoria` | `public/panel.html` | `onValue` | Si | Auditoria/feedback financiero |
| `repartidores_activos` | `public/js/mapa-logistica.js` | `onValue` | Legacy/revisar | Mapa usa nodo legacy, no `conductores_activos` |
| `pedidos` | `Untitled-2.html` | `onValue` | ELIMINAR | Archivo suelto/demo; no debe ser contrato operativo |
| `chats/*` | `SNIPPETS_CHAT_NELLY.md` | `.on('value')`, `.on('child_added')` | No runtime | Snippet documental |

### Listeners backend/agentes

| Nodo | Archivo | Tipo listener | Permitido | Observacion |
|---|---|---|---|---|
| `pedidos` | `src/agentes/agenteDespacho.js` | `child_added`, `child_changed` | Revisar | Asigna y cambia estado a `en_curso`; puede competir con maquina actual |
| `pedidos` | `src/agentes/agenteSoporte.js` | `child_added`, `child_changed` sobre queries de percance | Condicionado | Intervencion soporte valida si emite evento/auditoria |
| `pedidos` | `src/agentes/agenteAntifraude.js` | `child_changed` | Condicionado | Audita entregas leyendo GPS; debe registrar evidencia durable |
| `pedidos` | `run_server.js` | `child_added` | Legacy/revisar | Listener de cocina/legacy; no debe duplicar `app.js` |
| `pedidos` | `app_test.js` | `child_added` | No runtime | Test/archivo alterno |

### Lectura inversa PHASE 2A

- La redundancia historica sigue visible: `public/panel.html` escucha `pedidos`, `pedidos_para_reparto` y `pedidos_en_camino` al mismo tiempo.
- Esa lectura multiple es aceptable solo si cada nodo tiene rol claro: pendientes, listos, en camino.
- El riesgo aparece cuando el mismo panel tambien escribe esos nodos; ahi se puede reproducir una inconsistencia tipo `PED_1781`.
- Para certificar PHASE 2A al 100%, el panel puede seguir escuchando, pero debe dejar de escribir estado de negocio directo en RTDB.

## Riesgo residual prioritario: GPS

Si PHASE 1 ya certifico el ciclo de pedidos, el siguiente candidato a inconsistencia no es pedidos sino GPS/tracking:

- `conductores_activos/{uid}` tiene alta frecuencia y multiples lectores.
- Tambien se copia ubicacion en `repartidores/{uid}/ubicacion`.
- Durante un pedido se copia a `pedidos_en_camino/{pedidoId}/ubicacion_repartidor`.
- Antifraude lee `conductores_activos/{uid}` para validar entrega.
- No se encontro una implementacion activa de `cleanupConductoresActivos()` en las rutas revisadas.
- El TTL queda como regla declarada, pero necesita job/cron/interval verificable.

Preguntas obligatorias para PHASE 2B:

1. Quien escribe `conductores_activos`?
2. Con que frecuencia se escribe?
3. Quien borra registros obsoletos?
4. Que ocurre si `cleanupConductoresActivos()` falla 30 minutos?
5. Que ocurre si el conductor cierra la app sin logout?
6. Que fuente usa el mapa del Admin?

Orden recomendado:

1. PHASE 2A: Fuente Unica de Verdad e inventario de escrituras.
2. PHASE 2B: Auditoria GPS, `conductores_activos`, tracking, TTL y `cleanupConductoresActivos()`.
3. PHASE 2C: Finanzas, capital, liquidaciones y ledger economico.
4. PHASE 3: Escalabilidad, observabilidad y alertas.

## Nodos oficiales propuestos

```text
RTDB
  pedidos/{pedidoId}
  pedidos_para_reparto/{pedidoId}
  pedidos_en_camino/{pedidoId}
  order_events/{pedidoId}/{version}
  order_events_pending/{eventId}
  repartidores/{uid}
  conductores_activos/{uid}
  liquidaciones/{liquidacionId}
  liquidaciones_auditoria/{auditId}
  configuracion/sistema/*

Firestore
  order_events/{eventId}
  historico_pedidos/{pedidoId}
  users/{userId}
  liquidaciones_ledger/{ledgerId}       # recomendado si se formaliza contabilidad
```

## Bloqueadores antes de cambiar codigo

- Confirmar si `order_events_pending` es contrato real de bridge o solo expectativa de prueba.
- Confirmar si Firestore `historico_pedidos` existe en produccion o sigue pendiente.
- Decidir campo canonico de capital: `finanzas` o `billetera`; hoy ambos aparecen.
- Decidir retiro o compatibilidad de `repartidores_activos`.
- Agregar propietario explicito de `liquidaciones`: panel/backend actual vs ledger Firestore.
- Retirar o redirigir escrituras directas de `public/panel.html` sobre `pedidos`, `pedidos_para_reparto` y `pedidos_en_camino`.
- Decidir si `src/agentes/agenteDespacho.js` sigue activo; hoy escucha `pedidos` y escribe estados fuera de la maquina actual.

## Estado de fases

| Fase | Estado | Nota |
|---|---|---|
| PHASE 1 | Certificada | Ciclo pedido completo validado |
| PHASE 2A | 90-95% | Matriz, inventarios y gates listos; faltan 3 escrituras directas en `public/panel.html` |
| PHASE 2B | Siguiente prioridad | GPS, `conductores_activos`, tracking, TTL y cleanup |
| PHASE 2C | Pendiente | Finanzas, capital, liquidaciones y ledger economico |
| PHASE 3 | Pendiente | Escalabilidad, observabilidad y alertas |

## Evidencia local usada

- `routes/admin.js`: crea pedidos en `pedidos`, marca LISTO y copia a `pedidos_para_reparto`.
- `routes/delivery.js`: acepta/completa pedidos, reserva/libera capital, escribe `pedidos_para_reparto`, `pedidos`, `pedidos_en_camino`, `order_events` y GPS.
- `routes/panel.js` y `src/services/debtLockService.js`: pagos/deuda sobre `repartidores/{uid}`.
- `functions/index.js`: antifraude sobre RTDB `pedidos/{pedidoId}` y `conductores_activos/{uid}`.
- `public/panel.html` y `public/repartidor.html`: lectores directos de RTDB para panel y repartidor.
- `tests/delivery_panel.test.js` y `tests/concurrencia_listo.test.js`: expectativas de capital, estados, concurrencia y eventos.
