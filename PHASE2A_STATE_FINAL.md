# ESTADO GLOBAL NELLY - POST PHASE 2A FREEZE

**Timestamp:** 2026-06-17 T10:55:00Z  
**Status:** ✅ PHASE 2A CONGELADA | 🎯 PHASE 2B READY  
**Tag:** `phase2a-certified` (ee52b6b)

---

## 📋 ESTADO DE FASES

### ✅ PHASE 1: ORDERBOOK INTEGRITY
**Estado:** Certificada  
**Evidencia:** E2E test pass, 4 governance rules validated  
**No se modificará.**

### ✅ PHASE 2A: SINGLE WRITER PEDIDOS
**Estado:** Congelada  
**Fecha:** 2026-06-17  
**Garantías:**
- Gate A: Panel no escribe directamente a RTDB (0 matches)
- State machine bloqueada: Solo 4 transiciones válidas
- Versionado atómico: Cada cambio incrementa version
- Ledger de eventos: order_events/ registra cada transición
- E2E: 4/4 reglas de gobernanza pasan

**Commits inmutables:**
- `2aa7513`: Fix panel delegates to backend
- `082021b`: E2E verification
- `123abb5`: Certification
- `ee52b6b`: Final reproducible verification

**Próximos cambios a PHASE 2A:** ❌ PROHIBIDOS

---

### 🎯 PHASE 2B: GPS GOVERNANCE
**Estado:** Ready to start  
**Duración estimada:** 2 horas total

#### Problemas identificados (No bloquean PHASE 2A)
```
1. Node divergence:    conductores_activos vs repartidores_activos
2. No TTL cleanup:     Records persisten indefinidamente
3. No offline handler: App destruction no notifica backend
4. Stale markers:      UI muestra conductores muertos
```

#### Priorización
```
P0 (15 min):  Consolidar a conductores_activos único
              - mapa-logistica.js:26
              - logistica-maps.js:40
              - routes/admin.js:62
              - routes/soporte.js:12
              
P1 (90 min):  Implementar cleanup + offline
              - Cloud Function TTL 120s
              - POST /driver-offline endpoint
              - Android onDestroy() integration
              
P2 (20 min):  UI stale filtering
              - Timestamp validation
              - Opacity gradient
```

---

## 🔒 ARQUITECTURA BLOQUEADA DE PHASE 2A

### Single Writer Pattern: Panel → Backend → RTDB

```
┌─────────────┐
│   Panel     │  (HTML/JS - Read only)
└──────┬──────┘
       │ async POST
       ↓
┌──────────────┐
│ Backend API  │  (Node.js - Single writer)
└──────┬───────┘
       │ admin.database().ref()
       ↓
┌──────────────┐
│    RTDB      │  (Operacional)
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Ledger       │  (order_events/)
└──────────────┘
```

### Invariantes (No se pueden violar)

1. **Panel no escribe a RTDB**
   - Todas operaciones → POST endpoint
   - Verificación: `grep -r "set(ref(rtdb" public/ | wc -l` = 0

2. **Backend único escritor de pedidos**
   - Escrituras solo en routes/delivery.js
   - Verificación: `grep "db.ref.*pedidos" routes/delivery.js | wc -l` = 1

3. **Máquina de estados bloqueada**
   - TRANSICIONES_VALIDAS define caminos válidos
   - Transiciones inválidas = error rechazado
   - Verificación: TRANSICIONES_VALIDAS[estado] ∩ [destino] ≠ ∅

4. **Versionado inmutable**
   - Cada transición incrementa version
   - version nunca retrocede
   - Verificación: v0 < v1 < v2 < v3

5. **Evento registrado**
   - order_events/{pedidoId}/{version} creado en cada transición
   - Verificación: order_events/{id}/0, /1, /2, /3 existen

---

## 🚨 LO QUE NO DEBE CAMBIAR

### Commits Certificados (Inviolables)

```bash
git log --oneline nelly-os-v1-validation-ready | head -10
```

- **ee52b6b**: PHASE 2A Final reproducible verification
- **24d2d67**: Pre-freeze verification 3 conditions
- **123abb5**: E2E Certification Report
- **082021b**: Governance Snapshot PHASE 2A
- **2aa7513**: GATE A: Panel delegates to backend

### Archivos de Gobernanza (Reference only, do not edit)

- PRECONGELACION_AUDITORIA.md (evidence locked)
- src/constants/gpsContract.js (GPS contract for PHASE 2B)
- .codex-tmp/generate-and-validate.mjs (E2E test - frozen)

---

## 🎬 TRANSICIÓN A PHASE 2B

### Antes de tocar GPS:

1. ✅ Leer PRECONGELACION_AUDITORIA.md completo
2. ✅ Entender gpsContract.js (TRACKING=30s, TTL=120s, CLEANUP=60s)
3. ✅ Crear rama `feature/phase2b-gps`
4. ❌ No modificar routes/delivery.js POST /update-location
5. ❌ No cambiar TRACKING_INTERVAL_MS sin revisar gpsContract.js

### Cambios permitidos en PHASE 2B:

