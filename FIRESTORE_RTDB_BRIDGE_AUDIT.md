# FIRESTORE ↔ RTDB BRIDGE AUDIT

## Contexto Crítico

Se mencionó que `firestoreRtdbBridgeService.js` fue **eliminado**.

**Pregunta clave:**
```
¿Fue eliminado porque era innecesario?
o
¿Fue eliminado por error?
```

**Consecuencias si la respuesta es incorrecta:**
```
Si Cocina lee RTDB (pedidos_para_reparto/)
Y Admin lee Firestore (orders collection)
Y no hay bridge
↓
CONSISTENCIA ROTA
```

---

## Investigación Requerida

### PASO 1: Verificar Eliminación

**Preguntas:**
- [ ] ¿Existe `firestoreRtdbBridgeService.js`?
- [ ] ¿Fue eliminado en qué commit?
- [ ] ¿Cuál fue la razón en el commit message?
- [ ] ¿Hay referencias al código eliminado?

**Comando:**
```bash
git log --all --full-history -- "*firestoreRtdbBridgeService*"
```

**Resultado esperado:**
```
commit XXX - "Remove firestoreRtdbBridgeService - no longer needed"
  → Explica qué lo reemplazó
```

---

### PASO 2: Buscar Reemplazo

**Preguntas:**
- [ ] ¿Existe algún otro mecanismo de sincronización?
- [ ] ¿Hay Cloud Functions que repliquen datos?
- [ ] ¿El Backend escribe directamente a ambas BD?

**Búsquedas:**
```bash
# Cloud Functions
grep -r "firestore()" functions/
grep -r "database().ref()" functions/

# Backend replication
grep -r "admin.firestore()" routes/
grep -r "admin.database()" routes/

# Trigger patterns
grep -r "onWrite\|onCreate" functions/index.js
```

**Resultado esperado:**
```
Si existe reemplazo → Documentar cuál es
Si NO existe → 🚨 RED FLAG 1
```

---

### PASO 3: Mapear Lecturas Actuales

**Pregunta:** ¿De dónde lee cada componente?

#### Admin Dashboard
```bash
# Buscar en panel.html
grep -n "firebase\|Firestore\|RTDB\|getReference\|collection\|doc" public/panel.html

# Resultado esperado:
- Si lee de Firestore: collection('orders')
- Si lee de RTDB: database().ref('pedidos/')
- Si lee de Backend: fetch('/api/admin/pedidos')
```

#### Cocina
```bash
# Buscar en cocina.html
grep -n "firebase\|Firestore\|RTDB\|getReference\|collection\|doc" public/cocina.html

# Resultado esperado:
- Si lee de Firestore: collection('orders')
- Si lee de RTDB: database().ref('pedidos/')
- Si lee de Backend: fetch('/api/admin/pedidos')
```

#### Driver (Android)
```bash
# Buscar listeners
grep -r "addValueEventListener" app/src/main/java/

# Resultado esperado:
- PedidoRepository: database().ref('pedidos_para_reparto/')
- DriverRepository: database().ref('repartidores_activos/')
- LocationRepository: database().ref('conductores_activos/')
```

---

### PASO 4: Diagrama Actual

**Completar esto basado en Paso 3:**

```
┌─────────────────────────────────────────────────┐
│            FLUJO DE DATOS ACTUAL                │
└─────────────────────────────────────────────────┘

Admin Panel
    ├─ Lee de: ?
    │   ├─ RTDB: pedidos/
    │   ├─ Firestore: orders
    │   └─ Backend: /api/admin
    │
    └─ Escribe a: ?
        ├─ RTDB: pedidos/
        ├─ Firestore: orders
        └─ Backend: /api/admin/pedidos

Cocina Panel
    ├─ Lee de: ?
    │   ├─ RTDB: pedidos/ + pedidos_en_camino/
    │   ├─ Firestore: orders
    │   └─ Backend: /api/cocina
    │
    └─ Escribe a: ?
        ├─ RTDB: pedidos/
        ├─ Firestore: orders
        └─ Backend: /api/admin/pedidos/:id/listo

Driver (Android)
    ├─ Lee de: ?
    │   ├─ RTDB: pedidos_para_reparto/
    │   ├─ Firestore: orders
    │   └─ Backend: /api/delivery
    │
    └─ Escribe a: ?
        ├─ RTDB: repartidores_activos/
        ├─ Firestore: drivers
        └─ Backend: /api/delivery/accept

Backend
    ├─ Lee de: ?
    │   ├─ RTDB: repartidores_activos/ (GPS)
    │   ├─ Firestore: (?)
    │   └─ Validaciones internas
    │
    ├─ Escribe a: ?
    │   ├─ RTDB: pedidos/, pedidos_para_reparto/, pedidos_en_camino/
    │   ├─ RTDB: repartidores/$uid/capital
    │   ├─ Firestore: orders, liquidations
    │   └─ Transacciones atómicas
    │
    └─ Replica a: ?
        ├─ Cloud Functions: ? → ?
        └─ Triggers: ?

Sincronización
    ├─ RTDB → Firestore: ?
    │   └─ Mecanismo: (Cloud Function / Backend / Manual)
    │
    └─ Firestore → RTDB: ?
        └─ Mecanismo: (Cloud Function / Backend / Manual)
```

