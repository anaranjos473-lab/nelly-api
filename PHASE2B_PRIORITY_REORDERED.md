# 🎯 PHASE 2B REPRIORITIZADO: DIVERGENCIA ES ISSUE #1

**Timestamp:** 2026-06-17 T16:30:00Z  
**Status:** AUDITORÍA COMPLETA REVELADA

---

## ⚠️ LA VERDADERA CRISIS

**Qué encontré en la auditoría:**

```
Backend escribe:    conductores_activos/{uid}/lat,lng,timestamp
Mapa lee:           repartidores_activos

RESULTADO:          Mapa POTENCIALMENTE ROTO o desincronizado
```

### Matriz de Lectura/Escritura Completa

#### ESCRIBE A:

| Nodo | Locación | Función |
|------|----------|---------|
| **conductores_activos** | routes/delivery.js:560-562 | GPS real (POST /update-location) |
| **repartidores_activos** | ❌ NO ENCONTRADO | ¿? |

#### LEE DE:

| Nodo | Locación | Consumidor |
|------|----------|-----------|
| **conductores_activos** | app.js:132 | Dashboard |
| **conductores_activos** | functions/index.js:47 | Antifraude |
| **conductores_activos** | agenteDespacho.js:33 | Despacho/Assignment |
| **conductores_activos** | agenteAntifraude.js:88 | Auditoría |
| **conductores_activos** | agenteTarifaDinamica.js:26 | Precios dinámicos |
| **repartidores_activos** | mapa-logistica.js:26 | 🗺️ MAPA ADMIN |
| **repartidores_activos** | logistica-maps.js:40 | 🗺️ OTRO MAPA? |
| **repartidores_activos** | routes/admin.js:62 | Dashboard admin |
| **repartidores_activos** | routes/soporte.js:12 | Soporte |

### El Problema

```
BACKEND:              CLIENTES:
└── conductores_activos    ├── Dashboard: conductores_activos ✅
    ├── lat              ├── Despacho: conductores_activos ✅
    ├── lng              ├── Antifraude: conductores_activos ✅
    └── timestamp        ├── Tarifa: conductores_activos ✅
                         └── MAPA: repartidores_activos ❌
```

**Consecuencia:**

```
✅ Dashboard ve conductores activos (leen conductores_activos)
✅ Despacho asigna conductores (leen conductores_activos)
❌ MAPA muestra... ¿nada? ¿outdated data?
```

**Impacto Operacional:**

```
Admin panel: ✅ Ve quién está activo
Despacho:   ✅ Asigna pedidos
Mapa:       ❌ VACÍO o DESINCRONIZADO
```

---

## 🏆 REPRIORITIZACIÓN COMPLETA DE PHASE 2B

### P0 — CRÍTICO (Hace el mapa funcionar)

#### Issue #1: Fuente Única de Conductor

**Problema:** `conductores_activos` vs `repartidores_activos` = divergencia

**Solución:**
1. Eliminar `repartidores_activos` para GPS
2. Cambiar TODOS los lectores a `conductores_activos`
3. Crear única fuente: `conductores_activos/{uid}/{lat,lng,timestamp}`

**Archivos a modificar:**

```bash
1. public/js/mapa-logistica.js:26
   ❌ const dbRef = ref(rtdb, 'repartidores_activos');
   ✅ const dbRef = ref(rtdb, 'conductores_activos');

2. public/js/logistica-maps.js:40
   ❌ const dbRef = firebase.database().ref('repartidores_activos');
   ✅ const dbRef = firebase.database().ref('conductores_activos');

3. routes/admin.js:62 (dashboard)
   ❌ db.ref('repartidores_activos')
   ✅ db.ref('conductores_activos')

4. routes/soporte.js:12 (soporte)
   ❌ admin.database().ref('repartidores_activos')
   ✅ admin.database().ref('conductores_activos')
```

**Status:** 🔴 **BLOCKER - Mapa potencialmente no funciona**

---

### P1 — CRÍTICO (Limpia fantasmas)

#### Issue #2: Cleanup Automático (120 segundos)

**Patrón esperado:**

```
T0:  Driver activo → conductores_activos/{uid} creado
T30: GPS update → timestamp actualizado ✅
T60: GPS update → timestamp actualizado ✅
T90: Conexión pierde señal...
T+30 (T120): Cleanup ejecuta → NOW - timestamp = 120s exacto
             Nodo se elimina ✅
```

**Implementación:**

