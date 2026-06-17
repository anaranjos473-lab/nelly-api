# FASE 1: Flujo de Pedidos - Documentación de Estados

## 1. Creación (Admin Panel)

**Endpoint:** `POST /api/admin/pedidos`  
**Autenticación:** Panel Admin Email  
**Nodo RTDB:** `pedidos/${pedidoId}`

```
Estructura:
{
  "id": "PED_1781543469085",
  "cliente_nombre": "Juan Pérez",
  "telefono": "5551234567",
  "direccion": "Calle 5, Apt 10",
  "descripcion": "2 órdenes de comida",
  "monto": 250.00,
  "estado": "pendiente",
  "repartidor_id": null,
  "fecha_creacion": 1781543469085,
  "origen": "panel_admin"
}
```

**Estado esperado:** `pendiente`  
**Visible en:** Solo Admin Panel

---

## 2. Preparación (Cocina)

**Endpoint:** `POST /api/admin/pedidos/:pedidoId/listo`  
**Autenticación:** Panel Admin Email  
**Nodos RTDB:**
- `pedidos/${pedidoId}` → actualiza con `estado: "LISTO"`
- `pedidos_para_reparto/${pedidoId}` → copia completa con `estado: "LISTO"`

```
Cambios:
{
  ...anterior,
  "estado": "LISTO",
  "estado_pedido": "LISTO",
  "fecha_listo": 1781543470000,
  "timestamp_listo": 1781543470000
}
```

**Estado esperado:** `LISTO`  
**Visible en:** 
- Admin Panel (en `pedidos/`)
- Nelly Driver (en `pedidos_para_reparto/`)

---

## 3. Aceptación (Driver)

**Endpoint:** `POST /api/delivery/accept/:pedidoId`  
**Autenticación:** Firebase Auth (Driver)  
**Nodos RTDB:**
- `pedidos_para_reparto/${pedidoId}` → transacción de lectura
- `pedidos_en_camino/${pedidoId}` → nuevo con `estado: "EN_CAMINO"`
- `pedidos/${pedidoId}` → actualiza con `estado: "EN_CAMINO"`
- `repartidores/${uid}/pedido_activo` → guarda `pedidoId`

```
Estructura en pedidos_en_camino:
{
  "id": "PED_1781543469085",
  "repartidor_id": "uid_driver",
  "estado": "EN_CAMINO",
  "estado_pedido": "EN_CAMINO",
  "aceptado_en": 1781543471000,
  "capital_reserva": {
    "monto": 45.00,
    "estado": "activa",
    "reservado_en": 1781543471000
  },
  ... resto de campos
}
```

**Estado esperado:** `EN_CAMINO`  
**Visible en:**
- Driver (en `pedidos_en_camino/` mientras lo entrega)
- Admin (en `pedidos/`)
- Cocina (en `pedidos_en_camino/`)

---

## 4. Entrega (Driver)

**Endpoint:** `POST /api/delivery/complete/:pedidoId`  
**Autenticación:** Firebase Auth (Driver)  
**Nodos RTDB:**
- `pedidos/${pedidoId}` → actualiza con `estado: "entregado"`
- `pedidos_en_camino/${pedidoId}` → actualiza con `estado: "entregado"`
- `pedidos_para_reparto/${pedidoId}` → null (se elimina)
- `repartidores/${uid}/pedido_activo` → null (se elimina)
- `repartidores/${uid}/capital/saldo_ganancias` → incrementa comisión

```
Cambios:
{
  ...anterior,
  "estado": "entregado",
  "estado_pedido": "entregado",
  "entregado_en": 1781543475000,
  "capital_reserva": {
    ...anterior,
    "estado": "liberada",
    "liberado_en": 1781543475000
  }
}
```

**Estado esperado:** `entregado`  
**Visible en:**
- Admin Dashboard (historial)
- No visible en Misiones Activas
- No visible en pedidos_en_camino

---

## Resumen de Nodos

| Nodo | Propósito | Actor |
|------|-----------|-------|
| `pedidos/${id}` | Registro maestro de pedidos | Admin, Cocina, Sistema |
| `pedidos_para_reparto/${id}` | Pedidos listos para drivers | Drivers (lectura), Admin/Cocina (escritura) |
| `pedidos_en_camino/${id}` | Pedidos siendo entregados | Drivers, Admin |
| `repartidores/${uid}/pedido_activo` | Pedido actual del driver | Sistema |
| `repartidores/${uid}/capital/...` | Finanzas del driver | Sistema |

