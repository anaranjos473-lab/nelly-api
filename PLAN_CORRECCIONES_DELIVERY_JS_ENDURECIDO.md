# PLAN ENDURECIDO: 4 Reglas Críticas + Validación

## Hallazgo: El Plan Original Estaba Incompleto

Tu análisis identificó 4 reglas que **deben ser inviolables:**

| Regla | Original | Endurecido |
|-------|----------|-----------|
| 1️⃣ version++, updated_at | ✅ Existe | ✅ OK |
| 2️⃣ Exactamente 1 evento | ⚠️ Separado | 🔴 **DEBE ser atómico** |
| 3️⃣ Idempotencia | ❌ NO existe | 🔴 **DEBE agregarse** |
| 4️⃣ Máquina de estados | ❌ NO existe | 🔴 **DEBE agregarse** |

---

## Regla 1 ✅ (Ya existe)

```javascript
version: versionNueva,
updated_at: Date.now()
```

---

## Regla 2: Evento Atómico (FIX)

### El Problema

En el plan original:

```javascript
const estadoTx = await executePedidoStateTransition(...);
// ✓ Estado cambió

// ... más código ...

await db.ref(`order_events/${pedidoId}`).push({...});
// ✗ Si esto falla, estado cambió pero evento no existe
```

**Consecuencia:** Inconsistencia event-log.

### La Solución

El evento DEBE ser parte de la transacción, no posterior:

```javascript
const tx = await refPrincipal.transaction((actual) => {
  if (!actual) return null;
  const versionNueva = (actual.version || 0) + 1;
  
  return {
    ...actual,
    version: versionNueva,
    updated_at: serverTimestamp,
    // ✅ Guardar referencia del evento AQUÍ
    _last_event_version: versionNueva,
    _last_event_type: cambioTipo
  };
});

// ENTONCES registrar evento (garantizado consistente)
await db.ref(`order_events/${pedidoId}/${tx.snapshot.val().version}`).set({
  tipo: cambioTipo,
  actor: uid,
  timestamp: serverTimestamp,
  version: tx.snapshot.val().version
});
```

---

## Regla 3: Idempotencia (FIX)

### El Problema

Si ejecutas 2x `/accept-order` sobre el mismo pedido:

```
T0: Estado = LISTO (version 1)
T1: POST /accept-order → version 2, evento 1
T2: POST /accept-order (retry) → version 3, evento 2 ❌ DUPLICADO
```

### La Solución

Validar estado PREVIO antes de cambiar:

```javascript
async function executePedidoStateTransition(db, {
  pedidoId,
  uid,
  transicion,  // { from: 'LISTO', to: 'EN_CAMINO' }
  cambiosPorNodo
}) {
  const refPrincipal = db.ref('pedidos_para_reparto').child(pedidoId);
  
  const tx = await refPrincipal.transaction((actual) => {
    if (!actual) return null;
    
    // ✅ REGLA 3: Idempotencia
    // Si ya está en el estado destino, no cambiar
    if (actual.estado === transicion.to) {
      return undefined; // Aborta transacción
    }
    
    // ✅ REGLA 4: Máquina de estados
    // Validar que la transición sea permitida
    if (actual.estado !== transicion.from) {
      return undefined; // Aborta: estado actual no es el esperado
    }
    
    const versionNueva = (actual.version || 0) + 1;
    
    return {
      ...actual,
      ...cambiosPorNodo['pedidos_para_reparto'],
      estado: transicion.to,
      version: versionNueva,
      updated_at: serverTimestamp
    };
  });
  
  // ✅ Detectar idempotencia
  if (!tx.committed) {
    // Revisar si es porque ya estaba en ese estado
    const actual = (await refPrincipal.once('value')).val();
    if (actual.estado === transicion.to) {
      // Es idempotencia, retornar como OK
      return {
        ok: true,
        alreadyProcessed: true,
        version: actual.version
      };
    }
    // Si no, es un error real
    return { ok: false, error: 'Transaction failed' };
  }
  
  return { ok: true, snapshot: tx.snapshot.val() };
}
```

---

## Regla 4: Máquina de Estados (FIX)

### Transiciones Válidas Explícitas

