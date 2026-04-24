# Agente Asignador - Backend Implementación (Sin Cloud Functions)

## Resumen

Se implementó el **Agente Asignador** directamente en [app.js](app.js) como:
1. **Endpoint HTTP**: `POST /api/delivery/assign-order`
2. **Listener automático**: En `pedidos_para_reparto` que dispara asignación al crear pedido

---

## 1. ENDPOINT MANUAL: `/api/delivery/assign-order`

### Descripción
Endpoint protegido que permite asignar un pedido manualmente a un repartidor disponible.

### Autenticación
- **Requiere**: Token de admin (email autorizado en `PANEL_ADMIN_EMAILS`)
- **Header**: `Authorization: Bearer {idToken}`

### Request

```bash
POST https://nelly-api-8lh1.onrender.com/api/delivery/assign-order
Content-Type: application/json
Authorization: Bearer {idToken}

{
  "pedidoId": "pedido_123"
}
```

### Response (Exitosa)

```json
{
  "ok": true,
  "pedidoId": "pedido_123",
  "repartidor_uid": "driver_001",
  "repartidor_nombre": "Carlos López",
  "repartidor_nivel": "ORO",
  "distancia_metros": 1250,
  "candidatos_count": 3,
  "estado_asignacion": "ASIGNADO"
}
```

### Response (Error)

```json
{
  "error": "No hay repartidores disponibles en el área",
  "estado_asignacion": "NO_DISPONIBLES",
  "candidatos_count": 0,
  "pedidoId": "pedido_123"
}
```

### Estados de Error

| Error | HTTP | Significado |
|-------|------|-------------|
| `pedidoId es requerido` | 400 | Falta el ID del pedido |
| `Pedido no encontrado` | 404 | No existe en `pedidos_para_reparto` |
| `Coordenadas del cliente inválidas` | 400 | Coords `lat/lng` inválidas |
| `No hay repartidores disponibles` | 404 | Sin candidatos en geo-fence |
| `Firebase Admin no inicializado` | 500 | Error de conexión interna |

---

## 2. LISTENER AUTOMÁTICO: Asignación al crear pedido

### Cómo funciona

```
┌─ Pedido creado en Firebase RTDB (pedidos_para_reparto/{id})
│
├─ Listener detecta child_added event
│
├─ Valida que no tenga repartidor_uid asignado aún
│
├─ Ejecuta lógica del asignador (filtros, Haversine, orden)
│
└─ Actualiza RTDB automáticamente (SIN necesidad de llamar endpoint)
```

### Logs esperados

```
[ASIGNADOR_AUTO][pedido_123] Disparando asignación automática...
[ASIGNADOR_AUTO][pedido_123] ✅ Asignado a driver_001 (Carlos López, ORO, 1.25km)
```

### Prevención de reasignación

La variable `pedidosYaAsignados` (Set) evita que un mismo pedido se asigne múltiples veces.

---

## 3. FLUJO COMPLETO: De pedido a asignación

```
┌─ Panel/App crea pedido en pedidos_para_reparto
│
├─ Firebase RTDB: Escribe pedido sin repartidor
│
├─ Listener app.js detecta cambio
│
├─ Valida coordenadas
│
├─ Consulta repartidores disponibles (RTDB)
│
├─ Aplica filtros:
│  ├─ isLibre === true
│  ├─ bloqueado_por_deuda === false
│  └─ currentLocation válida
│
├─ Calcula distancias (Haversine)
│
├─ Filtra por geo-fence (2km)
│
├─ Ordena por: distancia ascendente, nivel descendente
│
├─ Asigna al primero
│
├─ Escribe en RTDB:
│  ├─ pedidos_para_reparto/{id} → repartidor_uid, nivel, distancia
│  └─ pedidos_asignados/{id} → Nodo de notificación
│
└─ App del repartidor recibe notificación (si tiene FCM token)
```

---

## 4. DATOS PERSISTENTES

### Entrada: Pedido en `pedidos_para_reparto/{id}`

```json
{
  "id": "pedido_123",
  "cliente": {
    "nombre": "Juan Pérez",
    "coords": {
      "lat": 16.7575,
      "lng": -93.1096
    }
  },
  "monto": 250.50,
  "estado": "listo_para_reparto"
}
```

### Salida: Actualización en `pedidos_para_reparto/{id}`

```json
{
  "estado": "asignado",
  "repartidor_uid": "driver_001",
  "repartidor_nombre": "Carlos López",
  "repartidor_nivel": "ORO",
  "distancia_metros": 1250,
  "timestamp_asignacion": 1713868800000
}
```

### Salida: Nodo de notificación en `pedidos_asignados/{id}`