```
routes/admin.js:62                    repartidores_activos → conductores_activos
public/js/mapa-logistica.js:26        repartidores_activos → conductores_activos
public/js/logistica-maps.js:40        repartidores_activos → conductores_activos
routes/soporte.js:12                  repartidores_activos → conductores_activos

functions/index.js                    + cleanupStaleConductores() [NEW]
routes/delivery.js:/driver-offline    + POST /driver-offline [NEW]

Android DeliveryTrackingService.kt    + markOffline() on destroy
```

### Cambios prohibidos:

```
❌ Panel → agregar escrituras a RTDB
❌ routes/delivery.js:/update-location → modificar estructura
❌ TRANSICIONES_VALIDAS → cambiar reglas
❌ Versioning logic → tocar increment
❌ order_events → agregar nuevos campos
```

---

## 📊 MATRIZ DE RESPONSABILIDAD

| Componente | Owner | PHASE 2A | PHASE 2B | Protegido |
|---|---|---|---|---|
| Panel | UI Team | 🔒 RO only | No cambio | ✅ Verificado |
| routes/delivery.js | Backend | 🔒 State machine | GPS cleanup | ✅ E2E locked |
| RTDB pedidos/* | Single writer | 🔒 Backend only | No cambio | ✅ Gate A |
| conductores_activos | GPS | ⚠️ Divergence | Consolidate | ✅ P0 |
| repartidores_activos | Legacy | ⚠️ Still used | Migrate | ✅ P0 |
| Cloud Functions | Backend | ✅ Empty | Add cleanup | ✅ P1 |

---

## ✅ VERIFICACIÓN PRE-OPERATIVA

Antes de comenzar PHASE 2B, ejecutar:

```bash
# [1] Confirmar PHASE 2A está congelada
git show phase2a-certified --quiet
git tag -l phase2a-certified

# [2] Confirmar TRANSICIONES_VALIDAS está intacta
grep -A 5 "const TRANSICIONES_VALIDAS" routes/delivery.js

# [3] Confirmar 0 client-side writes
grep -r "set(ref(rtdb" public/ | wc -l        # debe = 0
grep -r "update(ref(rtdb" public/ | wc -l     # debe = 0

# [4] Confirmar divergencia documentada
grep -c "repartidores_activos" public/js/mapa*.js  # debe = 2

# [5] Confirmar GPS contract existe
head -50 src/constants/gpsContract.js
```

**Si todos pasan:** Proceder a PHASE 2B sin restricciones  
**Si alguno falla:** Revisar PRECONGELACION_AUDITORIA.md

---

## 🎯 PHASE 2B SUCCESS CRITERIA

### Metrics

```
1. Node divergence resolved: grep repartidores_activos = 0 (en production code)
2. TTL implemented: Cloud Function runs every 60s
3. Offline handler: POST /driver-offline responds < 100ms
4. Stale filtering: UI hides markers > 120s old
5. E2E pass: test-gps-certification.mjs PASS 5/5 validations
```

### Rollback Plan

```
Si se rompe PHASE 2B:
  git reset --hard phase2a-certified
  git checkout -b hotfix/phase2b-rollback
  # Identify root cause in PHASE2B_FAILURE_REPORT.md
```

---

## 📚 Documentos de Referencia

**PHASE 2A Locked:**
- [PRECONGELACION_AUDITORIA.md](PRECONGELACION_AUDITORIA.md) — Final evidence
- [PHASE2A_CERTIFICATION_REPORT.md](PHASE2A_CERTIFICATION_REPORT.md) — E2E results
- [GOVERNANCE_SNAPSHOT_PHASE2A.md](GOVERNANCE_SNAPSHOT_PHASE2A.md) — Audit matrix

**PHASE 2B Planning:**
- [PHASE2B_GPS_INVESTIGATION.md](PHASE2B_GPS_INVESTIGATION.md) — Architecture Q&A
- [PHASE2B_PRIORITY_REORDERED.md](PHASE2B_PRIORITY_REORDERED.md) — P0/P1/P2 framework
- [PHASE2B_CAMBIOS_CONCRETOS.md](PHASE2B_CAMBIOS_CONCRETOS.md) — Line-by-line changes
- [HOY_vs_MANANA.md](HOY_vs_MANANA.md) — Transition checklist

**GPS Contract:**
- [src/constants/gpsContract.js](src/constants/gpsContract.js) — Operating parameters

---

## 🏁 DECISIÓN FINAL

**PHASE 2A:** ✅ Congelada, verificable, sin riesgos  
**PHASE 2B:** 🎯 Listo para comenzar, sin bloqueadores  

**Próximo paso:** Crear rama `feature/phase2b-gps` y ejecutar P0 (15 min)

**Responsable:** GPS Team  
**Timeline:** 2 horas (P0=15min, P1=90min, P2=20min)  
**Riesgo:** Bajo (arquitectura de pedidos aislada de GPS)

---

**Creado:** 2026-06-17 T10:55:00Z  
**Congelación Tag:** `phase2a-certified` (ee52b6b)  
**Estado:** ✅ LISTO PARA PHASE 2B
