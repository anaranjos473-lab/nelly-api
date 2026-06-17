# DATA_FLOW_MATRIX — Quién Escribe, Quién Lee

## Propósito

Mapa completo de flujo de datos en Nelly. Una sola fuente de verdad para cada nodo.

**Objetivo:** Eliminar ambigüedad. Si algo falla, saber exactamente dónde y quién lo escribió.

---

## PLANTILLA DE AUDITORÍA

Completar después del testing de PED_TEST_REAL_001.

### Tabla 1: RTDB Nodos Operativos

| Nodo | Escribe | Lee | Patrón | Actualización | Comentario |
|------|---------|-----|--------|---|---|
| `pedidos/` | ? | ? | Master/Queue | ? | ¿Quién crea inicialmente? |
| `pedidos_para_reparto/` | ? | ? | Queue | ? | ¿Quién copia? ¿Cuándo? |
| `pedidos_en_camino/` | ? | ? | Status | ? | ¿Quién mueve a aquí? |
| `repartidores_activos/` | ? | ? | Status | Real-time | ¿GPS actualiza directo? |
| `repartidores/$uid/pedido_activo` | ? | ? | Status | On demand | ¿Quién establece? |
| `repartidores/$uid/capital/` | ? | ? | Financial | Transacción | ¿Backend solo? |
| `conductores_activos/` | ? | ? | Tracking | Real-time | ¿GPS directo a aquí? |
| `liquidaciones/` | ? | ? | Historical | Daily | ¿Job automático? |

---

### Tabla 2: Firestore Colecciones

| Colección | Escribe | Lee | Patrón | Comentario |
|-----------|---------|-----|--------|---|
| `orders` | ? | ? | ? | ¿Existe? ¿Vacía? |
| `orders_history` | ? | ? | ? | ¿Réplica de pedidos/? |
| `drivers` | ? | ? | ? | ¿Perfil del driver? |
| `metrics` | ? | ? | ? | ¿Dashboard analytics? |
| `audit_log` | ? | ? | ? | ¿Todas las transacciones? |

---

### Tabla 3: Escritores (¿Quién puede escribir dónde?)

| Escritor | pedidos/ | pedidos_para_reparto/ | pedidos_en_camino/ | repartidores_activos/ | capital/ |
|----------|---|---|---|---|---|
| Admin (panel) | ? | ? | ✗ | ✗ | ✗ |
| Cocina (panel) | ? | ? | ✗ | ✗ | ✗ |
| Driver (app) | ✗ | ✗ | ✗ | ? | ✗ |
| Backend (API) | ? | ? | ? | ? | ? |
| Cloud Functions | ? | ? | ? | ? | ? |

---

### Tabla 4: Lectores (¿Quién necesita leer dónde?)

| Lector | pedidos/ | pedidos_para_reparto/ | pedidos_en_camino/ | repartidores_activos/ | capital/ |
|--------|---|---|---|---|---|
| Admin (panel) | ? | ? | ? | ? | ? |
| Cocina (panel) | ? | ? | ? | ✗ | ✗ |
| Driver (app) | ✗ | ? | ✗ | ✗ | ? |
| Backend (server) | ? | ? | ? | ? | ? |

---

### Tabla 5: Bridge Firestore ↔ RTDB

| Dirección | Existe | Mecanismo | Delay | Comentario |
|-----------|--------|-----------|-------|---|
| RTDB → Firestore | ? | Cloud Functions / Backend | ? | ¿Histórico? |
| Firestore → RTDB | ? | Cloud Functions / Backend | ? | ¿Operativo? |
| Backend ↔ RTDB | ? | ? | ? | ¿Replicador? |
| Backend ↔ Firestore | ? | ? | ? | ¿Qué escribe? |

---

### Tabla 6: Estados de Pedido

| Estado | Definido en | Transiciones desde | Transiciones hacia | Validador |
|--------|---|---|---|---|
| PENDIENTE | ? | — | EN_COCINA? | Backend |
| EN_COCINA | ? | PENDIENTE | LISTO? | Backend |
| LISTO | ? | EN_COCINA | ACEPTADO? | Driver |
| ACEPTADO | ? | LISTO | EN_CAMINO | Driver |
| EN_CAMINO | ? | ACEPTADO | ENTREGADO | Driver |
| ENTREGADO | ? | EN_CAMINO | — | Backend |
| CANCELADO | ? | * | — | Admin |

---

### Tabla 7: Duplicación de Datos

| Dato | Existe en RTDB | Existe en Firestore | Sincronizado | Riesgo |
|------|---|---|---|---|
| Pedido (metadata) | ? | ? | ? | ¿Inconsistencia? |
| Pedido (estado) | ? | ? | ? | ¿Caché stale? |
| Driver (capital) | ? | ? | ? | ¿Dinero perdido? |
| GPS (ubicación) | ? | ? | ? | ¿Duplicado innecesario? |
| Histórico | ? | ? | ? | ¿Dónde es la verdad? |