```json
{
  "pedido_id": "pedido_123",
  "repartidor_uid": "driver_001",
  "repartidor_nombre": "Carlos López",
  "repartidor_nivel": "ORO",
  "distancia_metros": 1250,
  "coordenadas_pedido": {
    "lat": 16.7575,
    "lng": -93.1096
  },
  "timestamp": 1713868800000,
  "estado": "PENDIENTE_ACEPTACION"
}
```

---

## 5. CONFIGURACIÓN

### Variables de entorno (ya configuradas)

```bash
PANEL_ADMIN_EMAILS=admin@nellydelivery.com,operaciones@nellydelivery.com
FIREBASE_DATABASE_URL=https://nelly-delivery-default-rtdb.firebaseio.com
```

### Jerarquía de niveles (en `app.js`)

```javascript
NIVEL_JERARQUIA = {
  BRONCE: 1,
  PLATA: 2,
  ORO: 3,
  DIAMANTE: 4
}

LIMITES_DEUDA_POR_NIVEL = {
  BRONCE: 300,
  PLATA: 500,
  ORO: 600,
  DIAMANTE: 900
}

GEO_FENCE_METROS = 2000  // 2km
```

---

## 6. FUNCIONES AUXILIARES

### `ordenarRepartidoresDisponibles(candidatos)`
Ordena por distancia ascendente, luego por nivel descendente.

### `distanciaMetrosHaversine(lat1, lng1, lat2, lng2)`
Calcula distancia exacta en metros entre dos coordenadas geográficas.

### `esCoordenadaValida(lat, lng)`
Valida que las coordenadas sean números finitos y estén en rango válido.

### `normalizarNivelRepartidor(nivelRaw)`
Normaliza el nivel a valores válidos (BRONCE, PLATA, ORO, DIAMANTE).

---

## 7. TESTING

### Test 1: Crear pedido y verificar asignación automática

```bash
# 1. Crear pedido en RTDB (manualmente o con script)
curl -X POST https://nelly-api-8lh1.onrender.com/api/admin/pedidos/manual \
  -H "Authorization: Bearer {idToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_nombre": "Test Cliente",
    "cliente_coords_lat": 16.7575,
    "cliente_coords_lng": -93.1096,
    "monto": 250
  }'

# 2. Revisar logs en Render
# [ASIGNADOR_AUTO][pedido_123] ✅ Asignado a ...

# 3. Verificar RTDB en Firebase Console
# pedidos_para_reparto/{id} debe tener: repartidor_uid, repartidor_nivel, distancia_metros
# pedidos_asignados/{id} debe existir con datos de notificación
```

### Test 2: Llamar endpoint manual

```bash
curl -X POST https://nelly-api-8lh1.onrender.com/api/delivery/assign-order \
  -H "Authorization: Bearer {idToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "pedidoId": "pedido_123"
  }'

# Respuesta esperada:
# {
#   "ok": true,
#   "repartidor_uid": "driver_001",
#   "repartidor_nombre": "Carlos López",
#   "repartidor_nivel": "ORO"
# }
```

---

## 8. MONITOREO

### Logs esperados en producción (Render)

```
[ASIGNADOR_AUTO][pedido_ABC] Disparando asignación automática...
[ASIGNADOR_AUTO][pedido_ABC] ✅ Asignado a uid_123 (Carlos López, ORO, 1.23km)
```

### Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| Listener no dispara | Firebase no inicializado | Verificar FIREBASE_ADMIN_JSON |
| "Sin repartidores" | Sin candidatos en 2km | Aumentar GEO_FENCE_METROS o crear repartidores de prueba |
| Coordenadas inválidas | Pedido sin `cliente.coords` | Validar estructura del pedido en panel |
| Múltiples asignaciones | Listener se ejecuta 2+ veces | Set `pedidosYaAsignados` debería evitarlo; revisar logs |

---

## 9. VENTAJAS vs Cloud Functions

✅ **Backend implementado**:
- Sin costo adicional (no requiere plan Blaze)
- Integración directa con app.js
- Debugging más fácil (logs en terminal)
- Control total sobre latencia y retry

---

## 10. PRÓXIMAS MEJORAS

- **FASE 2**: Reasignación automática si repartidor rechaza
- **FASE 3**: Notificaciones FCM al repartidor asignado
- **FASE 4**: Analytics de asignación (tiempo promedio, tasa de aceptación)
- **FASE 5**: Machine learning para predicción de tiempos

---

## 11. ARCHIVOS MODIFICADOS

- [app.js](app.js) — Endpoint + Listener agregados
- [functions/index.js](functions/index.js) — Cloud Function (alternativa)

---

**Estado**: OPERATIVO Y TESTEABLE ✅

