# SOURCE_OF_TRUTH — Fuente Única por Entidad

## Propósito

Definición inmutable de **quién es la autoridad oficial** para cada entidad en Nelly.

No ambigüedad. No réplicas de réplicas. Una fuente.

---

## Estado Actual: ❓ DESCONOCIDO

Este documento DEBE completarse después de PUNTO 2 (Auditoría Bridge).

---

## Entidad 1: Pedidos

### Pregunta
¿RTDB o Firestore es la verdad?

### Opciones

**Opción A: RTDB es verdad**
```
┌──────────────────────────────────────┐
│  RTDB: pedidos/                      │  ← VERDAD
├──────────────────────────────────────┤
│  Admin lee: RTDB                     │
│  Cocina lee: RTDB                    │
│  Driver lee: RTDB                    │
│  Firestore: Copia async (si existe)  │
└──────────────────────────────────────┘

Ventaja: Consistencia en vivo
Desventaja: Sin histórico persistente
```

**Opción B: Firestore es verdad**
```
┌──────────────────────────────────────┐
│  Firestore: orders collection        │  ← VERDAD
├──────────────────────────────────────┤
│  Admin lee: Firestore                │
│  Cocina lee: Firestore               │
│  Driver lee: RTDB (copia)            │
│  RTDB: Copia para real-time          │
└──────────────────────────────────────┘

Ventaja: Histórico persistente
Desventaja: Latencia en sincronización
```

**Opción C: Backend es verdad (recomendado)**
```
┌──────────────────────────────────────┐
│  Backend API                         │  ← VERDAD
├──────────────────────────────────────┤
│  Admin lee: /api/admin/pedidos       │
│  Cocina lee: /api/admin/pedidos      │
│  Driver lee: /api/delivery/available │
│  RTDB: Copia de Backend              │
│  Firestore: Histórico de Backend     │
└──────────────────────────────────────┘

Ventaja: Control, consistencia, auditoría
Desventaja: Latencia mínima en BD
```

### Decisión (Completar después de PUNTO 2)

```
Fuente oficial de Pedidos: [ RTDB / Firestore / Backend ]
```

**Justificación:**
```
[Explicar por qué se eligió esta]
```

**Implementación:**
```
Admin lee de:        [FUENTE]
Cocina lee de:       [FUENTE]
Driver lee de:       [FUENTE]
Sincronización:      [Mecanismo]
Bridge si existe:    [Sí/No]
```

---

## Entidad 2: Repartidores (Estado)

### Pregunta
¿RTDB o Firestore es la verdad para estado del repartidor?

### Opciones

**Opción A: RTDB es verdad**
```
repartidores/$uid/
├─ estado: "activo"
├─ ubicacion: {lat, lng}
├─ pedido_activo: "PED_123"
└─ ultimo_update: 1718XXXXX
```

**Opción B: Firestore es verdad**
```
drivers/{uid}/
├─ estado: "activo"
├─ ubicacion: {lat, lng}
├─ active_order: "PED_123"
└─ last_update: timestamp
```

### Decisión (Completar después de PUNTO 2)

```
Fuente oficial de Repartidores: [ RTDB / Firestore ]
```

**Justificación:**
```
[Explicar]
```

---

## Entidad 3: GPS en Vivo (conductores_activos)

### Pregunta
¿Dónde se almacenan ubicaciones reales?

### Opciones

**Opción A: RTDB solo**
```
conductores_activos/$uid/
├─ lat: 19.4326
├─ lng: -99.1332
├─ timestamp: 1718XXXXX
└─ accuracy: 5
```

**Opción B: RTDB + Firestore (replicado)**
```
RTDB real-time (write)
↓
Firestore async (histórico)
```

### Decisión (Completar después de PUNTO 2)

```
Fuente oficial de GPS: [ RTDB / Firestore / RTDB+Firestore ]
```

**Justificación:**
```
[Explicar]
```

---

## Entidad 4: Histórico de Pedidos

### Pregunta
¿RTDB o Firestore guarda el histórico?

### Decisión (Completar después de PUNTO 2)

```
Fuente oficial de Histórico: [ RTDB / Firestore ]
```

**Justificación:**
```
[Explicar]

Duración en RTDB: [X días / No se borra]
Copia en Firestore: [Sí / No]
Estructura: [Collection / Subcollection]
```

---

## Entidad 5: Liquidaciones

### Pregunta
¿RTDB o Firestore guarda liquidaciones?

### Decisión (Completar después de PUNTO 2)

```
Fuente oficial de Liquidaciones: [ RTDB / Firestore ]
```

**Justificación:**
```
[Explicar]
```

---

## Entidad 6: Métricas y Analytics

### Pregunta
¿Dónde se calculan métricas?

### Opciones

**Opción A: Firestore (append-only)**
```
metrics/{date}/
├─ pedidos_creados: N
├─ pedidos_entregados: N
├─ ingresos: $
└─ repartidores_activos: N
```

**Opción B: Backend (cálculo)**
```
GET /api/admin/metrics?date=2026-06-17
← Backend calcula en tiempo real
```

