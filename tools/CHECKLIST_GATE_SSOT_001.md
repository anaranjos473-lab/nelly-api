# Checklist de Ejecución: GATE SSOT-001

**Versión:** 1.0  
**Creado:** 2026-06-23  
**Responsable:** _______________  
**Fecha ejecución:** _______________

---

## 📋 Pre-Requisitos

- [ ] Backend en Render corriendo
- [ ] Firebase Console accesible
- [ ] Android app instalada y conectada
- [ ] Cocina panel (`public/panel.html`) cargado
- [ ] `nelly-admin.json` presente o `FIREBASE_ADMIN_JSON` configurado
- [ ] `.env` con `FIREBASE_DATABASE_URL`

---

## 🚀 Ejecución

### Paso 0: Crear Pedido de Prueba

```bash
node scripts/createPedidoViaSSOT.js
```

**Resultado esperado:**
```
✅ Status 201
✅ ID: [id_pedido]
✅ Estado: PENDIENTE
```

Anotar el `id_pedido`:  
```
ID_PEDIDO = _______________
```

---

### Paso 1: DESPACHAR NO crea `pedidos_en_camino` prematuramente

**En Cocina (panel.html):**

1. [ ] Buscar el pedido creado
2. [ ] Presionar **LISTO PARA REPARTO**
3. [ ] Esperar 2-3 segundos

**En Firebase Console:**

1. [ ] Ir a Realtime Database
2. [ ] Abrir `pedidos/{ID_PEDIDO}`
   - [ ] ✅ Debe existir
3. [ ] Abrir `pedidos_para_reparto/{ID_PEDIDO}`
   - [ ] ✅ Debe existir
4. [ ] Abrir `pedidos_en_camino/{ID_PEDIDO}`
   - [ ] ❌ NO DEBE existir todavía

**Resultado:**

```
Gate 1: [ ] PASS   [ ] FAIL

Si FAIL - ¿Por qué?
  [ ] pedidos_en_camino existe prematuramente
  [ ] Otro motivo: _______________
```

---

### Paso 2: Android REALMENTE ve el pedido en < 10 segundos

**En Android:**

1. [ ] Abrir app Repartidor
2. [ ] Ir a "Pedidos Disponibles"
3. [ ] ⏱️ **INICIAR CRONÓMETRO** cuando Cocina presionó DESPACHAR
4. [ ] Refrescar lista (si es necesario)
5. [ ] ⏱️ **PARAR CRONÓMETRO** cuando aparece el pedido

**Verificar:**

- [ ] ✅ Aparece en la lista
- [ ] ✅ Tiene nombre del cliente
- [ ] ✅ Tiene monto
- [ ] ✅ Responde a toque (puede abrir detalles)

**Tiempo medido:** _______ segundos

**Resultado:**

```
Gate 2: [ ] PASS   [ ] FAIL

Criterio:
  [ ] < 10 segundos  →  PASS
  [ ] 10-15 segundos  →  WARNING (revisar)
  [ ] > 15 segundos  →  FAIL

Si FAIL - ¿Qué pasó?
  [ ] No apareció nunca
  [ ] Apareció lentamente (> 15s)
  [ ] Apareció pero sin datos
  [ ] Otro: _______________
```

---

### Paso 3: Accept limpia la cola correctamente

**En Android:**

1. [ ] Presionar el pedido
2. [ ] Presionar **ACEPTAR**
3. [ ] ✅ Confirmar audio

**En Firebase Console (después de ~2-3 segundos):**

1. [ ] Abrir `pedidos_para_reparto/{ID_PEDIDO}`
   - [ ] ❌ NO DEBE existir (o marcado como deleted)
   
2. [ ] Abrir `pedidos_en_camino/{ID_PEDIDO}`
   - [ ] ✅ DEBE existir
   - [ ] ✅ Datos: cliente, monto, estado = EN_CAMINO
   
3. [ ] Abrir `pedidos/{ID_PEDIDO}`
   - [ ] ✅ estado = EN_CAMINO
   - [ ] ✅ timestamp actualizado

**Prueba de Exclusividad:**

1. [ ] Abrir Android en otro teléfono/emulador (simulando otro driver)
2. [ ] Ir a "Pedidos Disponibles"
3. [ ] ❌ El pedido NO debe aparecer (porque ya fue aceptado)

**Resultado:**

```
Gate 3: [ ] PASS   [ ] FAIL

Si PASS:
  [ ] Desapareció de pedidos_para_reparto
  [ ] Apareció en pedidos_en_camino
  [ ] Otro driver NO lo ve
  [ ] Estado es EN_CAMINO

Si FAIL - ¿Qué falló?
  [ ] Sigue en pedidos_para_reparto (duplicado)
  [ ] No apareció en pedidos_en_camino
  [ ] Otro driver SÍ lo ve (exclusividad rota)
  [ ] Otro: _______________
```

