# CHECKPOINT P0 - PILOTO OPERATIVO NELLY - 2026-07-10

## Entorno validado

- Workspace: `C:\Users\hp14\OneDrive\Desktop\nelly`
- Repositorio remoto: `https://github.com/anaranjos473-lab/nelly-api.git`
- Branch: `main`
- Firebase project: `nelly-delivery`
- Hosting URL: `https://nelly-delivery.web.app`

## Artefactos identificados

- Backend/Hosting: `firebase.json`
- Hosting public: `public`
- Hosting rewrites: `/panel -> /panel.html`, `/ -> /index.html`, `** -> /index.html`
- Android module presente en este workspace: `:app`
- Android `applicationId`: `com.example.nellydriver`
- Android `versionName`: `5.0.0-PRO`
- Android `versionCode`: `5`
- APK debug esperado: `app/build/outputs/apk/debug/app-debug.apk`

## Cambios ya guardados y subidos

- `682a541` - `Fix driver active order validation`
- `26ec02a` - `Prepare Firebase Storage evidence rules`

## Validaciones ejecutadas

- `assembleDebug`: exitoso despues del cambio Android en `PedidoRepository.kt`.
- `firebase.cmd deploy --only hosting,database,firestore`: exitoso.
- `firebase.cmd deploy --only storage`: bloqueado porque Storage no esta inicializado.
- Prueba Admin SDK contra buckets:
  - `nelly-delivery.firebasestorage.app`: 404, bucket no existe.
  - `nelly-delivery.appspot.com`: 404, bucket no existe.

## Estado operativo

- Admin: certificado funcional.
- Cocina: certificado funcional.
- Driver: flujo operativo certificado.
- RTDB: flujo operativo certificado.
- Entrega: llega a radar activo despues de finalizar.
- Evidencia fotografica: pendiente por infraestructura Storage.

## Bloqueos de infraestructura

- Functions: no desplegadas por requisito de plan Blaze para `cloudbuild.googleapis.com` y `artifactregistry.googleapis.com`.
- Storage: no inicializado en Firebase Console. Requiere `Storage > Get Started` en proyecto `nelly-delivery`.

## Regla activa

Hasta que exista el bucket de Storage, no modificar:

- Android.
- `PedidoRepository`.
- `MainViewModel`.
- RTDB.

El siguiente cambio permitido es infraestructura Storage o despliegue de `storage.rules` cuando el bucket exista.