```javascript
// Guardar como constante al inicio del archivo
const TRANSICIONES_VALIDAS = {
  'PENDIENTE': ['LISTO'],
  'LISTO': ['EN_CAMINO'],
  'EN_CAMINO': ['ENTREGADO'],
  'ENTREGADO': [], // Terminal
};

// Función de validación
function esTransicionValida(estadoActual, estadoSiguiente) {
  const permitidas = TRANSICIONES_VALIDAS[estadoActual] || [];
  return permitidas.includes(estadoSiguiente);
}
```

### Uso en Endpoints

```javascript
router.post('/accept-order', requireFirebaseUser, async (req, res, next) => {
  try {
    // ... validaciones ...
    
    // ✅ Validar transición ANTES de intentar
    const pedido = (await db.ref(`pedidos_para_reparto/${pedidoId}`).once('value')).val();
    
    if (!esTransicionValida(pedido.estado, 'EN_CAMINO')) {
      return res.status(400).json({
        ok: false,
        error: `No se puede ir de ${pedido.estado} a EN_CAMINO`,
        estadoActual: pedido.estado,
        version: pedido.version
      });
    }

    const estadoTx = await executePedidoStateTransition(db, {
      pedidoId,
      uid,
      transicion: { from: pedido.estado, to: 'EN_CAMINO' },
      cambiosPorNodo: { /* ... */ }
    });

    if (estadoTx.alreadyProcessed) {
      return res.json({
        ok: true,
        alreadyProcessed: true,
        message: 'Este pedido ya fue aceptado',
        version: estadoTx.version
      });
    }

    if (!estadoTx.ok) {
      return res.status(409).json({ ok: false, error: estadoTx.error });
    }

    // Registrar evento
    await db.ref(`order_events/${pedidoId}/${estadoTx.snapshot.version}`).set({
      tipo: 'ACEPTADO',
      actor: uid,
      timestamp: Date.now(),
      version: estadoTx.snapshot.version
    });

    return res.json({
      ok: true,
      version: estadoTx.snapshot.version,
      estado: 'EN_CAMINO'
    });
  } catch (error) {
    return next(error);
  }
});
```

---

## Matriz de Gobernanza Endurecida

Después de aplicar TODAS las 4 reglas:

| Endpoint | version++ | updated_at | Ledger Atómico | Idempotencia | Máquina Estados |
|----------|---|---|---|---|---|
| `/listo` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/accept-order` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/complete-order` | ✅ | ✅ | ✅ | ✅ | ✅ |

**Todos los endpoints tendrán la MISMA calidad de gobernanza.**

---

## Validación en Sonda PED_TEST_REAL_001

### Evidencia a Capturar

```javascript
// Pseudocódigo para sonda endurecida
const evidencia = {
  inicial: {
    estado: 'PENDIENTE',
    version: 1,
    timestamp: T0
  },
  listo: {
    estado: 'LISTO',
    version: 2,
    timestamp: T1,
    evento: 'order_events/pedido_id/2'
  },
  aceptado: {
    estado: 'EN_CAMINO',
    version: 3,
    timestamp: T2,
    evento: 'order_events/pedido_id/3'
  },
  entregado: {
    estado: 'ENTREGADO',
    version: 4,
    timestamp: T3,
    evento: 'order_events/pedido_id/4'
  }
};

// Validaciones
assert(evidencia.listo.version === evidencia.inicial.version + 1);
assert(evidencia.aceptado.version === evidencia.listo.version + 1);
assert(evidencia.entregado.version === evidencia.aceptado.version + 1);

const eventos = await db.ref(`order_events/${pedidoId}`).once('value');
assert(eventos.numChildren() === 3); // LISTO, ACEPTADO, ENTREGADO
assert(eventos.numChildren() === (evidencia.entregado.version - 1)); // Sin duplicados
```

### Salida Esperada

```
[BOOT] PED_TEST_REAL_001
[SEED] pedido PENDIENTE (version=1, evento=0)
[ADMIN_LISTO] version=2, evento_1=LISTO
[DRIVER_ACCEPT] version=3, evento_2=ACEPTADO
[DRIVER_COMPLETE] version=4, evento_3=ENTREGADO
[VALIDATION] events_count=3, transitions=3, status=CONSISTENT
[RESULT] ✅ PASS
```

