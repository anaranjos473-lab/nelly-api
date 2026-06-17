# PLAN INMEDIATO: Correcciones Críticas Antes de Sonda

## Situación

La auditoría confirmó: **`routes/delivery.js` tiene transiciones sin gobernanza.**

Esto explica por qué la sonda falla y por qué Admin/Cocina ven datos diferentes.

---

## Diagnóstico

| Componente | Status | Razón |
|-----------|--------|-------|
| `/listo` | ✅ Endurecido | Transacción atómica + version + timestamp |
| `/accept-order` | 🔴 Débil | Promise.all (falla parcial posible) |
| `/complete-order` | 🔴 Débil | Promise.all (falla parcial posible) |

**Consecuencia:** Estados fantasma. Datos inconsistentes.

---

## Pasos de Corrección (Orden de Ejecución)

### PASO 1: Crear función auxiliar para transacciones atómicas

**Archivo:** `routes/delivery.js`

**Ubicación:** Después de imports, antes de `router`

**Código:**

```javascript
// Transacción atómica multi-nodo que garantiza consistencia
async function executePedidoStateTransition(db, {
  pedidoId,
  uid,
  nuevoEstado,
  cambiosPorNodo // { 'pedidos_para_reparto': {...}, 'pedidos_en_camino': {...}, etc }
}) {
  const refPrincipal = db.ref('pedidos_para_reparto').child(pedidoId);
  
  const tx = await refPrincipal.transaction((actual) => {
    if (!actual) return null;
    
    // Actualizar version
    const versionNueva = (actual.version || 0) + 1;
    
    return {
      ...actual,
      ...cambiosPorNodo['pedidos_para_reparto'],
      version: versionNueva,
      updated_at: Date.now()
    };
  });
  
  if (!tx.committed) return { ok: false, error: 'Transaction failed' };
  
  // Una vez que la transacción principal pasó, hacer los updates
  // (garantizados de consistencia porque la versión pasó)
  const actualizaciones = {
    [`pedidos/${pedidoId}`]: {
      ...cambiosPorNodo['pedidos'] || cambiosPorNodo['pedidos_para_reparto'],
      version: tx.snapshot.val().version,
      updated_at: tx.snapshot.val().updated_at
    }
  };
  
  if (cambiosPorNodo['pedidos_en_camino']) {
    actualizaciones[`pedidos_en_camino/${pedidoId}`] = {
      ...cambiosPorNodo['pedidos_en_camino'],
      version: tx.snapshot.val().version,
      updated_at: tx.snapshot.val().updated_at
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

---

### PASO 2: Reemplazar `/accept-order`

**Ubicación:** `routes/delivery.js` líneas ~260

**Encontrar:** 
```javascript
router.post('/accept-order', requireFirebaseUser, async (req, res, next) => {
```

**Reemplazar la sección de transacción con:**

```javascript
router.post('/accept-order', requireFirebaseUser, async (req, res, next) => {
  try {
    // ... validaciones previas ...
    
    const acceptedAt = Date.now();
    const reserva = await reservarCapitalTx(db, { uid, pedidoId, pedido, timestamp: acceptedAt });
    
    if (!reserva.ok) {
      // ... error handling ...
    }

    // ✅ TRANSACCIÓN ATÓMICA
    const estadoTx = await executePedidoStateTransition(db, {
      pedidoId,
      uid,
      nuevoEstado: 'EN_CAMINO',
      cambiosPorNodo: {
        'pedidos_para_reparto': {
          estado: 'EN_CAMINO',
          estado_pedido: 'EN_CAMINO',
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
          estado: 'EN_CAMINO',
          estado_pedido: 'EN_CAMINO',
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
          estado: 'EN_CAMINO',
          estado_pedido: 'EN_CAMINO',
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

    if (!estadoTx.ok) {
      await liberarCapitalReservadoTx(db, {
        uid,
        pedidoId,
        monto: reserva.montoReservado,
        timestamp: Date.now()
      });
      return res.status(409).json({ ok: false, error: estadoTx.error });
    }

    // ✅ Registrar evento en ledger
    await db.ref(`order_events/${pedidoId}`).push({
      tipo: 'ACEPTADO',
      repartidor_id: uid,
      timestamp: acceptedAt,
      version: estadoTx.snapshot.version,
      monto_reservado: reserva.montoReservado
    });

    return res.json({
      ok: true,
      pedidoId,
      repartidorId: uid,
      montoReservado: reserva.montoReservado,
      elegibilidad: reserva.elegibilidad,
      version: estadoTx.snapshot.version
    });
  } catch (error) {
    return next(error);
  }
});
```

---

### PASO 3: Reemplazar `/complete-order`

**Ubicación:** `routes/delivery.js` líneas ~460

**Encontrar:**
```javascript
router.post('/complete-order', requireFirebaseUser, async (req, res, next) => {
```

**Reemplazar la sección de actualización con:**

```javascript
router.post('/complete-order', requireFirebaseUser, async (req, res, next) => {
  try {
    // ... validaciones previas ...
    
    const completedAt = Date.now();
    const reserva = pedido.capital_reserva || pedido.logistica?.capital_reserva || {};
    const montoReservado = roundMoney(reserva.monto || obtenerMontoPedido(pedido));

    // Primero: Liberar capital
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

    // ✅ TRANSACCIÓN ATÓMICA para cambio de estado
    const estadoTx = await executePedidoStateTransition(db, {
      pedidoId,
      uid,
      nuevoEstado: 'ENTREGADO',
      cambiosPorNodo: {
        'pedidos_para_reparto': {
          estado: 'ENTREGADO',
          estado_pedido: 'ENTREGADO',
          entregado_en: completedAt,
          capital_reserva: {
            ...reserva,
            estado: 'liberada',
            liberado_en: completedAt
          }
        },
        'pedidos_en_camino': {
          estado: 'ENTREGADO',
          estado_pedido: 'ENTREGADO',
          entregado_en: completedAt,
          capital_reserva: {
            ...reserva,
            estado: 'liberada',
            liberado_en: completedAt
          }
        },
        'pedidos': {
          estado: 'ENTREGADO',
          estado_pedido: 'ENTREGADO',
          entregado_en: completedAt,
          capital_reserva: {
            ...reserva,
            estado: 'liberada',
            liberado_en: completedAt
          }
        },
        setActivoPedido: false
      }
    });

    if (!estadoTx.ok) {
      return res.status(409).json({ ok: false, error: estadoTx.error });
    }

    // ✅ Registrar evento en ledger
    await db.ref(`order_events/${pedidoId}`).push({
      tipo: 'ENTREGADO',
      repartidor_id: uid,
      timestamp: completedAt,
      version: estadoTx.snapshot.version,
      monto_liberado: montoReservado
    });

    return res.json({
      ok: true,
      pedidoId,
      version: estadoTx.snapshot.version
    });
  } catch (error) {
    return next(error);
  }
});
```

---

## Validación

Después de aplicar estos cambios:

```bash
# 1. Verificar que no hay errores de sintaxis
node -c routes/delivery.js

# 2. Ejecutar linting
npm run lint routes/delivery.js

# 3. Re-ejecutar la sonda
npm run test:e2e:probe
```

---

## Beneficios Esperados

| Antes | Después |
|--------|---------|
| 🔴 Promise.all (falla parcial) | ✅ Transacción atómica |
| 🔴 Sin version | ✅ version incrementada |
| 🔴 Sin ledger | ✅ order_events registrados |
| 🔴 Estados fantasma | ✅ Consistencia garantizada |
| 🔴 Admin ≠ Cocina | ✅ Admin = Cocina = Driver |

---

## Timeline

**Hoy:**
- [ ] Crear función `executePedidoStateTransition` (10 min)
- [ ] Reemplazar `/accept-order` (15 min)
- [ ] Reemplazar `/complete-order` (15 min)
- [ ] Test unitarios (20 min)

**Total: ~60 minutos**

---

## Siguiente

Una vez que estos cambios estén aplicados y validados:

```
PED_TEST_REAL_001 debería pasar
↓
Si pasa → FASE 1 CERTIFICADA
↓
Si falla → Debuguear con logs de version/ledger
```

---

## Nota Crítica

No agregar funciones nuevas hasta que estos cambios estén confirmados.

Esto es **arquitectura de cimientos**.

Todo lo demás depende de esto.
