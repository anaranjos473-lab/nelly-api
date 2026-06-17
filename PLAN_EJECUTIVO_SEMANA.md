# PLAN EJECUTIVO SEMANA — Junio 17-21, 2026

## Cambio de Enfoque

```
De:     Agregar funciones y arreglar bugs
A:      Validar arquitectura de datos y escalar con seguridad
```

---

## NO Hacer Esta Semana

```
❌ Asignación automática de pedidos
❌ IA de despacho
❌ Nuevos dashboards
❌ Nuevas funciones
❌ Optimización de performance (aún)
❌ Expansión de mercado
```

**Razón:** El núcleo debe ser sólido primero.

---

## SÍ Hacer Esta Semana

**5 Puntos críticos. En este orden:**

---

## PUNTO 1: Certificar Operación Completa

**Cuándo:** Mañana, 10:00-10:30  
**Qué:** Pedido real PED_TEST_REAL_001 de punta a punta  
**Documento:** `MANANA_PLAN_ACCION.md`

### Pasos

```
10:00  Admin crea
         → Validar: pedidos/PED_TEST_REAL_001 existe

10:05  Cocina marca listo
         → Validar: pedidos_para_reparto/PED_TEST_REAL_001 existe

10:10  Driver sincroniza
         → Validar: Aparece en Misiones Activas

10:15  Driver acepta
         → Validar: capital reservado

10:18  GPS reporta
         → Validar: conductores_activos/ actualizado

10:20  Driver entrega
         → Validar: estado = "entregado"

10:25  Admin verifica cierre
         → Validar: histórico registrado

10:30  RESULTADO
         ✅ Si todos los pasos pasaron: PUNTO 1 COMPLETADO
         ❌ Si alguno falla: Debug hasta solucionarlo
```

### Go/No-Go

```
✅ Admin lo creó?      → Sí → Adelante
✅ Driver lo recibió?  → Sí → Adelante
✅ Driver lo entregó?  → Sí → Adelante
✅ Admin lo vio?       → Sí → PUNTO 1 CERTIFICADO
```

**Si alguno es "No":**
- No continuar con otros puntos
- Debuguear hasta que pasen todas
- Esto es el fundamento

---

## PUNTO 2: Auditar Firestore ↔ RTDB Bridge

**Cuándo:** Paralelamente con PUNTO 1 (después de pasar)  
**Duración:** 2-3 horas  
**Documento:** `FIRESTORE_RTDB_BRIDGE_AUDIT.md`

### Investigaciones

**[2a] Verificar eliminación de bridge:**
```bash
git log --all --full-history -- "*firestoreRtdbBridgeService*"
```

**[2b] Buscar reemplazo:**
```bash
grep -r "firestore()" functions/ | head -10
grep -r "database().ref()" functions/ | head -10
grep -r "admin.firestore()\|admin.database()" routes/ | head -10
```

**[2c] Mapear lecturas actuales:**
```
Admin Panel         → ¿Lee de RTDB o Firestore?
Cocina Panel        → ¿Lee de RTDB o Firestore?
Backend             → ¿Replica entre ambas?
```

**[2d] Resultado esperado:**

✅ **Opción A (ideal):**
```
Admin lee de: Backend API
Cocina lee de: Backend API
Driver lee de: Backend API
Backend es fuente única ✓
```

✅ **Opción B (aceptable):**
```
Cocina lee de: RTDB (operativo)
Admin lee de: RTDB (mismo operativo)
Firestore: solo histórico
Cloud Function replica con delay
```

❌ **Opción C (PELIGRO):**
```
Admin lee de: Firestore
Cocina lee de: RTDB
Sin bridge
INCONSISTENCIA ✗
```

---

## PUNTO 3: Construir DATA_FLOW_MATRIX

**Cuándo:** Después de PUNTO 2  
**Duración:** 3-4 horas  
**Documento:** `DATA_FLOW_MATRIX_TEMPLATE.md` (completado)

### Tabla Objetivo

| Nodo | Escribe | Lee | Patrón | Status |
|------|---------|-----|--------|--------|
| `pedidos/` | Backend | Admin, Cocina | Master | ? |
| `pedidos_para_reparto/` | Backend | Driver | Queue | ✅ |
| `pedidos_en_camino/` | Backend | Cocina, Admin | Status | ✅ |
| `repartidores_activos/` | Driver | Backend | GPS | ? |
| `repartidores/$uid/capital` | Backend | Driver | Financial | ✅ |

### Checklist

- [ ] Quién escribe `pedidos/`? (Solo Backend)
- [ ] Quién escribe `pedidos_para_reparto/`? (Solo Backend)
- [ ] Quién escribe `repartidores/$uid/capital`? (Solo Backend)
- [ ] ¿Hay transacciones atómicas? (SÍ requerido)
- [ ] ¿Hay duplicaciones? (NO requerido)
- [ ] ¿Hay listeners sin límite? (NO requerido)

### Red Flags

```
🚨 Múltiples escritores en el mismo nodo
🚨 Listeners sin query filter
🚨 Firestore y RTDB escribiendo el mismo dato simultáneamente
🚨 Estados indefinidos o mal validados
🚨 Transacciones parciales (falla una de N writes)
```

---

## PUNTO 4: Limpiar Dataset

**Cuándo:** Después de PUNTO 3  
**Duración:** 1-2 horas  
**Objetivo:** Separar QA / STAGING / PROD

