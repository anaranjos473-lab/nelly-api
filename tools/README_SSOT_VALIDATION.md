# SSOT Pedidos: Kit Completo de Validación

**Objetivo Estratégico:**  
Certificar que SSOT Pedidos funciona end-to-end y que todo pedido tiene un recorrido único verificable.

**Estado Actual:**  
- ✅ Commit `67e6425` en producción  
- ✅ Código correcto (panel.html no escribe en `pedidos_en_camino`)  
- ⏳ **PRÓXIMO: Validación con datos reales**

---

## 📚 Documentos de Validación

### 1. **GATE_SSOT_001.md** ← LEER PRIMERO

**Qué es:** Los 4 checkpoints críticos que determinan si SSOT funciona.

**Contenido:**
- Gate 1: DESPACHAR NO crea `pedidos_en_camino` prematuramente
- Gate 2: Android ve el pedido en < 10 segundos
- Gate 3: Accept limpia la cola correctamente
- Gate 4: Finanzas genera UN solo movimiento

**Cuándo leer:** Antes de ejecutar cualquier prueba.

**Decisión:** Si los 4 pasan → SSOT certificado.

---

### 2. **CHECKLIST_GATE_SSOT_001.md** ← USAR DURANTE LA PRUEBA

**Qué es:** Guía paso-a-paso con checkboxes para ejecutar los 4 gates.

**Contenido:**
- Instrucciones detalladas por gate
- Checkboxes para ir marcando progreso
- Dónde verificar en Firebase
- Qué documentar si falla

**Cuándo usar:** Durante la ejecución de la validación.

**Formato:** Imprime o abre en otra ventana.

---

### 3. **RUNBOOK_E2E_SSOT.md** ← REFERENCIA TÉCNICA

**Qué es:** Runbook técnico completo del flujo SSOT.

**Contenido:**
- Flujo detallado: Cocina → Backend → Firestore → RTDB → Android
- Verificaciones en Cloud Functions
- Comandos de inspección
- Troubleshooting por síntoma

**Cuándo usar:** Si algo falla y necesitas entender el flujo técnico.

---

### 4. **validate-gate-ssot-001.js** ← SCRIPT AUTOMATIZADO

**Qué es:** Script que valida automáticamente algunos gates.

**Contenido:**
- Detecta pedidos recientes
- Valida Gate 1: Ausencia de `pedidos_en_camino` prematura
- Valida Gate 2: Datos presentes en Firebase
- Valida Gate 4: Sin finanzas duplicadas
- Genera reporte JSON

**Cuándo usar:**
```bash
node tools/validate-gate-ssot-001.js
```

**Nota:** Gates 3 requiere interacción manual (Accept real).

---

## 🎯 Flujo de Ejecución Recomendado