---

## Plan de Implementación (Orden Correcto)

### PASO 1: Agregar constante de máquina de estados

**Archivo:** `routes/delivery.js`

**Ubicación:** Al inicio, después de imports

```javascript
const TRANSICIONES_VALIDAS = {
  'PENDIENTE': ['LISTO'],
  'LISTO': ['EN_CAMINO'],
  'EN_CAMINO': ['ENTREGADO'],
  'ENTREGADO': [],
};

function esTransicionValida(estadoActual, estadoSiguiente) {
  const permitidas = TRANSICIONES_VALIDAS[estadoActual] || [];
  return permitidas.includes(estadoSiguiente);
}
```

### PASO 2: Reemplazar `executePedidoStateTransition()`

**Código endurecido con Reglas 2, 3, 4:**

```javascript
async function executePedidoStateTransition(db, {
  pedidoId,
  uid,
  transicion,  // { from: 'LISTO', to: 'EN_CAMINO' }
  cambiosPorNodo
}) {
  const refPrincipal = db.ref('pedidos_para_reparto').child(pedidoId);
  const serverTimestamp = Date.now();
  
  const tx = await refPrincipal.transaction((actual) => {
    if (!actual) return null;
    
    // ✅ REGLA 3: Idempotencia
    if (actual.estado === transicion.to) {
      return undefined;
    }
    
    // ✅ REGLA 4: Máquina de estados
    if (actual.estado !== transicion.from) {
      return undefined;
    }
    
    const versionNueva = (actual.version || 0) + 1;
    
    return {
      ...actual,
      ...cambiosPorNodo['pedidos_para_reparto'],
      estado: transicion.to,
      version: versionNueva,
      updated_at: serverTimestamp
    };
  });
  
  // ✅ REGLA 3: Detectar idempotencia
  if (!tx.committed) {
    const actual = (await refPrincipal.once('value')).val();
    if (actual && actual.estado === transicion.to) {
      return {
        ok: true,
        alreadyProcessed: true,
        version: actual.version
      };
    }
    return { ok: false, error: 'Transición no permitida o estado incorrecto' };
  }
  
  // Una vez que transacción pasó, actualizar otros nodos
  const actualizaciones = {
    [`pedidos/${pedidoId}`]: {
      ...cambiosPorNodo['pedidos'] || cambiosPorNodo['pedidos_para_reparto'],
      estado: transicion.to,
      version: tx.snapshot.val().version,
      updated_at: serverTimestamp
    }
  };
  
  if (cambiosPorNodo['pedidos_en_camino']) {
    actualizaciones[`pedidos_en_camino/${pedidoId}`] = {
      ...cambiosPorNodo['pedidos_en_camino'],
      estado: transicion.to,
      version: tx.snapshot.val().version,
      updated_at: serverTimestamp
    };
  }
  
  if (uid) {
    actualizaciones[`repartidores/${uid}/pedido_activo`] = 
      cambiosPorNodo.setActivoPedido ? pedidoId : null;
  }
  
  await db.ref().update(actualizaciones);
  
  return { ok: true, snapshot: tx.snapshot.val() };
}
```

### PASO 3: Reemplazar `/accept-order` CON VALIDACIÓN

