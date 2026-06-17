# ROADMAP FASE 2 — Estructura de Fuente Única

## Transición de Mentalidad

### FASE 1: "¿Compila?"
```
❓ ¿La app compila?
❓ ¿Se conecta a Firebase?
❓ ¿Dónde está el bug?
```

### FASE 2+: "¿Funciona el negocio?"
```
✓ ¿Admin lo creó?
✓ ¿Driver lo recibió?
✓ ¿Driver lo entregó?
✓ ¿Admin vio el cierre?
```

---

## FASE 1 Status: 95% Cerrada

**Evidencia completada:**
- ✅ APK compila
- ✅ Driver instalado en Motorola
- ✅ Admin crea pedidos
- ✅ Cocina recibe pedidos
- ✅ Cocina marca listos
- ✅ Listener correcto en Android
- ✅ Flujo documentado
- ✅ Tag phase1-freeze publicado

**Falta (certifica 100%):**
```
Pedido real PED_TEST_REAL_001
    ↓ Admin crea
    ↓ Cocina marca listo
    ↓ Driver recibe notificación
    ↓ Driver acepta
    ↓ GPS reporta
    ↓ Driver entrega
    ↓ pedidos_para_reparto queda vacío
    ↓ Histórico registra entrega
    
RESULTADO: FASE 1 CERTIFICADA
```

---

## NO hacer en FASE 2

❌ Asignación automática  
❌ IA de despacho  
❌ Antifraude avanzado  
❌ Nuevos agentes  
❌ Nuevos dashboards  
❌ Métricas complejas  

**Por qué:** Todos dependen de que la cadena principal sea 100% estable.

---

## FASE 2A — Auditoría de Fuente Única (1 día)

### Objetivo
Mapear exactamente quién escribe y quién lee cada entidad en el sistema.

### Tabla objetivo

| Entidad | Escribe | Lee | Nodo RTDB | Nodo Firestore |
|---------|---------|-----|-----------|---|
| Pedido (creado) | Admin Backend | App Cocina | `pedidos/` | `historical_orders` |
| Pedido (listo) | Admin Backend | App Driver | `pedidos_para_reparto/` | — |
| Pedido (en camino) | Driver Backend | App Admin | `pedidos_en_camino/` | — |
| Pedido (entregado) | Driver Backend | App Admin | — | `historical_orders` |
| Repartidor (activo) | Driver App | Backend | `repartidores_activos/` | — |
| Repartidor (capital) | Backend (transacción) | Driver App | `repartidores/$uid/capital` | — |
| GPS | Driver App | Backend | `conductores_activos/` | — |
| Liquidación | Backend (diario) | App Admin | `liquidaciones/` | `liquidations_history` |

### Archivos a revisar

```
routes/
  ├── admin.js           ← Escrituras de pedidos
  ├── delivery.js        ← Escrituras de aceptación/entrega
  ├── driver-routes.js   ← Escrituras de GPS/capital
  ├── cocina.js          ← Lecturas de pedidos
  └── ...

functions/
  ├── index.js           ← Triggers automáticos
  └── ...

app/src/main/java/com/nelly/driver/
  ├── data/repository/PedidoRepository.kt    ← Lee pedidos_para_reparto/
  ├── data/repository/DriverRepository.kt    ← Lee/escribe repartidores_activos/
  ├── data/repository/LocationRepository.kt  ← Escribe conductores_activos/
  └── ...

public/
  ├── panel.html         ← Lee pedidos/
  ├── cocina.html        ← Lee pedidos/ y pedidos_en_camino/
  └── ...
```

### Checklist de auditoría

- [ ] `pedidos/` — ¿Quién escribe? (Solo Backend/Admin)
- [ ] `pedidos_para_reparto/` — ¿Quién escribe? (Solo Backend, triggereado por Admin)
- [ ] `pedidos_en_camino/` — ¿Quién escribe? (Solo Backend, triggereado por Driver accept)
- [ ] `repartidores_activos/` — ¿Quién escribe? (Solo Driver App o Backend)
- [ ] `repartidores/$uid/capital/` — ¿Quién escribe? (Solo Backend, transacción atómica)
- [ ] `conductores_activos/` — ¿Quién escribe? (Solo Driver App, GPS)
- [ ] `liquidaciones/` — ¿Quién escribe? (Solo Backend, trigger nightly)
- [ ] Firestore — ¿Cuál es el patrón de escritura?
- [ ] ¿Hay escrituras duplicadas? (RTDB y Firestore al mismo tiempo)
- [ ] ¿Hay listeners múltiples en el mismo nodo?

---

## FASE 2B — Fuente Única de Verdad

### Arquitectura objetivo