```javascript
// functions/index.js
exports.cleanupStaleConductores = functions.pubsub
  .schedule('every 1 minutes')
  .onRun(async (context) => {
    const db = admin.database();
    const now = Date.now();
    const TTL_MS = 120 * 1000; // 120 segundos
    
    const snap = await db.ref('conductores_activos').once('value');
    const conductores = snap.val() || {};
    
    let deleted = 0;
    for (const [uid, data] of Object.entries(conductores)) {
      if (!data.timestamp) {
        await db.ref(`conductores_activos/${uid}`).set(null);
        deleted++;
      } else if (now - data.timestamp > TTL_MS) {
        console.log(`[Cleanup] Elimando conductor stale: ${uid} (${now - data.timestamp}ms old)`);
        await db.ref(`conductores_activos/${uid}`).set(null);
        deleted++;
      }
    }
    
    console.log(`[Cleanup] Ejecutado. ${deleted} conductores eliminados.`);
    return { deleted };
  });
```

**Status:** 🟡 **Depende de P0**

---

### P1 — CRÍTICO (Manejo de desconexión)

#### Issue #3: Notificación onDestroy (Android)

**Cambio en Android:**

```kotlin
// app/src/main/java/com/nelly/driver/service/DeliveryTrackingService.kt

override fun onDestroy() {
    handler.removeCallbacks(trackingRunnable)
    
    // NUEVO: Notificar al backend que conductor está offline
    lifecycleScope.launch(Dispatchers.IO) {
        try {
            client.markOffline()  // POST /api/delivery/driver-offline
        } catch (e: Exception) {
            Log.e(TAG, "Error marking offline", e)
        }
    }
    
    super.onDestroy()
}
```

**Backend endpoint (routes/delivery.js):**

```javascript
router.post('/driver-offline', requireFirebaseUser, async (req, res) => {
  try {
    const uid = req.firebaseUser.uid;
    const admin = await getAdmin();
    const db = admin.database();
    
    // Eliminar conductor de activos inmediatamente
    await db.ref(`conductores_activos/${uid}`).set(null);
    
    console.log(`[Offline] Conductor ${uid} desconectado`);
    return res.json({ ok: true, message: 'Offline registered' });
  } catch (error) {
    console.error('[Offline] Error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
});
```

**Status:** 🟡 **Depende de P0**

---

### P2 — IMPORTANTE (Optimización)

#### Issue #4: UI también filtra timestamp

**Mapa no debe confiar solo en limpieza backend:**

```javascript
// public/js/mapa-logistica.js

function initMap() {
    const map = new google.maps.Map(...);
    
    const dbRef = ref(rtdb, 'conductores_activos');
    onValue(dbRef, (snapshot) => {
        const now = Date.now();
        const STALE_THRESHOLD_MS = 120 * 1000; // 120 segundos
        
        markers.forEach(marker => marker.setMap(null));
        markers = [];
        
        snapshot.forEach((child) => {
            const data = child.val();
            const uid = child.key;
            
            // FILTRO 1: Validar timestamp existe
            if (!data.timestamp) {
                console.warn(`[Map] ${uid} sin timestamp, ignorando`);
                return;
            }
            
            // FILTRO 2: Validar no es stale
            if (now - data.timestamp > STALE_THRESHOLD_MS) {
                console.log(`[Map] ${uid} stale (${now - data.timestamp}ms), ignorando`);
                return;
            }
            
            // Solo pintar si es reciente
            const marker = new google.maps.Marker({
                position: { lat: data.lat, lng: data.lng },
                map: map,
                icon: `data:image/svg+xml,...`,
                title: `${data.driverId} (actualizado hace ${Math.floor((now - data.timestamp) / 1000)}s)`,
                opacity: Math.max(0.3, 1 - (now - data.timestamp) / STALE_THRESHOLD_MS)
            });
            markers.push(marker);
        });
    });
}
```

**Status:** 🟢 **Parallelizable con P1**

---

## 📋 MATRIZ DE CORRECCIONES ORDENADAS

| P | Issue | Archivo(s) | Cambio | Línea(s) | Blocker? |
|---|-------|-----------|--------|---------|----------|
| **P0** | Fuente única | mapa-logistica.js | Read: repartidores → conductores | 26 | 🔴 YES |
| **P0** | Fuente única | logistica-maps.js | Read: repartidores → conductores | 40 | 🔴 YES |
| **P0** | Fuente única | routes/admin.js | Read: repartidores → conductores | 62 | 🟡 UI |
| **P0** | Fuente única | routes/soporte.js | Read: repartidores → conductores | 12 | 🟡 UI |
| **P1** | Cleanup | functions/index.js | NEW: Cloud Function TTL | NEW | 🟢 After P0 |
| **P1** | Offline | routes/delivery.js | NEW: /driver-offline endpoint | NEW | 🟢 After P0 |
| **P1** | Offline | Android Service | NEW: markOffline() call | onDestroy | 🟢 After P0 |
| **P2** | UI Filter | mapa-logistica.js | Add: timestamp validation | 26-50 | 🟢 Parallel |

