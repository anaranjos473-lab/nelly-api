# RTDB Critical Path Audit

## Objetivo
Auditar el flujo operativo crítico para determinar si las dependencias Firestore encontradas participan en el runtime principal y si afectan los componentes de Cocina, Admin, Driver, Cliente.

## Resumen general
- El runtime principal (`server.js` y `src/agentes/*`) es RTDB-only.
- No existe un Firestore Bridge activo en `server.js`.
- `router.js` con Firestore aparece solo en el entorno de pruebas `app_test.js`, no en `app.js`/`run_server.js`.
- El frontend de `panel.html` y `repartidor.html` consume RTDB con `onValue`, `child_added`/`child_changed` en RTDB y no usa Firestore para la fuente de datos principal.
- Existen aún artefactos y endpoints Firestore en backend y frontend que no forman parte del flujo crítico, pero representan riesgo si se dejan sin migrar.

## Hallazgos específicos

| COMPONENTE | FIRESTORE | RTDB | CRÍTICO | RIESGO | CLASIFICACIÓN |
|---|---|---|---|---|---|
| `router.js` | Sí — `/reporte-financiero`, `/zonas` usan `admin.firestore()` | No | No | Bajo (solo prueba/legacy) | A |
| `src/controllers/usersController.js` | Sí — CRUD en `users`, `/api/usuarios/login` usa Firestore | No | No para login de driver/cliente; sí para gestión de usuarios | Medio | B |
| `src/controllers/ordersController.js` | Sí — CRUD en `orders` | No | No para flujo de despacho RTDB | Medio | B |
| `public/firebase.js` | Sí — `getFirestore(app)` y export `db` | Sí — también exporta `rtdb` | No directo, pero carga SDK en panel | Alto | B |
| `public/test_evidencia.js` | Sí — consulta Firestore con `getDoc(doc(db, 'pedidos', pedidoId))` | No | No para despacho principal | Medio | B |
| `public/subirEvidencia.js` | Sí — `updateDoc(doc(db, 'pedidos', pedidoId), ...)` | No | No para despacho principal | Medio | B |
| `public/js/config.js` | Sí — `getFirestore(app)` | Sí — también `getDatabase(app)` | No, parece no referenciado | Bajo | A |
| `public/panel.html` | No — datos actuales vienen de RTDB | Sí — usa `onValue` + `runTransaction` en RTDB | Sí | Bajo | A |
| `public/repartidor.html` | No — datos de repartidor en RTDB | Sí — usa `onValue` en RTDB | Sí | Bajo | A |
| `routes/delivery.js` | No — usa `admin.database()` | Sí — asignación, ubicación, estado en `pedidos_para_reparto`, `pedidos_en_camino`, `pedidos` | Sí | Bajo | A |
| `server.js` | No — no importa `firestoreRtdbBridgeService` | Sí — arranca agentes RTDB-only | Sí | Bajo | A |
| `src/agentes/*` | No — no hay referencias Firestore en `agenteDespacho`, `agenteAntifraude`, `agenteSoporte` | Sí | Sí | Bajo | A |

## Componentes clave del flujo RTDB

### Cocina / Panel
- `public/panel.html` usa RTDB como fuente actual.
- Sus listeners críticos son `onValue` sobre `pedidos`, `pedidos_para_reparto`, `pedidos_en_camino`.
- `panel.html` también usa `runTransaction` en RTDB para operaciones de ganancias/consistencia.

### Driver
- `public/repartidor.html` autentica con `/api/auth/driver-token` y luego usa RTDB `onValue`.
- La asignación de pedidos se realiza en `routes/delivery.js` con `pedidos_para_reparto`, `pedidos_en_camino`, `conductores_activos`.

### Asignación de pedidos / pedidos en camino
- `routes/delivery.js` es el backend RTDB crítico que mueve pedidos de `pedidos_para_reparto` a `pedidos_en_camino`.
- No se encontró uso de Firestore en este flujo.

### Login / perfil conductor
- El login del repartidor se hace por custom token en `routes/auth.js`.
- No hay señal de que `src/controllers/usersController.js` sea usado por el login actual de conductores o clientes.
- `usersController.js` queda fuera del flujo de inicio de sesión en el cliente RTDB.

## Confirmaciones de infraestructura
- `server.js` imprime: ✅ Runtime principal operando sin Firestore bridge.
- No se detecta `firestoreRtdbBridgeService` importado en el repositorio.
- Los agentes (`agenteDespacho`, `agenteAntifraude`, `agenteSoporte`) son RTDB-only y no contienen Firestore.

## Recomendaciones mínimas de auditoría
- `router.js` puede permanecer como prueba/manual, pero no es crítico para Field Trials.
- `usersController.js` y `ordersController.js` deben migrarse o aislarse antes de producción si la certificación RTDB-only es estricta.
- `public/firebase.js`, `public/test_evidencia.js` y `public/subirEvidencia.js` son dependencias Firestore en frontend y deben revisarse antes de operar en producción RTDB-only.

## Conclusión
El flujo operativo crítico de Cocina/Driver/Asignación está actualmente RTDB-only.
Las dependencias Firestore restantes se encuentran en rutas de backend auxiliares y en artefactos frontend de prueba/legacy. Estas últimas no bloquean el flujo operativo inmediato, pero sí representan riesgo de certificación si se mantienen en producción.
