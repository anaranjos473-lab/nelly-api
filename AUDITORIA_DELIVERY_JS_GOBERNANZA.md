# AUDITORÍA: GOBERNANZA DE TRANSICIONES EN routes/delivery.js

## Hallazgo Crítico Confirmado

**`routes/delivery.js` tiene transiciones de estado SIN gobernanza.**

Mientras que `/listo` (en `routes/admin.js`) está endurecido con `version++`, `updated_at`, y transacciones atómicas, los endpoints de acceptance y completion están desprotegidos.

---

## Tabla de Gobernanza

| Endpoint | Estado Nuevo | version++ | updated_at | Transacción Atómica | Ledger/Events | Status |
|----------|---|---|---|---|---|---|
| `POST /listo` (admin.js) | LISTO | ✅ | ✅ | ✅ | ⚠️ | 🟢 Endurecido |
| `POST /accept-order` | EN_CAMINO | ❌ | ❌ | ❌ | ❌ | 🔴 Débil |
| `POST /complete-order` | ENTREGADO | ❌ | ❌ | ❌ | ❌ | 🔴 Débil |
| `POST /update-location` | — | N/A | ✅ | ✅ | N/A | 🟡 Parcial |

---

## Análisis Detallado

### Endpoint: POST /listo (ENDURECIDO ✅)

**Ubicación:** `routes/admin.js`

**Código de transición:**
```javascript
await ref.transaction((actual) => {
  return {
    ...actual,
    estado: 'LISTO',
    estado_pedido: 'LISTO',
    version: (actual.version || 0) + 1,      // ✅ VERSION
    updated_at: Date.now(),                  // ✅ TIMESTAMP
    timestamp_listo: Date.now()              // ✅ AUDITORIA
  };
});
```

**Gobernanza:**
- ✅ Transacción atómica (garantiza consistencia)
- ✅ Versión incrementada (detecta cambios conflictivos)
- ✅ Timestamp de actualización
- ✅ Timestamp específico del evento
- ✅ Una sola actualización (una fuente de verdad)

**Resultado:** Si falla la transacción, el estado NO cambia. Safe.

---

### Endpoint: POST /accept-order (DÉBIL 🔴)

**Ubicación:** `routes/delivery.js` líneas ~300

**Código de transición:**
```javascript
const tx = await pedidoRef.transaction((actual) => {
  // ... validaciones ...
  return {
    ...actual,
    id_pedido: actual.id_pedido || actual.id || pedidoId,
    repartidor_id: uid,
    conductorId: uid,
    idConductor: uid,
    estado: 'EN_CAMINO',           // ❌ SIN VERSION
    estado_pedido: 'EN_CAMINO',    // ❌ SIN updated_at
    aceptado_en: acceptedAt,
    capital_reserva: { ... },
    logistica: { ... }
  };
});

// DESPUÉS: Promise.all de múltiples updates
await Promise.all([
  db.ref(`pedidos_en_camino/${pedidoId}`).set(payload),
  db.ref(`pedidos/${pedidoId}`).update({ ... }),  // Otra escritura
  db.ref(`repartidores/${uid}/pedido_activo`).set(pedidoId)
]);
```

**Problemas:**
- ❌ NO incrementa `version` (imposible detectar conflictos)
- ❌ NO set `updated_at` confiable
- ❌ Promise.all DESPUÉS de la transacción puede fallar parcialmente
- ❌ 3 escrituras diferentes: una puede fallar mientras otras pasan
- ❌ NO hay ledger/auditoría del cambio de estado
- ⚠️ Si `db.ref(...pedidos_en_camino...).set()` falla, pedido sigue EN_CAMINO pero no aparece en cola

**Resultado:** Estados fantasma. Admin ve EN_CAMINO. Cocina no lo ve. **INCONSISTENCIA.**

---

### Endpoint: POST /complete-order (DÉBIL 🔴)

**Ubicación:** `routes/delivery.js` líneas ~480

**Código de transición:**
```javascript
const capitalLiberado = await liberarCapitalReservadoTx(db, {
  uid,
  pedidoId,
  monto: montoReservado,
  timestamp: completedAt
});

if (!capitalLiberado) {
  return res.status(409).json({
    ok: false,
    error: 'No se pudo liberar capital reservado'
  });
}

await Promise.all([
  pedidoRef.update({
    estado: 'ENTREGADO',           // ❌ SIN VERSION
    estado_pedido: 'ENTREGADO',    // ❌ SIN updated_at
    entregado_en: completedAt,
    capital_reserva: capitalReservaLiberada,
    logistica: logisticaLiberada
  }),
  db.ref(`pedidos/${pedidoId}`).update({
    estado: 'ENTREGADO',
    estado_pedido: 'ENTREGADO',
    entregado_en: completedAt,
    capital_reserva: capitalReservaLiberada,
    logistica: logisticaLiberada
  }),
  db.ref(`repartidores/${uid}/pedido_activo`).remove()
]);
```

