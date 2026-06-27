# GATE SSOT-001: Validación Crítica de Coherencia

**Objetivo:** Certificar que SSOT Pedidos funciona end-to-end sin inconsistencias.

**Decisión:** Si los 4 gates PASAN, podemos afirmar con evidencia que todo pedido tiene un recorrido verificable y único desde creación hasta acreditación.

**Estado:** PENDING (debe ejecutarse en producción antes de Phase 2C)

---

## 📋 Los 4 Gates

### Gate 1: DESPACHAR NO crea `pedidos_en_camino` prematuramente

**Caso de Uso:**
1. Admin crea pedido
2. Cocina presiona **LISTO PARA REPARTO**
3. Verificar Firebase

**Verificación:**

```javascript
// En Firebase Console o script:
// Debe haber:
✅ pedidos/{id}
✅ pedidos_para_reparto/{id}

// NO debe haber:
❌ pedidos_en_camino/{id}  ← ANTES de que Android acepte
```

**¿Por qué importa?**
- Históricamente: panel.html escribía manualmente en `pedidos_en_camino`
- Violaba SSOT (dos escritores)
- Generaba inconsistencias

**Criterio de PASS:**
- [x] `pedidos_en_camino` está VACÍO hasta que Android acepta
- [x] No hay entradas fantasma
- [x] No hay datos leftovers de pruebas anteriores

**Criterio de FAIL:**
- ❌ `pedidos_en_camino/{id}` existe ANTES de Accept
- ❌ Hay escritor oculto en el código

**Acción si FALLA:**
```
Buscar en:
  - routes/delivery.js (buscar escritura a pedidos_en_camino)
  - public/panel.html (buscar .set/update en Firebase)
  - functions/ (buscar Cloud Functions que escriban)
```

---

### Gate 2: Android REALMENTE ve el pedido en < 10 segundos

**Caso de Uso:**
1. Cocina presiona **LISTO PARA REPARTO**
2. Cronómetro en mano
3. Android abre "Pedidos Disponibles"
4. Medir tiempo de aparición

**Verificación:**

```
⏱️ Pedido despachado
   ↓
⏱️ Aparece en Android (Android home → Pedidos → refrescar)
```

**¿Por qué importa?**
- El mayor problema histórico en pruebas
- Si Android no ve pedidos, es un problema ANTES de accept/finanzas
- Limita búsqueda: `dispatch-order → pedidos_para_reparto → PedidoSyncModule`

**Criterio de PASS:**
- [x] Pedido visible en < 10 segundos
- [x] Pedido aparece con datos correctos (cliente, monto)
- [x] Pedido responde a interacciones

**Criterio de FAIL:**
- ❌ No aparece o tarda > 15 segundos
- ❌ Aparece pero sin datos
- ❌ Desaparece al refrescar

**Acción si FALLA:**
```
NO revisar: GPS, Finanzas, IA, Asignación automática
REVISAR: 
  - ¿dispatch-order completó exitosamente?
  - ¿pedidos_para_reparto se actualiza?
  - ¿PedidoSyncModule recibe listener?
  - ¿Android tiene sincronización de datos activa?
```

---

### Gate 3: Accept limpia la cola correctamente

**Caso de Uso:**
1. Android acepta pedido
2. Verificar que desaparece de `pedidos_para_reparto`
3. Verificar que aparece en `pedidos_en_camino`
4. Verificar que otros drivers no lo ven

**Verificación:**

```javascript
// Antes de Accept:
✅ pedidos_para_reparto/{id}  ← visible para todos
❌ pedidos_en_camino/{id}      ← no existe

// Después de Accept:
❌ pedidos_para_reparto/{id}  ← DESAPARECE
✅ pedidos_en_camino/{id}      ← APARECE
✅ estado maestro (pedidos/{id}) = EN_CAMINO
```

**¿Por qué importa?**
- Valida que Accept es atómico
- Verifica que la máquina de estados funciona
- Prueba que otros drivers no verán el mismo pedido

**Criterio de PASS:**
- [x] `pedidos_para_reparto` se elimina o marcamarkup deleted
- [x] `pedidos_en_camino` se crea
- [x] Estado maestro es EN_CAMINO
- [x] Otro driver que refresca NO ve el pedido

**Criterio de FAIL:**
- ❌ Pedido aparece en AMBOS nodos (inconsistencia)
- ❌ Otro driver ve el mismo pedido disponible
- ❌ Estado maestro queda en PENDIENTE

**Acción si FALLA:**
```
Revisar:
  - routes/delivery.js (acceptOrder, updateState)
  - Cloud Functions (índices en RTDB)
  - Transaction consistency
```

---

### Gate 4: Finanzas genera UN SOLO movimiento por entrega

**Caso de Uso:**
1. Android marca **ENTREGA COMPLETADA**
2. Verificar que genera: 1 cobro, 1 comisión, 1 acreditación
3. Refrescar, recargar, repetir ENTREGA
4. Verificar que NO genera duplicados

**Verificación:**

```javascript
// Después de marcar ENTREGA:
Firestore: financiero/movimientos/{id}
  - count: 1 cobro
  - count: 1 comisión
  - count: 1 acreditación

// Después de refrescar y repetir:
  - count: SIGUE siendo 1 (NO 2)
  - SIN acreditaciones duplicadas
```

**¿Por qué importa?**
- Bug histórico crítico
- Si se duplica, se duplican acreditaciones
- Afecta directamente a dinero real

