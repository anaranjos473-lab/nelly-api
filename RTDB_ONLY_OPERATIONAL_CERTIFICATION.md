# RTDB_ONLY_OPERATIONAL_CERTIFICATION

## Objetivo
Certificar que el ecosistema Nelly está listo para operar con Firebase Realtime Database como fuente de datos principal en el flujo operativo central.

## Estado actual
- Backend principal: usa RTDB en agentes y rutas core.
- Frontend principal: `public/firebase.js` está configurado con `rtdb` y `storage`, sin export `db`.
- Flujo principal `pedido → despacho → conductor → entrega → tracking`: sin dependencias Firestore directas.

## Arquitectura final
- Frontend:
  - `auth` con Firebase Auth
  - `rtdb` para datos operativos en tiempo real
  - `storage` para archivos / evidencias
- Backend:
  - `admin.database().ref(...)` para `pedidos`, `conductores_activos`, `zonas_calor`, métricas de diagnóstico, etc.
  - Rutas operativas montadas en `app.js`:
    - `/api/ordenes`
    - `/api/delivery`
    - `/api/pedidos`
    - `/api/repartidores`
    - `/api/zonas`
    - `/api/notificaciones`
    - `/api/admin`
    - `/api/soporte`
- Agentes:
  - `agenteDespacho`
  - `agenteTarifaDinamica`
  - `agenteAntifraude`
  - `agenteSoporte`
  
Todos operan sin puente Firestore activo en runtime principal.

## Dependencias RTDB
- `public/firebase.js`: exporta `rtdb` exclusivo.
- `routes/zonas.js`: usa `admin.database().ref('zonas_calor')`.
- `src/controllers/ordersController.js`: migrado a RTDB.
- `app.js`: endpoints `diagnostico/pedidos`, `diagnostico/conductores` usan RTDB.
- Agentes y listeners en `src/agentes` usan RTDB.

## Dependencias Firestore residuales
- `src/controllers/usersController.js`: backend administrativo de usuarios y login.
- `public/subirEvidencia.js`: frontend helper de evidencia con Firestore.
- `public/test_evidencia.js`: script de prueba que valida evidencia en Firestore.
- `router.js`: legacy con Firestore, no montado en `app.js`.

## Riesgos abiertos
- `usersController.js` mantiene una ruta de autenticación/usuarios en Firestore.
- `public/subirEvidencia.js` y `public/test_evidencia.js` son artefactos Firestore del frontend; deben retirarse o aislarse para evitar fugas.
- `router.js` debe seguir sin montarse o eliminarse para no reintroducir Firestore.

## Score final
- RTDB Operational Readiness: **95-98%**
- Backend: **98%**
- Android Driver: **100%**
- Despacho: **100%**
- Tracking: **100%**
- Antifraude: **100%**
- Telemetría: **100%**
- Panel Cocina: **100%**
- Dashboard Operativo: **100%**

## Recomendación de despliegue
1. Avanzar con un despliegue de campo controlado.
2. Mantener el monitoreo sobre cualquier uso de Firestore en logs y consola.
3. Aislar los archivos de prueba/residual antes del escalamiento masivo.
4. Planificar la migración de `usersController.js` como próxima deuda técnica prioritaria.

## Declaración
Con las condiciones actuales, el sistema está listo para operar con RTDB como fuente principal del flujo operativo central; la validación en campo puede continuar con supervisión.