```
Admin (panel.html)
    ↓
Backend (routes/admin.js)
    ↓ (TRANSACCIÓN ATÓMICA)
    ├→ RTDB: pedidos/
    ├→ RTDB: pedidos_para_reparto/
    └→ Firestore: historical_orders (async)
    
Cocina (cocina.html)
    ↓ (solo lectura)
    ├→ RTDB: pedidos/
    └→ RTDB: pedidos_en_camino/

Driver (Android App)
    ↓ (escribir GPS/ubicación)
    ├→ RTDB: repartidores_activos/
    ├→ RTDB: conductores_activos/
    └→ Backend API: POST /api/delivery/complete
    
Backend (transacciones nightly)
    ↓ (liquidar + archivar)
    ├→ RTDB: liquidaciones/
    ├→ Firestore: liquidations_history
    └→ Firestore: archived_orders
```

### Regla única

**Backend es la fuente de verdad.**

- Todas las transacciones pasan por Backend (no directo a RTDB desde app)
- RTDB para operativo (real-time, sincronización)
- Firestore solo para histórico/auditoría/reportes (escritura async, garantía eventual)

---

## FASE 2C — Cierre Operativo Completo

### Transiciones a registrar

Para cada pedido, capturar:

```
pedido_id = "PED_TEST_REAL_001"

Transición 1: Creado
  timestamp: 2026-06-17T10:00:00Z
  actor: admin@nelly.com
  acción: POST /api/admin/pedidos
  estado: "pendiente"
  nodo: pedidos/

Transición 2: Listo
  timestamp: 2026-06-17T10:05:00Z
  actor: admin@nelly.com (desde cocina.html)
  acción: POST /api/admin/pedidos/:id/listo
  estado: "LISTO"
  nodo: pedidos_para_reparto/

Transición 3: Aceptado
  timestamp: 2026-06-17T10:08:00Z
  actor: driver_uid (Firebase Auth token)
  acción: POST /api/delivery/accept/:id
  estado: "EN_CAMINO"
  nodo: pedidos_en_camino/

Transición 4: GPS reporta
  timestamp: 2026-06-17T10:09:00Z
  actor: driver_uid
  acción: POST /api/driver/update-location
  estado: "EN_CAMINO" (sin cambio)
  nodo: conductores_activos/ (actualiza)

Transición 5: Entregado
  timestamp: 2026-06-17T10:15:00Z
  actor: driver_uid
  acción: POST /api/delivery/complete/:id
  estado: "entregado"
  nodo: (movido a histórico)

Transición 6: Liquidado
  timestamp: 2026-06-17T23:00:00Z
  actor: system (nightly job)
  acción: trigger liquidation
  estado: "liquidado"
  nodo: liquidaciones/
```

### Validación esperada

```
✓ Tiempo total: ~15 minutos (creación a entrega)
✓ Todas las transiciones registradas
✓ Capital reservado en aceptación
✓ Capital liberado en entrega
✓ Comisión 18% calculada
✓ Auditoría completa en Firestore
✓ Admin ve cierre en dashboard
```

---

## Plan de Ejecución

### Mañana: FASE 1 Certificación

1. **10:00** - Crear pedido PED_TEST_REAL_001 desde Admin
2. **10:05** - Cocina marca listo
3. **10:10** - Driver abre app, ve en Misiones Activas
4. **10:15** - Driver acepta
5. **10:20** - Driver entrega
6. **10:25** - Verificar histórico y cierre
7. **10:30** - Documentar evidencia → FASE 1 CERTIFICADA

### Después: FASE 2A Auditoría

1. **11:00** - Revisar `routes/`, `functions/`, código Android
2. **13:00** - Completar tabla de Fuente Única
3. **14:00** - Generar reporte de escrituras duplicadas (si hay)
4. **15:00** - Documentar mejoras necesarias para FASE 2B

---

## Indicador "Go/No-Go" para FASE 3

| Pregunta | Respuesta esperada |
|----------|---|
| ¿Admin lo creó? | Sí, timestamp registrado |
| ¿Driver lo recibió? | Sí, notificación reproducida |
| ¿Driver lo entregó? | Sí, estado "entregado" confirmado |
| ¿Admin vio el cierre? | Sí, histórico y capital actualizados |

Cuando las 4 respuestas sean "Sí":

```
════════════════════════════════════════
FASE 1: CERTIFICADA
FASE 2A: INICIA AUDITORÍA
════════════════════════════════════════
```

---

## Notas

- No agregar funciones nuevas hasta que FASE 2A esté completa
- Cada cambio en FASE 2B debe validarse contra el flujo completo
- Documentación es parte del criterio de aceptación
- Firestore será crítico para auditoría y compliance
