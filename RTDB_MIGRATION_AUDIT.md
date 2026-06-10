# RTDB Migration Audit

## Estado actual

Objetivo de esta fase: retirar dependencias operativas de Firestore en el runtime principal, sin agregar features ni cambiar flujos de negocio.

## Firestore eliminados en Fase 1

- `src/agentes/agenteSoporte.js`
  - Eliminado `admin.firestore()`
  - Eliminado `collection('pedidos')`
  - Eliminado `onSnapshot(...)`
  - Reemplazado por `admin.database()`, `ref('pedidos')` y listeners `child_added` / `child_changed`
- `src/agentes/agenteTarifaDinamica.js`
  - Eliminadas lecturas de `pedidos` en Firestore
  - Eliminada escritura en `configuracion/sistema` de Firestore
  - Reemplazado por lectura y escritura en RTDB
- `functions/index.js`
  - Eliminado trigger `functions.firestore.document('pedidos/{pedidoId}').onUpdate(...)`
  - Migrado a `functions.database.ref('/pedidos/{pedidoId}').onUpdate(...)`
- `server.js`
  - El runtime principal ya no inicia bridge Firestore -> RTDB
- `src/services/firestoreRtdbBridgeService.js`
  - Retirado del runtime y eliminado
- `tests/firestoreRtdbBridge.test.js`
  - Retirado junto con el bridge legacy

## Firestore activos

Estos usos siguen existiendo en el repositorio y evitan declarar `100% RTDB-only` a nivel total del código:

- `src/controllers/usersController.js`
  - CRUD y login basados en colección `users`
- `src/controllers/ordersController.js`
  - CRUD basado en colección `orders`

## Firestore pendientes de retiro o decisión

- Scripts de prueba/manuales que todavía escriben en Firestore:
  - `test-antifraude.js`
  - `test-antifraude-step1.js`
  - `test-antifraude-step2.js`
  - `test-insert-firebase.js`
  - `test-verifica-antifraude.js`

## Validación de staging propuesta

Configurar:

```env
ENABLE_FIRESTORE_BRIDGE=false
```

Verificar mínimo:

1. Arranque de `server.js` sin bridge Firestore -> RTDB
2. `agenteSoporte` rescata pedidos en `PERCANCE`/`percance` usando RTDB
3. `agenteSoporte` aplica compensaciones a pedidos `PENDIENTE`/`pendiente` retrasados usando RTDB
4. `agenteAntifraude` y la Cloud Function reaccionan a cambios de `pedidos/{pedidoId}` en RTDB
5. `agenteTarifaDinamica` actualiza `configuracion/sistema` en RTDB

Validación ejecutada:

- `2026-06-09`
- Staging local en `http://127.0.0.1:3101/api/health`
- Resultado: `success=true`, arranque correcto, agentes activos, bridge ausente, sin errores en stderr

## Resultado de esta fase

- Bridge no requerido para el runtime principal: `sí`, validado en staging local
- Runtime principal backend/agentes orientado a RTDB: `sí`
- Repositorio completo RTDB-only: `no`, quedan controladores `users` y `orders` sobre Firestore