**Criterio de PASS:**
- [x] Primer ENTREGA genera 1 movimiento
- [x] Segundo intento NO duplica
- [x] Refrescar page NO genera más
- [x] Archivo de auditoría es limpio

**Criterio de FAIL:**
- ❌ 2 cobros / 2 comisiones
- ❌ 2 acreditaciones para el mismo pedido
- ❌ Timestamps duplicados

**Acción si FALLA:**
```
CRITICAL - Revisar:
  - markDeliveryComplete() en routes/delivery.js
  - Transacciones financieras en Firestore
  - NellyCalculator (NO MODIFICAR comisión 18%)
  - Idempotencia del endpoint
```

---

## 🎯 Guía de Ejecución

### Fase 1: Preparación (5 min)

```bash
# Terminal 1: Ver Firebase en tiempo real
node tools/forensics/firebase-live-watch.js  # (crear si no existe)

# Terminal 2: Abrir Firebase Console
# https://console.firebase.google.com/project/nelly-delivery-...

# Terminal 3: Monitorear logs Render
# curl https://[render-url]/logs
```

### Fase 2: Ejecutar Gates (15 min)

```
Gate 1: ¿No hay pedidos_en_camino antes de Accept?
  [ ] PASS  [ ] FAIL → Documentar

Gate 2: ¿Android ve en < 10s?
  [ ] PASS  [ ] FAIL → Documentar (con timestamp)

Gate 3: ¿Accept limpia correctamente?
  [ ] PASS  [ ] FAIL → Documentar

Gate 4: ¿Finanzas NO duplica?
  [ ] PASS  [ ] FAIL → Documentar
```

### Fase 3: Resultado Final (2 min)

```
4/4 Gates PASS → SSOT-001 CERTIFICADO ✅
3/4 Gates PASS → Revisar fallo, retry
<3 Gates PASS → HOLD Phase 2C, debug
```

---

## 📊 Plantilla de Resultado

```markdown
# GATE SSOT-001 Resultado

Fecha: 2026-06-23
Ejecutor: ___________
Entorno: Producción (Render)

## Resultados

### Gate 1: DESPACHAR NO crea pedidos_en_camino prematuramente
- Status: [ ] PASS  [ ] FAIL
- Pedido ID: _______________
- Observaciones: 
  - ¿Existe pedidos_en_camino ANTES de Accept? SI/NO
  - ¿Datos consistentes? SI/NO

### Gate 2: Android ve el pedido en < 10 segundos
- Status: [ ] PASS  [ ] FAIL
- Tiempo medido: ______ segundos
- Observaciones:
  - ¿Aparece con datos? SI/NO
  - ¿Responde a interacciones? SI/NO

### Gate 3: Accept limpia la cola
- Status: [ ] PASS  [ ] FAIL
- Observaciones:
  - ¿Desaparece de pedidos_para_reparto? SI/NO
  - ¿Aparece en pedidos_en_camino? SI/NO
  - ¿Estado maestro = EN_CAMINO? SI/NO

### Gate 4: Finanzas genera UN solo movimiento
- Status: [ ] PASS  [ ] FAIL
- Intento 1: 1 cobro, 1 comisión
- Intento 2 (repetido): 1 cobro, 1 comisión (igual a intento 1)
- Observaciones:
  - ¿Timestamps diferentes? SI/NO
  - ¿IDs duplicados? SI/NO

## Conclusión

**SSOT-001 Status:** [ ] CERTIFICADO  [ ] REQUIERE AJUSTES

Si CERTIFICADO: Proceder a Phase 2C / Validación de operaciones reales
Si REQUIERE AJUSTES: Crear issues, debug, retry

## Notas Finales

[Aquí documenta qué funcionó bien y qué necesita atención]
```

---

## 🔄 Decisiones Posteriores

### Si 4/4 PASAN ✅

```
✅ SSOT Pedidos está certificado
✅ Puedes afirmar: "Todo pedido tiene un recorrido único y verificable"
✅ Proceder a:
   - Phase 2C (nuevas funcionalidades)
   - Validación de operaciones REALES
   - Capacitación del equipo
   - Go-Live planeado
```

### Si 3/4 PASAN

```
🔧 Revisar fallo específico
   - No es un problema de arquitectura global
   - Es un ajuste acotado
   - Retry después de fix
```

### Si <3 PASAN

```
🛑 SSOT tiene problemas estructurales
   - NO proceder a Phase 2C
   - NO ejecutar operaciones reales
   - Revertir a análisis profundo
   - Considerar rediseño
```

---

## 📝 Próximos Pasos Después de GATE SSOT-001

Si CERTIFICADO:
1. [ ] Documentar el certificado en repositorio
2. [ ] Notificar al equipo
3. [ ] Crear runbook operativo (diferente al técnico)
4. [ ] Entrenar a operadores en flujo SSOT
5. [ ] Preparar validación de operaciones reales (nuevas pruebas)

Si REQUIERE AJUSTES:
1. [ ] Crear issues específicas
2. [ ] Asignar prioridad
3. [ ] Debug
4. [ ] Retry

---

## 🎖️ Hito Estratégico

**Si GATE SSOT-001 PASA:**

Ya no es: "Varios módulos que funcionan"  
Es: **"Una plataforma coherente"**

Y eso es lo que realmente te diferencia. No es código más bonito. Es certeza operativa.

```
SSOT Pedidos Certificado
    ↓
Dinero en movimiento real confiable
    ↓
Operaciones escalables
```
