# FASE 2A — Auditoría de Fuente Única (Checklist Ejecutable)

## Objetivo
Mapear quién escribe y quién lee cada entidad del sistema. Duración: 1 día.

---

## PASO 1: Mapeo de Escrituras — Backend (routes/)

### Tarea 1.1: `routes/admin.js`

**Preguntas:**
- [ ] ¿Qué endpoints escriben en RTDB?
- [ ] ¿A qué nodos escriben?
- [ ] ¿Hay transacciones atómicas?
- [ ] ¿Hay escrituras en Firestore también?

**Comandos de búsqueda:**

```bash
# Búsqueda 1: Dónde se escribe en RTDB
grep -n "set(" routes/admin.js
grep -n "update(" routes/admin.js
grep -n "transaction" routes/admin.js

# Búsqueda 2: Qué nodos
grep -n "getReference" routes/admin.js
grep -n "database().ref" routes/admin.js
```

**Resultado esperado:**
```
POST /api/admin/pedidos
  → escribe en: pedidos/${id}
  → estado inicial: "pendiente"
  
POST /api/admin/pedidos/:id/listo
  → escribe en: pedidos/${id} (actualiza estado)
  → escribe en: pedidos_para_reparto/${id} (copia)
  → transacción: sí/no
```

**Doc a crear:**
```markdown
## routes/admin.js

| Endpoint | Nodo RTDB | Nodo Firestore | Acción | Transacción |
|----------|-----------|---|--------|---|
| POST /pedidos | pedidos/ | — | Crear | No |
| POST /pedidos/:id/listo | pedidos/, pedidos_para_reparto/ | — | Update+Copy | Sí |
```

---

### Tarea 1.2: `routes/delivery.js`

**Preguntas:**
- [ ] ¿Qué endpoints escribe el driver?
- [ ] ¿Están protegidos por Auth?
- [ ] ¿Mueven pedidos entre nodos?
- [ ] ¿Actualizan capital?

**Comandos de búsqueda:**

```bash
grep -n "POST\|put\|update" routes/delivery.js | head -20
grep -n "pedidos_en_camino\|repartidores\|capital" routes/delivery.js
```

**Resultado esperado:**
```
POST /api/delivery/accept/:id
  → lee: pedidos_para_reparto/:id
  → escribe: pedidos_en_camino/:id
  → escribe: repartidores/:uid/pedido_activo
  → escribe: repartidores/:uid/capital/reserva (?)
  
POST /api/delivery/complete/:id
  → actualiza: pedidos/:id
  → actualiza: pedidos_en_camino/:id
  → elimina: pedidos_para_reparto/:id
  → escribe: repartidores/:uid/capital/ganancias
```

---

### Tarea 1.3: `routes/driver-routes.js` (o location routing)

**Preguntas:**
- [ ] ¿Dónde se reporta GPS?
- [ ] ¿Quién escribe `conductores_activos/`?
- [ ] ¿Hay validaciones?

**Comandos de búsqueda:**

```bash
grep -n "update-location\|gps\|conductores_activos" routes/*.js functions/*.js
```

---

### Tarea 1.4: `functions/index.js` (Cloud Functions)

**Preguntas:**
- [ ] ¿Hay triggers automáticos en RTDB?
- [ ] ¿Qué escriben a Firestore?
- [ ] ¿Hay escrituras duplicadas?

**Comandos de búsqueda:**

```bash
grep -n "database().ref\|onWrite\|onCreate\|onUpdate" functions/index.js | head -30
```

---

## PASO 2: Mapeo de Lecturas — App

### Tarea 2.1: Android Driver (`app/src/main/java/com/nelly/driver/`)

**Preguntas:**
- [ ] ¿Qué nodos escucha?
- [ ] ¿Hay listeners múltiples?
- [ ] ¿Cómo sincroniza a Room (SQLite)?

**Comandos de búsqueda:**

```bash
# En VS Code, buscar en archivo:
find app/src/main/java -name "*.kt" -type f

# Patrones a buscar:
grep -r "addValueEventListener\|addChildEventListener" app/src/main/java
grep -r "getReference" app/src/main/java
grep -r "pedidos_para_reparto\|pedidos_en_camino\|repartidores_activos" app/src/main/java
```

**Resultado esperado (por archivo):**
```
PedidoSyncModule.kt
  → listen: "pedidos_para_reparto/"
  
DriverRepository.kt
  → listen: "repartidores_activos/$uid"
  
LocationRepository.kt
  → write: "conductores_activos/$uid"
```

---

### Tarea 2.2: Panel Admin (`public/panel.html`)

**Preguntas:**
- [ ] ¿Qué nodos lee?
- [ ] ¿Usa RealTime DB o Firestore?
- [ ] ¿Hay queries complejas?