---

### Paso 4: Finanzas genera UN SOLO movimiento por entrega

**En Android:**

1. [ ] Ir a "En Camino"
2. [ ] Presionar el pedido
3. [ ] Presionar **ENTREGA COMPLETADA**
4. [ ] ✅ Confirmar

**Anotar timestamp:** _______________

**En Firebase Console (Firestore):**

1. [ ] Ir a `financiero` → `movimientos` → `items`
2. [ ] Buscar documento con `id_pedido = {ID_PEDIDO}`
3. [ ] Verificar:
   - [ ] ✅ Existe 1 documento
   - [ ] ✅ Contiene: cobro, comisión, acreditación
   - [ ] ✅ Monto = correcto (NellyCalculator 18%)

**Prueba de Idempotencia:**

1. [ ] En Android, repetir **ENTREGA COMPLETADA** (aunque sea gris/deshabilitado)
2. [ ] Refrescar Firebase Console
3. [ ] ✅ Sigue habiendo SOLO 1 movimiento (no 2)

**Resultado:**

```
Gate 4: [ ] PASS   [ ] FAIL

Si PASS:
  [ ] Primer ENTREGA = 1 movimiento
  [ ] Segundo intento = mismo movimiento (NO duplicado)
  [ ] Monto correcto
  [ ] Comisión 18% correcta

Si FAIL - ¿Qué falló?
  [ ] Hay 2 documentos financieros (duplicado)
  [ ] Monto es incorrecto
  [ ] Comisión no es 18%
  [ ] Segundo intento creó otro movimiento
  [ ] Otro: _______________
```

---

## 📊 Resumen de Resultados

```
┌─────────────────────────────────────┐
│ Gate 1: ✅  / ❌  / ⏳              │
│ Gate 2: ✅  / ❌  / ⏳              │
│ Gate 3: ✅  / ❌  / ⏳              │
│ Gate 4: ✅  / ❌  / ⏳              │
└─────────────────────────────────────┘

TOTAL PASS: _____ / 4
```

---

## 🎯 Decisión Final

### Opción A: 4/4 Gates PASS ✅

```
✅ SSOT-001 CERTIFICADO

Proceder a:
  → Phase 2C - Nuevas funcionalidades
  → Validación de operaciones REALES
  → Entrenar operadores
  → Preparar Go-Live
```

### Opción B: 3/4 Gates PASS

```
🔧 REVISAR FALLO ESPECÍFICO

El que falló:
  Gate ___

Revisar:
  - Código relevante
  - Logs del endpoint fallido
  - Transacciones Firebase

Retry después de fix
```

### Opción C: <3 Gates PASS

```
🛑 SSOT TIENE PROBLEMAS ESTRUCTURALES

ACCIONES REQUERIDAS:
  1. NO proceder a Phase 2C
  2. NO ejecutar operaciones reales
  3. Análisis profundo de fallos
  4. Considerar rediseño parcial
  5. Crear issues de debugging
```

---

## 📝 Observaciones y Notas

```
[Aquí documenta qué observaste, qué funcionó bien, qué necesita atención]

1. Gate 1 - Observaciones:
   ___________________________________

2. Gate 2 - Observaciones:
   ___________________________________

3. Gate 3 - Observaciones:
   ___________________________________

4. Gate 4 - Observaciones:
   ___________________________________

Notas generales:
___________________________________
___________________________________
```

---

## 🔗 Referencias

- **Documento de Gates:** [GATE_SSOT_001.md](GATE_SSOT_001.md)
- **Runbook E2E Completo:** [RUNBOOK_E2E_SSOT.md](RUNBOOK_E2E_SSOT.md)
- **Script de Validación:** `node tools/validate-gate-ssot-001.js`
- **Commit SSOT:** `67e6425 Implement SSOT dispatch flow`

---

## ✅ Firma de Ejecución

Ejecutor: _____________________  
Fecha: _____________________  
Hora inicio: _____ Hora fin: _____  
Duración total: _____ minutos  

**Status Final:** [ ] CERTIFICADO  [ ] REQUIERE AJUSTES  [ ] FALLO CRÍTICO

Firma / Email: _____________________________

---

## 📤 Próximos Pasos Después de Completar

- [ ] Guardar este checklist completado
- [ ] Archivar en repositorio bajo `/tools/GATE_SSOT_001_RESULTS/`
- [ ] Notificar al equipo si CERTIFICADO
- [ ] Crear issues si hay fallos
- [ ] Actualizar tabla de hitos en README.md

---

**NOTA IMPORTANTE:** Este checklist es el CERTIFICADO de que SSOT Pedidos funciona end-to-end.  
Si todos los gates pasan, puedes afirmar con evidencia:  
> "Todo pedido de Nelly tiene un recorrido único y verificable desde creación hasta acreditación financiera."