### Paso 1: Lectura (10 min)
1. Leer [GATE_SSOT_001.md](#1-gate_ssot_001md--leer-primero)
2. Entender los 4 puntos críticos
3. Anotar criterios de PASS/FAIL

### Paso 2: Preparación (5 min)
1. Tener listos:
   - Backend en Render
   - Firebase Console
   - Android app
   - Cocina panel
2. Crear pedido de prueba:
   ```bash
   node scripts/createPedidoViaSSOT.js
   ```

### Paso 3: Validación Manual (30 min)
1. Abrir [CHECKLIST_GATE_SSOT_001.md](#2-checklist_gate_ssot_001md--usar-durante-la-prueba)
2. Ejecutar gates en orden:
   - Gate 1: Verificar Firebase después de DESPACHAR
   - Gate 2: Cronómetro desde Despacho hasta Android
   - Gate 3: Verificar cambios después de Accept
   - Gate 4: Entrega y verificar finanzas

### Paso 4: Validación Automatizada (5 min)
```bash
node tools/validate-gate-ssot-001.js
```

### Paso 5: Documentación
1. Completar checklist
2. Archivar resultados
3. Notificar al equipo

---

## 📊 Matriz de Decisión

| Resultado | Acción | Próximo Paso |
|-----------|--------|-------------|
| **4/4 PASS** | ✅ CERTIFICADO | Phase 2C, Go-Live prep |
| **3/4 PASS** | 🔧 Revisar fallo | Debug, retry |
| **<3 PASS** | 🛑 CRÍTICO | Análisis profundo, NO proceder |

---

## 🔍 Guía Rápida por Gate

### Gate 1: ¿No hay `pedidos_en_camino` antes de Accept?

**Verificación rápida:**
```
Firebase Console
  → Realtime Database
  → pedidos_en_camino/
  → Debería estar VACÍO si acaban de despachar
```

**Si FALLA:**
- Buscar escritor oculto en `routes/delivery.js`
- Buscar `.set()` o `.update()` hacia `pedidos_en_camino`

---

### Gate 2: ¿Android ve en < 10s?

**Verificación rápida:**
```
1. Despachar desde Cocina (LISTO PARA REPARTO)
2. Cronómetro en Android (Pedidos Disponibles)
3. Refrescar lista
4. Anotar tiempo cuando aparece
```

**Si FALLA:**
- Verificar sincronización de datos Android
- Revisar `pedidos_para_reparto` en Firebase (¿existen datos?)
- Revisa latencia de red

---

### Gate 3: ¿Accept limpia?

**Verificación rápida:**
```
ANTES:
  ✅ pedidos_para_reparto/{id}
  ❌ pedidos_en_camino/{id}

DESPUÉS de Accept:
  ❌ pedidos_para_reparto/{id}
  ✅ pedidos_en_camino/{id}
```

**Si FALLA:**
- Revisar `acceptOrder()` en Backend
- Verificar transacciones atómicas
- Revisar indices de RTDB

---

### Gate 4: ¿Finanzas sin duplicados?

**Verificación rápida:**
```
Firestore → financiero → movimientos → items
  → count(id_pedido = X) = 1
  → repetir ENTREGA
  → count(id_pedido = X) = sigue siendo 1
```

**Si FALLA:**
- CRÍTICO: Revisar `markDeliveryComplete()`
- Verificar idempotencia
- Revisar NellyCalculator (NO modificar comisión)

---

## 📝 Plantilla de Reporte

```markdown
# SSOT-001 Resultado Final

Fecha: 2026-06-23
Ejecutor: ___________

## Gates

- Gate 1 (No `pedidos_en_camino` temprano): PASS / FAIL
- Gate 2 (Android < 10s): PASS / FAIL
- Gate 3 (Accept limpia): PASS / FAIL
- Gate 4 (Sin finanzas duplicadas): PASS / FAIL

## Conclusión

[ ] CERTIFICADO → Proceder Phase 2C
[ ] REQUIERE AJUSTES → Debug y retry
[ ] FALLO CRÍTICO → Hold, análisis profundo
```

---

## 🚀 Después de SSOT-001 Certificado

**Inmediatamente:**
1. Documentar certificación en repo
2. Notificar al equipo
3. Actualizar status en README.md

**Próximos hitos:**
- Phase 2C (nuevas funcionalidades)
- Validación con operaciones REALES
- Entrenar operadores en flujo SSOT
- Go-Live planeado

**Métrica de éxito:**
> "Nelly deja de ser un conjunto de módulos que funcionan para ser una plataforma operativa coherente."

---

## 🔗 Enlaces Rápidos

- **Documentación Arquitectura:** [DOCUMENTACION_ARQUITECTURA_DATOS.md](../DOCUMENTACION_ARQUITECTURA_DATOS.md)
- **Índice de Scripts:** [SSOT_SCRIPTS_INDEX.md](SSOT_SCRIPTS_INDEX.md)
- **Herramientas Forenses:** [forensics/README.md](forensics/README.md)
- **Commit SSOT:** `67e6425 Implement SSOT dispatch flow`

---

## ⚠️ Importante

**NO proceder a Phase 2C hasta que GATE SSOT-001 esté CERTIFICADO.**

No es sobre código nuevo. Es sobre certeza operativa.

Si falla, no significa que el código es malo. Significa que hay un punto de inconsistencia que debe identificarse y corregirse antes de escalar.

**Eso es lo que separa un MVP de una plataforma.**