**Comandos de búsqueda:**

```bash
grep -n "firebase\|getReference\|collection\|doc\|query" public/panel.html | head -30
```

**Resultado esperado:**
```
Lee: pedidos/        (todos los pedidos)
Lee: pedidos_en_camino/ (en ruta)
Lee: liquidaciones/  (historial)
```

---

### Tarea 2.3: Cocina (`public/cocina.html`)

**Preguntas:**
- [ ] ¿Qué ve la cocina?
- [ ] ¿Puede escribir?

**Resultado esperado:**
```
Lee: pedidos/        (pendientes + listos)
Lee: pedidos_en_camino/ (para saber qué está en camino)
Escribe: ningún nodo (solo admin puede marcar listo)
```

---

## PASO 3: Tablas de Resultado

### Tabla 1: RTDB — Quién escribe cada nodo

| Nodo | Escritor | Auth Check | Ubicación | Frecuencia |
|------|----------|---|----------|---|
| `pedidos/` | Backend (admin.js) | Admin | routes/admin.js | On demand |
| `pedidos_para_reparto/` | Backend (admin.js) | Admin | routes/admin.js | On demand |
| `pedidos_en_camino/` | Backend (delivery.js) | Driver Auth | routes/delivery.js | On demand |
| `repartidores_activos/` | Driver App | Auth | android/LocationRepository | Real-time |
| `repartidores_$uid/capital` | Backend (delivery.js) | System | routes/delivery.js | On accept/complete |
| `conductores_activos/` | Driver App | Auth | android/LocationRepository | Every 5-10s |

---

### Tabla 2: RTDB — Quién lee cada nodo

| Nodo | Lector | Propósito | Ubicación |
|------|--------|----------|-----------|
| `pedidos/` | Admin UI | Ver todos | panel.html |
| `pedidos/` | Cocina UI | Ver por procesar | cocina.html |
| `pedidos_para_reparto/` | Driver App | Ver disponibles | android/PedidoSyncModule |
| `pedidos_en_camino/` | Cocina UI | Ver en ruta | cocina.html |
| `pedidos_en_camino/` | Admin UI | Monitoreo | panel.html |
| `repartidores_activos/` | Backend | Validar deuda | routes/delivery.js |
| `conductores_activos/` | Backend API | GPS | routes/driver-routes.js |

---

### Tabla 3: Firestore — Patrones

| Colección | Escribe | Lee | Patrón |
|-----------|---------|-----|--------|
| `historical_orders` | Backend (async) | Admin (reportes) | Append-only |
| `liquidations_history` | Backend (nightly) | Admin (auditoría) | Append-only |
| `user_profiles` | ? | ? | ? |

---

## PASO 4: Identificar Problemas

### Checklist de Red Flags

- [ ] ¿Hay escrituras en RTDB Y Firestore al mismo tiempo en mismo evento?
- [ ] ¿Hay listeners múltiples en el mismo nodo desde la app?
- [ ] ¿Hay writes desde app directamente a RTDB (sin pasar por Backend)?
- [ ] ¿Hay transacciones inconsistentes (falla 1 de 3 writes)?
- [ ] ¿Hay delays entre actualización en RTDB y sincronización a Firestore?
- [ ] ¿Hay campos que se escriben en múltiples lugares?

---

## PASO 5: Documentar Hallazgos

### Formato de reporte

```markdown
# FASE 2A — Auditoría de Fuente Única — HALLAZGOS

## Resumen
- Archivos auditados: N
- Endpoints identificados: N
- Listeners encontrados: N
- Red flags: N

## Escrituras por nodo

### ✅ Correcto
- `pedidos/` - Solo Backend (admin.js)
- `pedidos_en_camino/` - Solo Backend (delivery.js)

### ⚠️ A revisar
- `repartidores_activos/` - Escribe app Y sistema?
- Duplicación: RTDB + Firestore simultáneamente?

## Recomendaciones para FASE 2B
1. ...
2. ...
```

---

## Ejecución

### Timeline (1 día)

| Hora | Tarea |
|------|-------|
| 09:00 | Tarea 1.1-1.4 (Backend writes) |
| 11:00 | Tarea 2.1-2.3 (App reads) |
| 13:00 | Completar Tablas 1-3 |
| 14:00 | Identificar red flags |
| 15:00 | Documentar hallazgos |
| 16:00 | **Reporte final listo** |

---

## Resultado esperado

Un documento con:
1. Mapa completo de flujo de datos
2. Identificación de escrituras duplicadas (si las hay)
3. Propuesta de arquitectura para FASE 2B
4. Plan de migración de datos (si es necesario)

**Cuando FASE 2A esté completada:**

```
════════════════════════════════════════
FASE 2B puede iniciar con claridad total
════════════════════════════════════════
```
