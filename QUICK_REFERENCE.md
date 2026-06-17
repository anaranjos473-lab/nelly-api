# QUICK REFERENCE — Semana Crítica Nelly

## TL;DR: Los Puntos

| # | Punto | Cuándo | Duración | Estado |
|---|-------|--------|----------|--------|
| 1 | Certificar PED_TEST_REAL_001 | Mañana 10:00 | 30 min | ⏳ |
| 2 | Auditar Firestore ↔ RTDB | Mañana 11:00 | 2-3h | ⏳ |
| 3 | DATA_FLOW_MATRIX | Miércoles | 3-4h | ⏳ |
| 4 | Limpiar dataset | Miércoles | 1-2h | ⏳ |
| 5 | Congelar arquitectura | Viernes | 1h | ⏳ |

---

## Mañana: PASO A PASO (10:00-10:30)

```
10:00  Admin crea           [POST /api/admin/pedidos]
       ✓ Resultado: pedidos/PED_TEST_REAL_001

10:05  Cocina marca listo   [POST /api/admin/pedidos/:id/listo]
       ✓ Resultado: pedidos_para_reparto/PED_TEST_REAL_001

10:10  Driver abre app
       ✓ Resultado: Ve pedido en Misiones Activas

10:15  Driver acepta        [POST /api/delivery/accept/:id]
       ✓ Resultado: pedidos_en_camino/ + capital reservado

10:18  GPS reporta          [POST /api/driver/update-location]
       ✓ Resultado: conductores_activos/ actualizado

10:20  Driver entrega       [POST /api/delivery/complete/:id]
       ✓ Resultado: estado = "entregado"

10:25  Admin verifica
       ✓ Resultado: histórico registrado

10:30  DECISIÓN
       ✅ Si todo pasó → PUNTO 1 COMPLETADO
       ❌ Si algo falló → DEBUG hasta pasar
```

**GO/NO-GO:**
```
✓ Admin lo creó?       → Sí
✓ Driver lo recibió?   → Sí
✓ Driver lo entregó?   → Sí
✓ Admin lo vio?        → Sí
↓
FASE 1 CERTIFICADA
```

---

## Riesgo #1: Bridge Firestore ↔ RTDB

**Pregunta:** ¿Fue eliminado el bridge o reemplazado?

**Impacto si NO existe y lecturas son diferentes:**
```
Admin: Firestore
Cocina: RTDB
Driver: RTDB
↓
INCONSISTENCIA TOTAL
```

**Investigar:**
```bash
git log --all --full-history -- "*firestoreRtdbBridgeService*"
grep -r "firestore()" functions/
grep -r "admin.database()" routes/
```

---

## Riesgo #2: Pedidos Duplicados

**Síntoma:** PED_1781 aparece 2 veces

**Posibles causas:**
1. ID truncado (se muestra incompleto)
2. Render duplicado en UI
3. Múltiples listeners escribiendo

**Validar:**
```bash
# En RTDB console: ¿Cuántas instancias reales de PED_1781?
# En código: ¿Cuántos listeners en pedidos_para_reparto/?
```

---

## Riesgo #3: Datos Contaminados

**Síntoma:** AUTO_*, TEST_*, LIVE_, PED_* todo junto

**Solución:** Separar ambientes

```
QA:        TEST_*, AUTO_*    → nelly-qa
STAGING:   STAGING_*         → nelly-staging
PROD:      PED_*             → nelly-delivery
```

---

## Decisión Arquitectónica

**Fuente única de verdad:**

```
Backend = Único escritor

RTDB = Operativo (real-time)
Firestore = Histórico (replica async)
Driver = Consumidor

Si Admin y Cocina leen desde Backend API
→ Consistencia garantizada
```

---

## Documentos a Leer HOY

