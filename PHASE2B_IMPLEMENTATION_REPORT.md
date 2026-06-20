# PHASE 2B P1+P2 - IMPLEMENTATION REPORT

**Fecha:** 2026-06-17  
**Estado:** Implementado en codigo, pendiente deploy y verificacion fisica

---

## Alcance Implementado

### P1: TTL cleanup + offline inmediato

- `functions/index.js`
  - Nueva Cloud Function `cleanupStaleConductores`.
  - Escanea `conductores_activos` cada 1 minuto.
  - Elimina registros sin `timestamp` valido o con edad `>= 120s`.

- `routes/delivery.js`
  - Nuevo endpoint `POST /api/delivery/driver-offline`.
  - Requiere token Firebase igual que `/update-location`.
  - Elimina `conductores_activos/{uid}` inmediatamente.
  - Marca `repartidores/{uid}/estado_gps = offline`.

- Android driver app
  - `LocationUpdateClient.kt` agrega `markOffline()`.
  - `DeliveryTrackingService.kt` llama `markOffline()` en `onDestroy()` y `onTaskRemoved()`.

### P2: UI stale filtering

- `public/js/mapa-logistica.js`
  - Oculta marcadores con GPS `>= 120s` o timestamp invalido.
  - Aplica opacidad segun edad:
    - `ACTIVE`: 0-40s, opacity 1.0
    - `DEGRADED`: 40-60s, opacity 0.72
    - `STALE`: 60-120s, opacity 0.45
  - Agrega estado y edad al `title` del marcador.

---

## Verificacion Ejecutada

```bash
node --check routes/delivery.js
node --check functions/index.js
node --experimental-vm-modules node_modules/jest/bin/jest.js tests/delivery_panel.test.js --runInBand --cacheDirectory=.jest-cache
```

**Resultado:** PASS

- `tests/delivery_panel.test.js`: 10/10 tests passed.
- Se agrego cobertura para `POST /api/delivery/driver-offline`.

---

## Limitaciones

- No se pudo compilar Android desde este shell porque `gradle` no esta instalado/disponible en PATH.
- Pendiente desplegar Functions/backend antes de campo.
- Pendiente ejecutar `PHASE2B_PHYSICAL_VERIFICATION.md` con 2 telefonos.

---

## Siguiente Gate

No iniciar piloto comercial hasta completar:

1. Deploy de backend con `/api/delivery/driver-offline`.
2. Deploy de `cleanupStaleConductores`.
3. Build de app Android con `markOffline()`.
4. Verificacion fisica 5/5 escenarios PASS.