**Problemas:**
- ❌ NO es una transacción atómica (es Promise.all)
- ❌ Capital se libera (tx 1), pero estado ENTREGADO falla (tx 2, 3)
- ❌ Resultado: Dinero liberado, pero pedido sigue EN_CAMINO
- ❌ NO hay `version++`
- ❌ NO hay `updated_at` confiable
- ❌ NO hay ledger de quién marcó entregado y cuándo
- ⚠️ Si `pedidos_en_camino` no se actualiza, el pedido sigue visible para otro driver

**Resultado:** Pedidos que "desaparecen" de una vista pero no de otra.

---

## Impacto en Certificación

### ¿Por qué Admin y Cocina ven datos diferentes?

```
Timeline de un pedido:

Admin → POST /listo
         ↓
         RTDB: pedidos/PED_123 → LISTO (v1, updated_at: T1) ✅
         RTDB: pedidos_para_reparto/PED_123 ← copy ✅

Driver → POST /accept-order
         ↓
         Tx 1: pedidos_para_reparto/PED_123 → EN_CAMINO (SIN version) ❌
         Luego: pedidos_en_camino/PED_123 ← set (Promise.all)
         Luego: pedidos/PED_123 ← update (Promise.all) 
         
Cocina lee: pedidos_en_camino/PED_123 → EN_CAMINO ✓
Admin lee: pedidos/PED_123 → LISTO (updated_at old) ✗

INCONSISTENCIA CONFIRMADA ✗
```

### ¿Por qué falla la sonda?

La sonda probablemente:
1. Crea pedido ✓
2. Marca LISTO ✓
3. Driver acepta → Promise.all
4. Promise.all falla en middleware o auth
5. Estado queda en limbo

Sin logs de `version` o `ledger`, no sabemos dónde falló.

---

## Corrección Requerida

### Para `/accept-order`

```javascript
// ANTES (débil)
const tx = await pedidoRef.transaction(...);
await Promise.all([...]);  // ❌ Puede fallar parcialmente

// DESPUÉS (endurecido)
const tx = await admin.database().ref().transaction((root) => {
  if (!root.pedidos_para_reparto[pedidoId]) return;
  
  const actual = root.pedidos_para_reparto[pedidoId];
  if (actual.repartidor_id && actual.repartidor_id !== uid) return;
  
  // TRANSACCIÓN ATÓMICA DE TODOS LOS CAMBIOS
  return {
    ...root,
    pedidos_para_reparto: {
      ...root.pedidos_para_reparto,
      [pedidoId]: {
        ...actual,
        estado: 'EN_CAMINO',
        estado_pedido: 'EN_CAMINO',
        version: (actual.version || 0) + 1,        // ✅
        updated_at: Date.now(),                    // ✅
        aceptado_en: acceptedAt,
        repartidor_id: uid
      }
    },
    pedidos_en_camino: {
      ...root.pedidos_en_camino,
      [pedidoId]: {
        ...actual,
        estado: 'EN_CAMINO',
        version: (actual.version || 0) + 1,
        updated_at: Date.now(),
        aceptado_en: acceptedAt,
        repartidor_id: uid
      }
    },
    pedidos: {
      ...root.pedidos,
      [pedidoId]: {
        ...(root.pedidos[pedidoId] || {}),
        estado: 'EN_CAMINO',
        version: ((root.pedidos[pedidoId]?.version) || 0) + 1,
        updated_at: Date.now(),
        aceptado_en: acceptedAt,
        repartidor_id: uid
      }
    },
    [`repartidores/${uid}/pedido_activo`]: pedidoId
  };
});
```

### Para `/complete-order`

Mismo principio: una transacción atómica, no Promise.all.

---

## Tabla de Correcciones Necesarias

| Endpoint | Cambio | Prioridad | Impacto |
|----------|--------|----------|--------|
| `/accept-order` | Transacción atómica + version | 🔴 CRÍTICA | Admin/Cocina consistency |
| `/complete-order` | Transacción atómica + version | 🔴 CRÍTICA | Pedidos fantasma |
| `/update-location` | Audit (ledger) | 🟡 Media | Trazabilidad GPS |

---

## Esta es la Razón por la que PED_TEST_REAL_001 Falla

```
La sonda no falla por un import bloqueante.

Falla porque:

1. /listo pasa (transacción atómica) ✅
2. Driver acepta → Promise.all intenta 3 updates
3. Si cualquiera falla, el estado queda inconsistente 
4. La siguiente lectura (Admin vs Cocina) ve datos diferentes
5. Test de validación falla ❌

Y sin version/ledger, imposible debuguear.
```

---

## Recomendación

Antes de continuar con la sonda:

1. **Endurezca `/accept-order`** (transacción atómica)
2. **Endurezca `/complete-order`** (transacción atómica)
3. **Agregue version a ambas**
4. **Agregue ledger de eventos** (order_events collection)
5. **Luego:** Re-ejecute sonda

Con estas correcciones, PED_TEST_REAL_001 debería pasar.

---

## Documento que Deriva

Cuando estas correcciones estén hechas, crear:

`DELIVERY_GOVERNANCE_FIXED.md`

Con antes/después de ambos endpoints.