---

## Checklist de Investigación

Completar después de auditar el código:

### Backend (Node.js)
- [ ] `routes/admin.js` - Analizar cada POST que escribe RTDB
- [ ] `routes/delivery.js` - Analizar transacciones atómicas
- [ ] `functions/` - Listar todos los triggers
- [ ] Buscar: `admin.database().ref()` - Contar instancias
- [ ] Buscar: `admin.firestore()` - Contar instancias
- [ ] Buscar: duplicaciones de escritura (RTDB + Firestore en mismo handler)

### Android Driver
- [ ] `PedidoRepository.kt` - ¿Dónde escucha?
- [ ] `DriverRepository.kt` - ¿Dónde escribe GPS?
- [ ] `LocationRepository.kt` - ¿Cada cuánto? ¿A dónde?
- [ ] Buscar: `getReference()` - Listar todos los nodos
- [ ] Buscar: `addValueEventListener` - Contar listeners

### Panel Admin
- [ ] `public/panel.html` - Qué lee
- [ ] Firebase imports - ¿RTDB o Firestore?
- [ ] Query principal - ¿De dónde obtiene pedidos?

### Panel Cocina
- [ ] `public/cocina.html` - Qué lee
- [ ] Firebase imports - ¿RTDB o Firestore?
- [ ] Query principal - ¿De dónde obtiene pedidos?

---

## Preguntas Críticas a Responder

### Q1: ¿De dónde lee Admin?
```
☐ De RTDB (pedidos/)
☐ De Firestore (orders collection)
☐ De ambas (PELIGRO: inconsistencia)
☐ De Backend API (OK: fuente única)
```

### Q2: ¿De dónde lee Cocina?
```
☐ De RTDB (pedidos/)
☐ De Firestore (orders collection)
☐ De ambas (PELIGRO: inconsistencia)
☐ De Backend API (OK: fuente única)
```

### Q3: ¿Cuándo se sincroniza Firestore?
```
☐ En tiempo real (duplicación innecesaria)
☐ Con delay (asincrónico, LISTO)
☐ No se sincroniza (PELIGRO: perdida de datos)
☐ Solo en eventos específicos (OK)
```

### Q4: ¿Quién definió los estados válidos?
```
☐ Backend (centralizado)
☐ App (descentralizado, PELIGRO)
☐ Sin definición (PELIGRO)
☐ En database.rules.json (DB-level validation)
```

### Q5: ¿Hay validación de transiciones?
```
☐ PENDIENTE → LISTO → ACEPTADO → EN_CAMINO → ENTREGADO (correcto)
☐ Se permite cualquier transición (PELIGRO)
☐ No hay validación (PELIGRO)
```

---

## Red Flags

Si encuentras cualquiera de estos:

🚨 **RED FLAG 1:** Mismo dato escribiendo desde 2 lugares
```
Ejemplo: pedidos/{id}/estado escrito por Backend Y por Cloud Function
Acción: Consolidar a UNA fuente
```

🚨 **RED FLAG 2:** Listener sin límite de datos
```
Ejemplo: addValueEventListener() sin query filter
Acción: Agregar `.limitToFirst(50)` o `.orderByChild()`
```

🚨 **RED FLAG 3:** Firestore replicando RTDB
```
Ejemplo: Cloud Function copia todo de RTDB a Firestore cada segundo
Acción: Cambiar a escritura directa desde Backend
```

🚨 **RED FLAG 4:** Estados indefinidos
```
Ejemplo: pedidos pueden estar en UNKNOWN, WEIRD, LOST
Acción: Enum de estados válidos
```

🚨 **RED FLAG 5:** Transacciones parciales
```
Ejemplo: Escribe a pedidos/ pero no a repartidores/capital
Acción: Usar transacción atómica de Backend
```

---

## Resultado Esperado

Cuando completes esta matriz:

```
═════════════════════════════════════════════════════════
Sabrás exactamente:
✓ Quién escribe cada dato
✓ Quién lo lee
✓ Cuándo se sincroniza
✓ Dónde está la verdad
═════════════════════════════════════════════════════════
```

Si encuentras inconsistencias:

```
═════════════════════════════════════════════════════════
Eso es lo que debe corregirse en FASE 2B
═════════════════════════════════════════════════════════
```

---

## Timeline

**Cuando completar:**
- PASO 1: Después de certificar PED_TEST_REAL_001
- PASO 2: Mientras se audita código (paralelamente)
- PASO 3: Antes de FASE 2B

**Duración esperada:** 1 día (4-6 horas)

**Responsable:** Auditoría de código + investigación de datos

**Resultado:** Este documento completamente lleno = FASE 2A completada
