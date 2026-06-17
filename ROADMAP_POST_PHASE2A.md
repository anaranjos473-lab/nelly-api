# ROADMAP REORDENADO - Nelly Delivery

**Timestamp:** 2026-06-17 T11:15:00Z  
**Status:** OPERATIVO (Post PHASE 2A freeze)

---

## 📊 Roadmap Global

```
PHASE 1
✅ Certificada
   └─ Orderbook integrity, versioning, state machine

PHASE 2A
✅ Congelada
   └─ Single writer pedidos, panel RO, gate A cerrado
   └─ Tag: phase2a-certified (ee52b6b)

PHASE 2B 🚨 PRIORIDAD ABSOLUTA (2h)
   ├─ P0: Consolidar GPS (15 min) ✅ DONE
   ├─ P1: TTL cleanup + offline (90 min) → NEXT
   ├─ P2: Stale filtering (20 min) → NEXT
   └─ Verificación física (2 teléfonos, 1 cuadra) → NEXT

PILOTO COMERCIAL 🎯 (Inmediatamente post PHASE 2B)
   ├─ 1 negocio
   ├─ 2-3 conductores reales
   ├─ 10-20 pedidos reales
   └─ Duración: 1-2 días

PHASE 2C ⏳ Después del piloto
   └─ Financial governance (comisiones, liquidaciones)

PHASE 3 ⏳ Después de PHASE 2C
   └─ Observabilidad + Escalabilidad
```

---

## 🚨 ¿Por qué PHASE 2B ANTES de PHASE 2C?

### Riesgo de GPS en Producción

```
Sin GPS:
├─ No sabes dónde está el conductor
├─ No puedes reencaminar si hay problema
├─ No puedes cumplir SLA de entrega
└─ → OPERACIÓN IMPOSIBLE
```

**Impacto:** Crítico - sin GPS no hay negocio

---

### Riesgo de Finanzas en Producción

```
Sin finanzas:
├─ Cálculos de comisión incorrectos
├─ Liquidaciones desfasadas
├─ Reportes de ingresos inconsistentes
└─ → PROBLEMÁTICO, PERO RECONCILIABLE
```

**Impacto:** Medio - se puede corregir retroactivamente

---

### Conclusión

**GPS:** Debe funcionar en campo ANTES de cualquier operación real  
**Finanzas:** Puede estabilizarse DURANTE el piloto

---

## 📅 Timeline Propuesto

### Hoy (2026-06-17): P0 ✅ DONE

```
09:00 - 09:15: P0 ejecución (consolidar conductores_activos)
09:15 - 09:20: Verificación grep (0 referencias productivas)
09:20 - 09:30: Commit + tag
```

**Status:** ✅ Completado

---

### Mañana (2026-06-18): P1+P2 + Verificación Física

```
09:00 - 10:30: P1 Implementación
    ├─ Cloud Function cleanupStaleConductores()
    ├─ POST /driver-offline endpoint
    └─ Android onDestroy() integration

10:30 - 10:50: P2 Implementación
    ├─ mapa-logistica.js timestamp filtering
    └─ Opacity gradient

10:50 - 11:00: Deploy staging

11:00 - 12:00: VERIFICACIÓN FÍSICA
    ├─ Setup: 2 teléfonos, 1 cuadra
    ├─ Escenario 1: GPS aparece
    ├─ Escenario 2: GPS se mueve
    ├─ Escenario 3: GPS desaparece (app cierra)
    ├─ Escenario 4: GPS reaparece
    └─ Escenario 5: Stale cleanup (120s timeout)

12:00 - 12:15: Documentación
    └─ PHASE2B_PHYSICAL_VERIFICATION_REPORT.md

12:15 - 12:20: Tag + Commit
    └─ git tag phase2b-gps-certified
```

**Status:** 🎯 Ready

---

### Inmediatamente Después (2026-06-18 ~13:00): PILOTO COMERCIAL

**Restricciones de seguridad:**