### Acciones

**[4a] Identificar datos de prueba:**
```bash
# Buscar en RTDB
grep -r "AUTO_\|TEST_\|LIVE_" functions/ routes/ public/
```

**[4b] Separar datasets:**

```
QA Dataset:
├─ TEST_* (tests manuales)
├─ AUTO_* (tests automáticos)
└─ En RTDB: nelly-delivery-qa

STAGING Dataset:
├─ STAGING_* (pre-validación)
└─ En RTDB: nelly-delivery-staging

PRODUCTION Dataset:
├─ PED_* (datos reales)
└─ En RTDB: nelly-delivery
```

**[4c] Actualizar Firebase rules:**

```json
{
  "rules": {
    ".read": "root.child('environment').val() === 'prod' && auth != null",
    ".write": "root.child('environment').val() === 'prod' && auth != null",
    ".env": "prod"  // o qa, staging
  }
}
```

**[4d] Resultado:**
- [ ] QA limpio
- [ ] STAGING limpio
- [ ] PROD limpio (sin AUTO_/TEST_)
- [ ] Ambientes separados en Firebase

---

## PUNTO 5: Congelar Arquitectura

**Cuándo:** Al final de la semana  
**Duración:** 1 hora  
**Documento:** `ARCHITECTURE_FROZEN.md` (nuevo)

### Contenido Requerido

```markdown
# ARCHITECTURE FROZEN — Junio 21, 2026

## Decisión: Fuente Única de Verdad

BACKEND = Único escritor autorizado

## Componentes

1. RTDB (Operativo)
   - Datos en vivo
   - Drivers escriben GPS
   - Real-time sync
   - Límite: X MB/day reads

2. Firestore (Histórico)
   - Replica cada 1 minuto
   - Auditoría completa
   - No se borra
   - Acceso: Solo lectura desde Admin

3. Backend (Orquestador)
   - Transacciones atómicas
   - Validaciones
   - Autorización
   - Logging

## Restricciones

- Apps no escriben directamente a RTDB (solo GPS)
- Todas las transacciones pasan por Backend
- Firestore es réplica, no fuente
- Estados validados por Backend

## Commits

- f5ee5b9: PHASE 1 fixes
- 35c9b09: PHASE 2 Strategy
- [NUEVO]: ARCHITECTURE_FROZEN
```

---

## Checklist Semanal

### Lunes 17 (HOY)
- ✅ Documentos de evaluación creados
- ✅ Plan para mañana documentado

### Martes 18
- ⏳ PUNTO 1: Certificar PED_TEST_REAL_001 (10:00-10:30)
- ⏳ PUNTO 2: Auditar bridge (11:00-14:00)
- ⏳ PUNTO 3: DATA_FLOW_MATRIX (14:00-17:00)

### Miércoles 19
- ⏳ PUNTO 3: Completar matriz (si falta)
- ⏳ PUNTO 4: Limpiar dataset (09:00-11:00)
- ⏳ Documentar red flags encontrados

### Jueves 20
- ⏳ Resolver red flags
- ⏳ Validar que PUNTO 1 sigue pasando (regression test)

### Viernes 21
- ⏳ PUNTO 5: Congelar arquitectura
- ⏳ Documentación final
- ⏳ Git tags y commits finales

---

## Resultado Esperado

### Si Pasas Todos los Puntos

```
════════════════════════════════════════════════════
NELLY PASA DE PROTOTIPO A PLATAFORMA ESCALABLE
════════════════════════════════════════════════════

✅ Operación validada end-to-end
✅ Arquitectura de datos mapeada
✅ Fuente única de verdad definida
✅ Dataset limpio y segregado
✅ Escalabilidad fundacionada

Siguiente: FASE 2B (Optimización)
```

### Si Falla Algún Punto

```
════════════════════════════════════════════════════
PARAR AQUÍ — Debuguear hasta pasar

No avanzar sin que todos los 5 puntos estén ✅
════════════════════════════════════════════════════
```

---

## Decisión: Prioridad Absoluta

Esta semana, la inversión de tiempo es:

```
50% Validación operativa (PUNTO 1)
25% Auditoría de arquitectura (PUNTOS 2-3)
15% Limpieza de datos (PUNTO 4)
10% Documentación (PUNTO 5)

TOTAL: 0% nuevas funciones
```

**Por qué:** Nuevas funciones construidas sobre base débil = deuda técnica.

Mejor: Base sólida primero = escalabilidad desde el día 1.

---

## Documentos Clave

```
📄 EVALUACION_CRITICA_JUN17.md
   ↓ Evaluación actual del proyecto

📄 FIRESTORE_RTDB_BRIDGE_AUDIT.md
   ↓ Investigar bridge

📄 DATA_FLOW_MATRIX_TEMPLATE.md
   ↓ Mapear flujo completo

📄 MANANA_PLAN_ACCION.md
   ↓ Ejecutar mañana 10:00

📄 ARCHITECTURE_FROZEN.md
   ↓ Crear viernes (resultado final)
```

---

## Pregunta Final

¿Cuándo estarás listo para FASE 3 (asignación automática + IA)?

**Respuesta:**

```
Cuando los 5 puntos estén 100% completados
y pasados todos los tests de regresión.

Espera estimada: 1 semana

Resultado: Nelly listo para producción
```