---

## Checklist de Auditoría

### ¿Existe alguna sincronización?

```
☐ Sí: Cloud Function en RTDB.onCreate → escribir Firestore
☐ Sí: Cloud Function en Firestore.onCreate → escribir RTDB
☐ Sí: Backend replicador que lee RTDB y escribe Firestore
☐ Sí: Backend que escribe ambas en misma transacción
☐ No: Sin sincronización (PELIGRO)
```

### ¿Si no hay sincronización, cómo funciona?

```
☐ Admin lee solo de Firestore (pedidos históricos)
☐ Cocina lee solo de RTDB (pedidos operativos)
☐ Backend es quien unifica (API single source)
☐ Ambos leen de Backend API (correcto)
☐ Sin consistencia garantizada (PELIGRO)
```

### ¿Hay Cloud Functions activas?

**Buscar en `functions/index.js`:**

```bash
grep -n "database().ref" functions/index.js | head -20
```

**Resultado esperado:**
```
Línea X: .onWrite → hacer Z
Línea Y: .onCreate → hacer W
...
```

Si hay triggers:
- [ ] ¿Escriben a Firestore?
- [ ] ¿Hay delays?
- [ ] ¿Hay error handling?
- [ ] ¿Se propagan excepciones?

---

## Riesgos Identificados

### 🚨 RIESGO A: Sin Bridge Y Lecturas Diferentes

**Escenario:**
```
Admin ejecuta: "mostrar todos los pedidos"
    → Query: Firestore collection('orders')
    
Cocina ejecuta: "mostrar pendientes"
    → Query: RTDB ref('pedidos/')
    
Si están desincronizadas:
    Admin ve: 50 pedidos
    Cocina ve: 30 pedidos
    
Resultado: INCONSISTENCIA
```

**Solución (elegir UNA):**
1. **Ambos leen de Backend:** Backend es fuente única
2. **Ambos leen de RTDB:** Firestore solo para histórico
3. **Bridge automático:** Cloud Function mantiene sync

---

### 🚨 RIESGO B: Pérdida de Histórico

**Escenario:**
```
Si solo RTDB está activo y Firestore está vacío:
    → No hay auditoría
    → No hay histórico
    → RTDB se limpia
    → Datos perdidos
```

**Validación requerida:**
- [ ] ¿RTDB tiene rotación de datos?
- [ ] ¿A dónde van los pedidos entregados?
- [ ] ¿Se archivan en Firestore?
- [ ] ¿Hay jobs de limpieza?

---

### 🚨 RIESGO C: Transacciones Parciales

**Escenario:**
```
Backend ejecuta:
    1. Escribe a RTDB ✓
    2. Escribe a Firestore ✗ (error)

Resultado:
    RTDB actualizado
    Firestore desactualizado
    INCONSISTENCIA
```

**Validación requerida:**
```bash
# Buscar transacciones atómicas en Backend
grep -A 20 "admin.database().ref" routes/*.js | grep -A 15 "set\|update"
```

---

## Plantilla de Hallazgos

Completar después de investigar:

```markdown
# BRIDGE AUDIT — HALLAZGOS

## 1. Existencia de Bridge
☐ Existe actualmente
☐ Fue eliminado en: [COMMIT]
☐ Razón de eliminación: [MENSAJE]

## 2. Reemplazo
- Cloud Functions: [SÍ/NO] - Explicar
- Backend replicador: [SÍ/NO] - Explicar
- Sin reemplazo: [SÍ/NO] - PELIGRO

## 3. Consistencia
- Admin lee de: [RTDB/Firestore/Backend]
- Cocina lee de: [RTDB/Firestore/Backend]
- ¿Son iguales? [SÍ/NO]

## 4. Sincronización
- De RTDB → Firestore: [AUTOMÁTICO/MANUAL/NINGUNO]
- De Firestore → RTDB: [AUTOMÁTICO/MANUAL/NINGUNO]
- Delays: [X segundos]

## 5. Riesgos
- [ ] Sin consistencia
- [ ] Pérdida de histórico
- [ ] Transacciones parciales
- [ ] Escalabilidad (listeners infinitos)

## 6. Recomendación
[DECISIÓN ARQUITECTÓNICA]
```

---

## Acción Requerida

**Si encuentras NO BRIDGE y LECTURAS DIFERENTES:**

```
PARAR TODO

Esta es la causa raíz de la inconsistencia Cocina ↔ Admin

Soluciones (en orden de preferencia):

1. Backend como fuente única
   - Admin: fetch /api/admin/pedidos
   - Cocina: fetch /api/admin/pedidos?status=listo
   - Driver: fetch /api/delivery/available
   
2. RTDB como operativo, Firestore como histórico
   - Admin: lee de RTDB (operativo)
   - Cocina: lee de RTDB (operativo)
   - Backend archiva a Firestore (async)
   
3. Cloud Function replicador
   - Trigger: RTDB.onWrite('pedidos/')
   - Acción: Replicate to Firestore.doc('orders/')
   - Delay: < 1 segundo
```

---

## Deadline

Este audit DEBE completarse antes de FASE 2B.

Porque la arquitectura de datos es el fundamento.

Sin ello, no se puede escalar.