---

## 🎬 PLAN EJECUCIÓN (Mañana 2026-06-18)

### Hora 1: Consolidar fuente única (P0)

```bash
# 4 cambios simples de "repartidores_activos" → "conductores_activos"
- mapa-logistica.js:26
- logistica-maps.js:40
- routes/admin.js:62
- routes/soporte.js:12

# Commit: "P0: Consolidate GPS source to conductores_activos"
```

### Hora 2-3: Implementar cleanup (P1)

```bash
# Agregar Cloud Function
- functions/index.js: cleanupStaleConductores (30 líneas)

# Agregar endpoint offline
- routes/delivery.js: /driver-offline (20 líneas)

# Commit: "P1: Implement 120s TTL cleanup + offline handler"
```

### Hora 4: Actualizar Android (P1)

```bash
# Actualizar onDestroy
- app/src/main/java/com/nelly/driver/service/DeliveryTrackingService.kt
  + client.markOffline()

# Commit: "P1: Notify backend on app destruction"
```

### Hora 5: UI Filtering (P2)

```bash
# Agregar timestamp validation
- mapa-logistica.js: Filter stale + opacity gradient

# Commit: "P2: Add UI-level timestamp filtering"
```

### Hora 6: Prueba de Certificación (Test)

```javascript
// .codex-tmp/test-gps-cleanup.mjs

async function testGPSCleanup() {
  const pedidoId = `TEST_GPS_${Date.now()}`;
  const driverId = 'test_driver_' + Date.now();
  
  console.log('STEP 1: Driver appears');
  await updateLocation(driverId, {lat: 16.75, lng: -93.12});
  
  let conductores = await queryNode('conductores_activos');
  assert(conductores[driverId], 'Driver debe estar en activos');
  console.log('✅ Driver visible en conductores_activos');
  
  console.log('\nSTEP 2: Esperar 120+ segundos...');
  // Simular: actualizar timestamp a -140 segundos
  await db.ref(`conductores_activos/${driverId}/timestamp`)
    .set(Date.now() - 140000);
  
  console.log('\nSTEP 3: Trigger cleanup manualmente (dev)');
  // En producción sería Cloud Function cada 1 minuto
  await cleanupStaleManual();
  
  console.log('\nSTEP 4: Verificar eliminación');
  conductores = await queryNode('conductores_activos');
  assert(!conductores[driverId], 'Driver debe estar eliminado después de 120s');
  console.log('✅ Driver eliminado correctamente');
  
  console.log('\n✅ GPS CLEANUP CERTIFICATION: PASS');
  return { resultado: 'PASS' };
}
```

**Status:** ✅ Test automatizado

---

## 🎓 ESTADO ARQUITECTÓNICO DESPUÉS DE P0-P2

### Antes

```
Backend escribe:  conductores_activos
Mapa lee:         repartidores_activos
Resultado:        DIVERGENCIA POTENCIAL
```

### Después

```
Backend escribe:  conductores_activos
Dashboard lee:    conductores_activos ✅
Despacho lee:     conductores_activos ✅
Mapa lee:         conductores_activos ✅
Cleanup:          Cada 1 minuto, TTL 120s ✅
Offline notify:   Inmediato ✅
Resultado:        FUENTE ÚNICA CONVERGIDA
```

---

## 📊 IMPACTO EN OBSERVABILIDAD

**Después de PHASE 2B:**

```
Conductor conecta:
  → conductores_activos/{uid} creado (timestamp = NOW)
  → Mapa: ✅ Visible inmediatamente
  
Conductor activo en pedido:
  → GPS cada 30s
  → conductores_activos/{uid}/timestamp actualizado
  → Mapa: ✅ Seguimiento en vivo

Conductor pierde conexión:
  → 120 segundos sin GPS update
  → Cleanup ejecuta (cada minuto)
  → conductores_activos/{uid} eliminado
  → Mapa: ✅ Desaparece correctamente

App crush/cierre:
  → DeliveryTrackingService.onDestroy()
  → POST /api/delivery/driver-offline
  → conductores_activos/{uid} eliminado inmediatamente
  → Mapa: ✅ Desaparece al instante
```

---

## ✅ Decision Point

**¿Están todos alineados en esta priorización?**

**P0:** Consolidar a `conductores_activos` (mapa funcione)  
**P1:** Cleanup + Offline handler (fantasmas eliminados)  
**P2:** UI filtering (protección extra)

**Si sí → Procedo con implementación completa mañana**

---

**Creado:** 2026-06-17 T16:30:00Z  
**Tipo:** Reprioritización estratégica  
**Status:** Listo para ejecución

El hallazgo de la discrepancia cambió TODO. No es un detalle, es el Issue #1.
