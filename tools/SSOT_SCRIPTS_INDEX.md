# Índice de Scripts - Validación SSOT

**Última actualización:** 2026-06-23  
**Status:** Limpieza en curso

---

## 📌 Clasificación de Scripts

### ✅ Seguros - Parte del Producto

| Script | Propósito | Estado |
|--------|-----------|--------|
| `app.js` | Servidor principal | ✅ Producción |
| `routes/delivery.js` | API delivery | ✅ Producción (SSOT) |
| `public/panel.html` | Panel Cocina | ✅ Producción (SSOT) |
| `createPedidoViaSSOT.js` | Crear pedidos respetando SSOT | ✅ Nuevo |

---

### 🚨 Bypass - NO Usar

**Estos scripts escriben directamente en RTDB y violan SSOT:**

| Script | Problema | Acción |
|--------|----------|--------|
| `complete-order-fallback.js` | Escribe en `pedidos_en_camino` directamente | ❌ NUNCA usar |
| `simulate-accept-order.js` | Bypass de lógica de validación | ❌ NUNCA usar |
| `create-order-ready-complete.js` | Crea pedidos sin pasar por Backend | ❌ NUNCA usar |

**Riesgo:** Si alguien los ejecuta, rompen SSOT nuevamente.

**Recomendación:**
1. Documentar en `tools/forensics/`
2. NO eliminar (pueden ser útiles para investigación)
3. Agregar comentario deprecation en archivos
4. Alertar al equipo

---

### 🔍 Forenses - Diagnóstico SOLO

**Estos scripts NO modifican, SOLO consultan:**

| Script | Propósito | Ubicación |
|--------|-----------|-----------|
| `audit-and-clean-pedido.js` | Audita estado de pedidos | `tools/forensics/` |
| `audit-driver-uid.js` | Audita UIDs repartidores | `tools/forensics/` |
| `check-pedido-status.js` | Verifica estado actual | `tools/forensics/` |
| `verify-pedido-status.js` | Valida integridad | `tools/forensics/` |
| `rtdb_audit.js` | Audita RTDB completo | `tools/forensics/` |
| `check_firebase.js` | Health check Firebase | `tools/forensics/` |
| `check-render.js` | Health check Render | `tools/forensics/` |

**Status:** Movidos a `tools/forensics/` (agregar enlaces cuando se haga)

**Uso:** Solo para investigación con supervisión

---

### ⚠️ A Revisar

| Script | Estado | Acción |
|--------|--------|--------|
| `generar-pedido-directo-reparto-rtdb.js` | ❌ Deprecated | Marcar como deprecated ✅ Hecho |
| `scripts/generar-pedido-directo-reparto-rtdb.js` | → | Usar `createPedidoViaSSOT.js` |

---

## 🔄 Plan de Migración

### Fase 1: Documentación (✅ HECHO)
- [x] Crear `tools/forensics/README.md`
- [x] Marcar deprecated scripts
- [x] Crear `createPedidoViaSSOT.js`
- [x] Crear `RUNBOOK_E2E_SSOT.md`
- [x] Agregar `.firebase/` a `.gitignore`

### Fase 2: Movimiento de Archivos (TODO)
- [ ] Mover `audit-*.js` a `tools/forensics/`
- [ ] Mover `check-*.js` a `tools/forensics/`
- [ ] Mover `verify-*.js` a `tools/forensics/`
- [ ] Actualizar rutas en documentación

### Fase 3: Team Notification (TODO)
- [ ] Comunicar deprecation a equipo
- [ ] Explicar nueva ruta SSOT
- [ ] Proporcionar ejemplos de uso

### Fase 4: Cleanup (TODO)
- [ ] Revisar scripts bypass 30 días después
- [ ] Eliminar si no se usan
- [ ] Archivar si son necesarios para auditoría

---

## 🎯 Validación de Limpieza

```bash
# Verificar que no hay escrituras a RTDB fuera de Backend
grep -r "admin.database().ref.*set\|update\|push" routes/ --include="*.js" | grep -v "// DEPRECATED"

# Resultado esperado: 0 coincidencias (excepto en logs)
```

---

## 📝 Notas

- **SSOT es ahora el estado de verdad principal**
- **Todo cambio debe pasar por el Backend**
- **Firestore es la fuente, RTDB es la copia indexada**
- **Herramientas de diagnóstico están archivadas pero disponibles**

---

## 🔗 Referencias

- Commit SSOT: `67e6425 Implement SSOT dispatch flow`
- Documentación: [DOCUMENTACION_ARQUITECTURA_DATOS.md]
- Runbook E2E: [RUNBOOK_E2E_SSOT.md]