### Decisión (Completar después de PUNTO 2)

```
Fuente oficial de Métricas: [ Firestore / Backend ]
```

---

## Síntesis: Tabla Final

Completar esto después de PUNTO 2:

| Entidad | Fuente Oficial | Lectura desde | Escritura desde | Replicación | Lag |
|---------|---|---|---|---|---|
| Pedidos | ? | ? | ? | ? | ? |
| Repartidores | ? | ? | ? | ? | ? |
| GPS Vivo | ? | ? | ? | ? | ? |
| Histórico | ? | ? | ? | ? | ? |
| Liquidaciones | ? | ? | ? | ? | ? |
| Métricas | ? | ? | ? | ? | ? |

---

## Reglas que Derivan de Esto

### Regla #1: Escritura Única
```
Si RTDB es verdad para X:
  → Única fuente de escritura es Backend → RTDB
  → Firestore recibe copia (si existe)

Si Firestore es verdad para X:
  → Única fuente de escritura es Backend → Firestore
  → RTDB recibe copia (si existe)
```

### Regla #2: Consistencia
```
Todos los lectores de X deben leer de la misma fuente.

Nunca:
  Admin lee de Firestore
  Cocina lee de RTDB
  (Inconsistencia garantizada)
```

### Regla #3: Auditoría
```
Si Backend es la verdad:
  → Log de todas las escrituras
  → Timestamp de aceptación
  → Antes/después de cada cambio
```

---

## Documento Derivado: SYNC_STRATEGY.md

Después de completar SOURCE_OF_TRUTH.md, se debe crear:

```
SYNC_STRATEGY.md

RTDB → Firestore
  Mecanismo: [Cloud Function / Backend API / Manual]
  Trigger: [onWrite / Cron job / API call]
  Lag: [X segundos / X minutos]

Firestore → RTDB
  Mecanismo: [Cloud Function / Backend API / Manual]
  Trigger: [onCreate / Cron job / API call]
  Lag: [X segundos / X minutos]

Bridge existente:
  Ubicación: [Archivo]
  Status: [Activo / Inactivo / Eliminado]
  Alternativa: [Sí/No]
```

---

## Preguntas que Este Documento DEBE Responder

### Q1: ¿Cocina y Admin ven los mismos datos?
```
Antes de SOURCE_OF_TRUTH:  ❓ NO SABEMOS
Después de SOURCE_OF_TRUTH: ✅ SÍ GARANTIZADO
```

### Q2: ¿Si falla RTDB, qué sucede?
```
Si RTDB es verdad:         🔴 Operación parada
Si Firestore es verdad:    🟡 Delay en Driver
Si Backend es verdad:      🟢 Continúa operando
```

### Q3: ¿Si falla Firestore, qué sucede?
```
Si Firestore es solo copia: 🟢 Sin impacto operativo
Si Firestore es verdad:     🔴 Admin sin visibilidad
```

### Q4: ¿Puedo escalar a 10 ciudades sin cambios?
```
Sin SOURCE_OF_TRUTH: ❌ NO (conflictos inevitables)
Con SOURCE_OF_TRUTH: ✅ SÍ (arquitectura clara)
```

---

## Cuando SOURCE_OF_TRUTH Está Completo

```
════════════════════════════════════════════════════════════

Todo lo demás es implementación.

No habrá ambigüedades.
No habrá sorpresas en producción.
No habrá pedidos que desaparecen.

Solo: Operación clara y confiable.

════════════════════════════════════════════════════════════
```

---

## Timeline

**Completar después de:**
- ✅ PUNTO 1 (Certificar PED_TEST_REAL_001)
- ✅ PUNTO 2 (Auditar Firestore ↔ RTDB Bridge)

**Resultado esperado:**
- ✅ Tabla de fuentes por entidad
- ✅ Replicación definida
- ✅ Sincronización documentada

**Impacto:**
- ✅ Claridad total de arquitectura
- ✅ Fundamento para FASE 2B
- ✅ Preparación para escala

---

## Template de Respuesta

```markdown
# SOURCE_OF_TRUTH — Nelly Decisiones Arquitectónicas

## Pedidos
**Fuente oficial:** RTDB / Firestore / Backend
**Razón:** [Explicación]
**Lectura desde:** [Todos leen de aquí]
**Escritura desde:** [Solo Backend escribe aquí]
**Replicación:** [Mecanismo]

## Repartidores
**Fuente oficial:** ...

## GPS
**Fuente oficial:** ...

## Histórico
**Fuente oficial:** ...

## Liquidaciones
**Fuente oficial:** ...

## Métricas
**Fuente oficial:** ...

## Tabla Resumen
[Tabla completada]

## Reglas Derivadas
1. ...
2. ...
3. ...
```

---

## Nota Final

Este documento **NO es opinión**.

Es **declaración factual** de: Quién manda aquí.

Una vez que esté escrito y comprometido en Git:

Todos lo siguen. Sin excepciones.

Porque la alternativa es caos de datos.
