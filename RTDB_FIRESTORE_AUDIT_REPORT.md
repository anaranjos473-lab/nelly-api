# Auditoría Firestore / RTDB-only

## Búsqueda de patrones
Se buscaron en todo el repositorio los patrones solicitados:
- `admin.firestore(`
- `.firestore(`
- `collection(`
- `onSnapshot(`
- `functions.firestore`
- `Firestore`

## Hallazgos clave
- No se encontró `onSnapshot(` en el código fuente JS/TS del repositorio.
- Se detectaron usos activos de `admin.firestore()` en el backend de Node.js.
- Existen artefactos de Firestore en frontend y en documentación/pruebas.

## Reporte por archivo
| ARCHIVO | USO ENCONTRADO | CRÍTICO | BLOQUEA RTDB-ONLY |
|---|---|---|---|
| `router.js` | `admin.firestore().collection('pedidos')`, `admin.firestore().collection('zonas')`, consultas y cálculo de reporte financiero | Sí | Sí |
| `src/controllers/usersController.js` | `admin.firestore()` + CRUD Firestore en `users` | Sí | Sí |
| `src/controllers/ordersController.js` | `admin.firestore()` + CRUD Firestore en `orders` | Sí | Sí |
| `public/firebase.js` | `getFirestore(app)` inicializa Firestore cliente | Sí* | Parcial/No* |
| `public/test_evidencia.js` | Test frontend que usa Firestore para validar evidencia | No (auxiliar) | No |
| `public/subirEvidencia.js` | Subida de evidencia y update a documento en Firestore | No (auxiliar) | No |
| `public/js/config.js` | `getFirestore(app)` pero no parece importado desde HTML en el repo | No | No |
| `app_fixed.js` | Código Firestore de pruebas/manuales sobre `zonas` y `pedidos` | No | No |
| `app_test.js` | Endpoints de prueba Firestore (`/firestore/pedidos`, `/firestore/crear-pedido`) | No | No |
| `test-antifraude*.js`, `test-insert-firebase.js`, `test-verifica-antifraude.js` | Scripts de prueba/manual que usan `admin.firestore()` | No | No |
| `firebase.json` | Configuración y reglas de Firestore incluidas en despliegue | No (config) | Sí* |
| `functions/package-lock.json`, `package-lock.json` | Dependencia `@google-cloud/firestore` listada | No (artifact) | Sí* |

> Nota: `public/firebase.js` y `public/test_evidencia.js` exponen uso de Firestore en el panel, pero su función actual parece ser de prueba/validación de evidencia más que del flujo de despacho principal. Sin embargo, la presencia en `panel.html` los hace parte del runtime de la interfaz.

## Clasificación
- Dependencias activas críticas:
  - `router.js`
  - `src/controllers/usersController.js`
  - `src/controllers/ordersController.js`
- Dependencias de frontend/test-auxiliar:
  - `public/firebase.js`
  - `public/test_evidencia.js`
  - `public/subirEvidencia.js`
- Dependencias legacy / muertas:
  - `app_fixed.js`
  - `app_test.js`
  - `test-*` scripts que usan Firestore
  - `public/js/config.js` (parece no referenciado)
- Artefactos de configuración que aún deben revisarse para RTDB-only:
  - `firebase.json` incluye `firestore.rules`
  - `package-lock.json` / `functions/package-lock.json` incluyen `@google-cloud/firestore`

## Conclusión
El repositorio **no está aún completamente RTDB-only**. Hay usos activos de Firestore en el backend principal (`router.js`, `usersController.js`, `ordersController.js`) que bloquean una certificación RTDB-only completa.

Si el objetivo es certificar RTDB-only, el siguiente paso es evaluar la migración o eliminación de esos controladores y del bloque de Firestore en el panel.
