# PROTOCOLO P0 - PILOTO OPERATIVO NELLY v1.1

## Objetivo

Mantener una unica linea de desarrollo certificada para el piloto, evitando modificar el repositorio equivocado, desplegar una version distinta o perder evidencia del estado operativo.

## Regla de oro

Antes de editar cualquier archivo se debe demostrar cual es el repositorio, proyecto y artefacto que realmente se va a generar.

Ningun cambio funcional se hace antes de esta validacion.

## Fase 0 - Identificacion del entorno

Antes de escribir codigo, confirmar:

- Ruta absoluta del proyecto.
- Ubicacion de `settings.gradle` o `settings.gradle.kts`.
- Ubicacion de `gradlew.bat`.
- Modulo que genera la APK.
- `applicationId`.
- `versionName`.
- `versionCode`.
- Repositorio.
- Branch.
- Remote.
- `firebase.json`.
- `hosting.public`.
- `hosting.rewrites`.
- Proyecto Firebase activo.

## Fase 1 - Inventario de repositorios

Existen al menos dos lineas que no deben mezclarse:

- Android: `NellyDriver`, APK, `PedidoRepository.kt`, `MainViewModel.kt`, `MainActivity.kt`, `DriverDashboardScreen.kt`, Compose.
- Backend/Hosting: `nelly-api`, rutas, paneles, `firebase.json`, `storage.rules`, Functions, Hosting.

Regla: cada cambio debe declarar el repositorio antes del commit.

## Fase 2 - Fuente de verdad

Cada modulo debe tener una fuente de verdad explicita:

- Driver Android: `PedidoRepository.kt`, `MainViewModel.kt`, `MainActivity.kt`.
- Cocina: `panel.html`, `panel.js`.
- Admin: `admin-dashboard.html`, `admin-dashboard.js`, `admin.js`.
- Backend: `delivery.js`, rutas API.
- Storage: `storage.rules`, `firebase.json`.

## Fase 3 - Validacion antes de editar

Antes de editar, buscar:

- `PedidoRepository`
- `MainViewModel`
- `DriverDashboardScreen`
- `finalizarEntregaConFoto`
- `FirebaseStorage`
- `storageBucket`

Si aparecen varias implementaciones:

1. Detener.
2. Identificar cual compila.
3. Editar unicamente esa.

## Fase 4 - Compilacion

Android requiere `assembleDebug` antes de commit cuando se modifica codigo Android.

Debe terminar correctamente. Sin compilacion exitosa, no hay commit de cambio Android.

## Fase 5 - Commit

Una sola responsabilidad por commit.

Secuencia obligatoria:

1. Validar.
2. Commit.
3. Push.
4. Deploy, si aplica.

Nunca desplegar antes de guardar y subir el cambio correspondiente.

## Fase 6 - Despliegue

Hosting puede desplegar:

- Hosting.
- Firestore Rules.
- RTDB Rules.
- Functions, solo si la infraestructura lo permite.

Si aparece `Cloud Build`, `Artifact Registry` o `Blaze Required`, registrarlo como pendiente de infraestructura. No tratarlo como bug de codigo.

Storage debe validarse en Firebase Console. Si el bucket no existe, no seguir buscando errores en Android, Driver o RTDB.

## Fase 7 - Validacion operativa

Despues del deploy, verificar:

- APK: `versionCode`, `versionName`, artefacto generado.
- Hosting: URL, HTML y JS actualizados.
- RTDB: flujo `PENDIENTE -> COCINA -> LISTO -> EN_CURSO -> ENTREGADO`.
- Driver: aceptar, tienda, pedido a bordo, cliente, foto, finalizar, radar activo.

## Fase 8 - Storage

Evidencia actual:

- `nelly-delivery.firebasestorage.app`: 404, bucket no existe.
- `nelly-delivery.appspot.com`: 404, bucket no existe.
- Firebase CLI: Storage no esta inicializado en `nelly-delivery`.

Conclusion:

- No existe Storage operativo.
- No volver a tocar Android, `PedidoRepository`, `MainViewModel` o RTDB por la evidencia hasta crear el bucket.
- Crear Storage desde Firebase Console: proyecto `nelly-delivery` > Storage > Get Started.
- Despues desplegar `firebase.cmd deploy --only storage`.

## Fase 9 - Checkpoint

Al terminar una sesion debe quedar registrado:

- Repositorio.
- Branch.
- Commit.
- Push.
- Deploy.
- APK.
- Hosting.
- Estado RTDB.
- Pendientes.

## Regla para agentes

Antes de responder "ya quedo", demostrar:

- Que repositorio se modifico.
- Que commit se genero.
- Que artefacto genera ese repositorio.
- Si compilo correctamente.
- Si se hizo push.
- Si se desplego.
- Que quedo bloqueado por infraestructura.
- Que quedo realmente corregido.

Si alguna respuesta no puede demostrarse con evidencia, el trabajo no debe darse por concluido.