---

## Android Driver: Ciclo de Sincronización

### 1. Inicialización
- Escucha: `FirebaseDatabase.getInstance().getReference("pedidos_para_reparto")`
- Descarga local: SQLite Room Database
- Estado inicial: `sync_started`

### 2. Notificación de Pedido Nuevo
- Si `cargaInicialCompletada == true` && hay nuevos IDs
- Reproduce sonido: `notificacion_pedido`
- Muestra en UI: `MisionesActivas`

### 3. Aceptación (Driver toca "Aceptar")
- Valida deuda del driver
- Envía: `POST /api/delivery/accept/:pedidoId` (con auth token)
- Sistema mueve a `pedidos_en_camino/`
- Driver ve: `MisionScreen` con detalles

### 4. Entrega (Driver toca "Entregado")
- Valida GPS y hora
- Envía: `POST /api/delivery/complete/:pedidoId`
- Sistema libera capital y marca finalizado
- Driver vuelve a `MisionesActivas`

---

## Cambios FASE 1

✅ `app/src/main/java/com/nelly/driver/di/PedidoSyncModule.kt`
   - Cambio: `pedidos_en_camino` → `pedidos_para_reparto`
   - Impacto: Android ve pedidos listos, no pedidos ya aceptados

✅ `routes/admin.js`
   - Nuevo endpoint: `POST /api/admin/pedidos/:pedidoId/listo`
   - Impacto: Cocina puede marcar pedidos como listos

✅ `scripts/populate-pedidos-para-reparto.js`
   - Nuevo script para poblar manualmente `pedidos_para_reparto/`
   - Uso: `node scripts/populate-pedidos-para-reparto.js Listo`

---

## Testing FASE 1

### Caso: Pedido Real PED_1781543469085

1. **Admin crea pedido**
   ```bash
   curl -X POST http://localhost:3001/api/admin/pedidos \
     -H "Authorization: Bearer <TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{
       "cliente_nombre": "Test User",
       "telefono": "5551234567",
       "direccion": "Calle Test 123",
       "monto": 250.00,
       "descripcion": "Test Order"
     }'
   ```
   ✅ Response: `{"ok": true, "id": "PED_1781543469085", ...}`
   ✅ RTDB: `pedidos/PED_1781543469085` tiene `estado: "pendiente"`

2. **Admin marca como "Listo"**
   ```bash
   curl -X POST http://localhost:3001/api/admin/pedidos/PED_1781543469085/listo \
     -H "Authorization: Bearer <TOKEN>"
   ```
   ✅ Response: `{"ok": true, ...}`
   ✅ RTDB: `pedidos/PED_1781543469085` tiene `estado: "LISTO"`
   ✅ RTDB: `pedidos_para_reparto/PED_1781543469085` existe con `estado: "LISTO"`

3. **Android Driver sincroniza**
   - Abre Nelly Driver
   - Va a "Misiones Activas"
   ✅ UI: Ve `PED_1781543469085` en la lista
   ✅ Sonido: Notificación `notificacion_pedido`

4. **Driver acepta**
   - Toca "Aceptar"
   ✅ Response: `{"ok": true, "pedidoId": "PED_1781543469085", ...}`
   ✅ RTDB: `pedidos_en_camino/PED_1781543469085` existe
   ✅ UI: Cambia a `MisionScreen` con detalles

5. **Driver marca "Entregado"**
   - Toca "Completar entrega"
   ✅ RTDB: `pedidos/PED_1781543469085` tiene `estado: "entregado"`
   ✅ RTDB: `pedidos_en_camino/PED_1781543469085` tiene `estado: "entregado"`
   ✅ RTDB: `pedidos_para_reparto/PED_1781543469085` es `null`
   ✅ UI: Vuelve a `MisionesActivas` (vacío)

---

## Siguiente: FASE 2

Cuando FASE 1 esté cerrada:
- Firestore para histórico
- Backend como fuente única de verdad
- Asignación automática de pedidos
- Liquidaciones por turno