```
Piloto FASE 1 (Limpio)
├─ 1 negocio partner (alto riesgo de reputación = máxima atención)
├─ 2 conductores confiables (pilotos internos o muy experimentados)
├─ 10-20 pedidos reales (no test data)
├─ Horas: 14:00 - 18:00 (ventana corta)
├─ Monitoreo: En vivo desde backend + admin panel
└─ Rollback: Listo si algo falla

Sin esta restricción:
├─ ❌ No escalas a múltiples negocidos
├─ ❌ No hagas publicidad
├─ ❌ No abras para "demo"
```

---

### Semana Siguiente: PHASE 2C (Finanzas)

```
Después de que el piloto complete 1-2 días sin problemas:
├─ Implementar cálculo de comisión 18%
├─ Implementar liquidaciones
├─ Implementar reportes financieros
├─ Test en staging (sin replicar piloto de GPS)
└─ Integración en piloto FASE 2
```

**Nota:** Para el piloto FASE 1, puedes calcular comisión manualmente o usar valor plano

---

## ✅ PHASE 2B Completion Criteria

Para que GPS sea apto para piloto, TODOS estos deben pasar:

```
1. P0: Consolidación
   ☐ grep -r "repartidores_activos" public/js/mapa* = 0 matches
   ☐ grep -r "repartidores_activos" routes/ = 0 matches
   ☐ git commit 1d492bb merged

2. P1: TTL + Cleanup
   ☐ Cloud Function executes every 60s
   ☐ Records > 120s old are deleted
   ☐ POST /driver-offline responds immediately
   ☐ No orphaned records in RTDB

3. P2: UI Stale Filtering
   ☐ Markers > 120s old are hidden
   ☐ Opacity gradient applied (color fades with age)
   ☐ Timestamp validation in frontend

4. Verificación Física
   ☐ Escenario 1 (aparece) PASS
   ☐ Escenario 2 (mueve) PASS
   ☐ Escenario 3 (desaparece) PASS
   ☐ Escenario 4 (reaparece) PASS
   ☐ Escenario 5 (stale) PASS
   ☐ Logs guardados y documentados

5. Documentación
   ☐ PHASE2B_PHYSICAL_VERIFICATION_REPORT.md existe
   ☐ Todos los 5 escenarios documentados con timestamps
   ☐ Logs incluidos
```

**Si alguno falla:** No proceder a piloto (rollback a phase2a-certified)

---

## 🎯 Piloto Comercial: Scope

### Incluir en FASE 1 del Piloto

```
✅ GPS (end-to-end)
✅ Aceptación de pedidos (repartidor recibe)
✅ Confirmación en ruta (estado EN_CAMINO)
✅ Confirmación entregado
✅ Basic panel admin (visualizar pedidos)
```

### Excluir de FASE 1 (para FASE 2)

```
❌ Finanzas (comisiones, liquidaciones, reportes)
❌ Chat soporte
❌ Ratings
❌ Multi-negocio
❌ Horarios especiales
```

---

## 📈 Métricas de Éxito del Piloto

```
FASE 1 (2026-06-18, 1-2 días)
─────────────────────────────────
Métrica                    Target      Status
Uptime backend            99%         
GPS update frequency      Every 30s   
Marker accuracy           < 20m error
Stale cleanup success     100%
Delivery completion       > 80%
Avg delivery time         < 45 min
Driver satisfaction       > 4/5
Admin experience          No crashes
```

**Si TODAS cumplen:** Proceder a FASE 2 (más pedidos, más conductores)

**Si alguna falla:** Analizar root cause y pushear hotfix

---

## 🏁 Decisión Final

**PHASE 2B es el bloqueador para iniciar piloto comercial.**

No hagas piloto sin GPS certificado en ambiente real con 2 teléfonos.

**Timeline realista:**

```
2026-06-17 09:00 - P0 ✅
2026-06-18 09:00 - P1+P2 + Verificación ✅
2026-06-18 13:00 - Piloto FASE 1 🎯
2026-06-19 - Analizar resultados
2026-06-20+ - Piloto FASE 2 o rollback
```

---

**Creado:** 2026-06-17 T11:15:00Z  
**Prioridad:** PHASE 2B > PHASE 2C > PHASE 3  
**Piloto:** Inmediatamente post PHASE 2B  
**Status:** Ready to execute