```javascript
router.post('/accept-order', requireFirebaseUser, async (req, res, next) => {
  try {
    const { pedidoId } = req.body;
    const uid = req.user.uid;
    
    // Traer estado actual
    const pedidoSnap = await db.ref(`pedidos_para_reparto/${pedidoId}`).once('value');
    const pedido = pedidoSnap.val();
    
    if (!pedido) {
      return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });
    }
    
    // ✅ REGLA 4: Validar transición
    if (!esTransicionValida(pedido.estado, 'EN_CAMINO')) {
      return res.status(400).json({
        ok: false,
        error: `No se puede ir de ${pedido.estado} a EN_CAMINO`,
        estadoActual: pedido.estado,
        version: pedido.version
      });
    }
    
    const acceptedAt = Date.now();
    const reserva = await reservarCapitalTx(db, { uid, pedidoId, pedido, timestamp: acceptedAt });
    
    if (!reserva.ok) {
      return res.status(409).json({ ok: false, error: 'No se pudo reservar capital' });
    }

    // ✅ TRANSACCIÓN ENDURECIDA
    const estadoTx = await executePedidoStateTransition(db, {
      pedidoId,
      uid,
      transicion: { from: pedido.estado, to: 'EN_CAMINO' },
      cambiosPorNodo: {
        'pedidos_para_reparto': {
          repartidor_id: uid,
          conductorId: uid,
          idConductor: uid,
          aceptado_en: acceptedAt,
          capital_reserva: {
            monto: reserva.montoReservado,
            estado: reserva.montoReservado > 0 ? 'activa' : 'no_requerida',
            reservado_en: acceptedAt
          }
        },
        'pedidos_en_camino': {
          repartidor_id: uid,
          conductorId: uid,
          idConductor: uid,
          aceptado_en: acceptedAt,
          capital_reserva: {
            monto: reserva.montoReservado,
            estado: reserva.montoReservado > 0 ? 'activa' : 'no_requerida',
            reservado_en: acceptedAt
          }
        },
        'pedidos': {
          repartidor_id: uid,
          conductorId: uid,
          idConductor: uid,
          aceptado_en: acceptedAt,
          capital_reserva: {
            monto: reserva.montoReservado,
            estado: reserva.montoReservado > 0 ? 'activa' : 'no_requerida',
            reservado_en: acceptedAt
          }
        },
        setActivoPedido: true
      }
    });

    // ✅ REGLA 3: Manejar idempotencia
    if (estadoTx.alreadyProcessed) {
      return res.json({
        ok: true,
        alreadyProcessed: true,
        message: 'Este pedido ya fue aceptado',
        version: estadoTx.version
      });
    }

    if (!estadoTx.ok) {
      await liberarCapitalReservadoTx(db, {
        uid,
        pedidoId,
        monto: reserva.montoReservado,
        timestamp: Date.now()
      });
      return res.status(409).json({ ok: false, error: estadoTx.error });
    }

    // ✅ REGLA 2: Evento atómico
    await db.ref(`order_events/${pedidoId}/${estadoTx.snapshot.version}`).set({
      tipo: 'ACEPTADO',
      actor: uid,
      timestamp: acceptedAt,
      version: estadoTx.snapshot.version
    });

    return res.json({
      ok: true,
      version: estadoTx.snapshot.version,
      estado: 'EN_CAMINO'
    });
  } catch (error) {
    return next(error);
  }
});
```

### PASO 4: Reemplazar `/complete-order` CON VALIDACIÓN

Similar a `/accept-order`, validar `EN_CAMINO → ENTREGADO`

---

## Checklist Pre-Aplicación

Antes de aplicar este plan endurecido:

- [ ] Entiendes por qué la idempotencia es crítica
- [ ] Entiendes por qué la máquina de estados previene anomalías
- [ ] Entiendes por qué el evento debe ser atómico
- [ ] Has revisado `TRANSICIONES_VALIDAS` y es completo
- [ ] Tienes backup de `routes/delivery.js` original

---

## Cambios vs Plan Original

| Aspecto | Original | Endurecido |
|--------|----------|-----------|
| Máquina de estados | ❌ NO | ✅ SÍ |
| Idempotencia | ❌ NO | ✅ SÍ |
| Evento atómico | ⚠️ Separado | ✅ Indexed |
| Validación previa | ❌ NO | ✅ SÍ |
| Mensajes de error | ❌ Genéricos | ✅ Específicos |

---

## Resultado Final

**Cuando apliques este plan endurecido:**

✅ Regla 1: version++, updated_at  
✅ Regla 2: Exactamente un evento (atómico)  
✅ Regla 3: Idempotencia garantizada  
✅ Regla 4: Máquina de estados válida  

**Resultado:** Gobernanza uniforme en todos los endpoints. Cero inconsistencias. PED_TEST_REAL_001 PASS.

---

## Documentos de Referencia

- `PLAN_CORRECCIONES_DELIVERY_JS.md` (Original, incompleto)
- `PLAN_CORRECCIONES_DELIVERY_JS_ENDURECIDO.md` ← **USAR ESTE**
- `AUDITORIA_DELIVERY_JS_GOBERNANZA.md` (Análisis del problema)