1. [`MANANA_PLAN_ACCION.md`](./MANANA_PLAN_ACCION.md) — Para mañana 09:50
2. [`FIRESTORE_RTDB_BRIDGE_AUDIT.md`](./FIRESTORE_RTDB_BRIDGE_AUDIT.md) — Para investigar
3. [`DATA_FLOW_MATRIX_TEMPLATE.md`](./DATA_FLOW_MATRIX_TEMPLATE.md) — Para mapear
4. [`PLAN_EJECUTIVO_SEMANA.md`](./PLAN_EJECUTIVO_SEMANA.md) — Timeline completo

---

## Evaluación Actual

| Componente | % | Blocker |
|-----------|---|---------|
| NellyDriver | 90% | ✅ No |
| Cocina | 95% | ✅ No |
| Admin | 70% | 🚨 **SÍ** |

**Cuello de botella:** Admin Dashboard = múltiples fuentes de datos

---

## Semana Resumida

```
Lunes  (17) ✅ Documentación preparada
Martes (18) ⏳ PUNTO 1-2: Certificar + Auditar (3-4h)
Miérco (19) ⏳ PUNTO 3-4: Matriz + Limpieza (5-6h)
Jueves (20) ⏳ Resolver red flags
Viernes(21) ⏳ PUNTO 5: Congelar arquitectura
```

---

## NO Hacer

```
❌ Asignación automática
❌ IA
❌ Antifraude avanzado
❌ Nuevos dashboards
❌ Nuevas funciones
```

**Razón:** Primero: base sólida. Después: features.

---

## Éxito = Cumplir los 5 Puntos

```
════════════════════════════════════════════════════════════
SEMANA COMPLETADA
↓
Nelly pasa de Proyecto a Plataforma Logística Escalable
════════════════════════════════════════════════════════════
```

---

## Comandos Útiles

```bash
# Ver bridge Firestore histórico
git log --all --full-history -- "*Bridge*"

# Buscar reemplazo
grep -r "firestore()" functions/ routes/

# Auditar listeners
grep -r "addValueEventListener" app/

# Ver qué lee Admin
grep -n "firebase\|getReference\|collection" public/panel.html

# Ver qué lee Cocina
grep -n "firebase\|getReference\|collection" public/cocina.html
```

---

## Contacto Rápido

**Si necesitas aclaración:**
- Revisar [`EVALUACION_CRITICA_JUN17.md`](./EVALUACION_CRITICA_JUN17.md)
- Revisar [`PLAN_EJECUTIVO_SEMANA.md`](./PLAN_EJECUTIVO_SEMANA.md)

**Si necesitas paso a paso mañana:**
- Abrir [`MANANA_PLAN_ACCION.md`](./MANANA_PLAN_ACCION.md) a las 09:50

**Si algo falla:**
- No continuar con otros puntos
- Debuguear hasta que pase
- Esto es el fundamento

---

## Pregunta Clave

```
¿Por qué no agregar funciones esta semana?

Respuesta:

Porque la base no es sólida.

Cocina ve unos datos, Admin ve otros.

Eso es síntoma de arquitectura débil.

Nuevas funciones sobre base débil =
    → Deuda técnica exponencial
    → Imposible escalar
    → Los bugs se multiplican

Solución:

1. Validar que todos ven los mismos datos
2. Mapear exactamente cómo fluyen
3. Eliminar duplicaciones
4. Congelar la arquitectura

DESPUÉS: Agregar funciones con seguridad
```

---

## Estado Actual: Commit 74df27f

```
f5ee5b9  PHASE 1 fixes (driver sync)
35c9b09  PHASE 2 Strategy
88bf86d  Project Status
74df27f  Critical Audit (TODAY)
```

**Siguientes commits (esta semana):**
```
XXX      POINT 1: Certified (mañana)
XXX      POINT 2: Bridge Audit (mañana)
XXX      POINT 3: DATA_FLOW_MATRIX (miércoles)
XXX      POINT 4: Dataset Clean (miércoles)
XXX      POINT 5: Architecture Frozen (viernes)
```
