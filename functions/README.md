# Cloud Functions: Agente Asignador de Pedidos (FASE 1)

## Descripción General

Este módulo implementa el **Agente Asignador** en Firebase Cloud Functions, responsable de asignar automáticamente pedidos a repartidores disponibles basándose en:

1. **Filtros tácticos**: `isLibre === true`, `bloqueado_por_deuda === false`
2. **Geolocalización**: Distancia de 2km (Haversine)
3. **Jerarquía de niveles**: BRONCE → PLATA → ORO → DIAMANTE

## Estructura de Archivos

```
functions/
├── package.json           # Dependencias y configuración
├── index.js              # Función principal y lógica
└── .gitignore            # Archivos a excluir de git
```

## Cloud Function: `asignadorPedidos`

### Trigger
- **Tipo**: Firestore document create
- **Colección**: `pedidos_activos`
- **Activación**: Al crear un nuevo documento en pedidos_activos

### Flujo de Ejecución

```
┌─ Evento: Nuevo pedido en pedidos_activos
│
├─ PASO 1: Validar coordenadas del pedido
│  └─ Si inválidas → ERROR_COORDS_INVALIDAS
│
├─ PASO 2: Consultar repartidores disponibles (RTDB)
│
├─ PASO 3: Filtros tácticos
│  ├─ isLibre === true
│  ├─ bloqueado_por_deuda === false
│  └─ currentLocation válida
│
├─ PASO 4: Calcular distancia (Haversine)
│  └─ Filtrar por geo-fence (2km)
│
├─ PASO 5: Jerarquía de niveles
│  ├─ Ordenar por distancia ascendente
│  ├─ En caso de empate, por nivel descendente (DIAMANTE > ORO > PLATA > BRONCE)
│  └─ Seleccionar el primero
│
├─ PASO 6: Escribir asignación
│  ├─ Actualizar Firestore (pedidos_activos)
│  └─ Crear nodo RTDB (pedidos_asignados)
│
└─ PASO 7: Notificar al repartidor
   └─ Enviar mensaje FCM si tiene token disponible
```

### Datos de Entrada (Firestore - pedidos_activos)

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
  "estado": "ACTIVO",
  "createdAt": 1234567890
}
```

### Datos de Salida (Firestore - pedidos_activos actualizado)

```json
{
  "estado_asignacion": "ASIGNADO",
  "repartidor_uid": "driver_001",
  "repartidor_nombre": "Carlos López",
  "repartidor_nivel": "ORO",
  "distancia_metros": 1250,
  "candidatos_count": 3,
  "timestamp_asignacion": 1234567890
}
```

### Datos de Salida (RTDB - pedidos_asignados)

```json
{
  "pedidos_asignados": {
    "pedido_123": {
      "pedido_id": "pedido_123",
      "repartidor_uid": "driver_001",
      "repartidor_nombre": "Carlos López",
      "repartidor_nivel": "ORO",
      "distancia_metros": 1250,
      "coordenadas_pedido": { "lat": 16.7575, "lng": -93.1096 },
      "timestamp": 1234567890,
      "estado": "PENDIENTE_ACEPTACION"
    }
  }
}
```

## Jerarquía de Niveles

```javascript
NIVEL_JERARQUIA = {
  BRONCE: 1,
  PLATA: 2,
  ORO: 3,
  DIAMANTE: 4
}
```

**Lógica de selección**:
- Si hay 2+ repartidores a igual distancia, elige el de nivel más alto.
- Ejemplo: A 500m hay un BRONCE y un ORO → Se asigna al ORO.

## Fórmula de Haversine

Implementada en `distanciaMetrosHaversine(lat1, lng1, lat2, lng2)`:

```
R = 6.371.000 metros (radio Tierra)
Δp = (lat2 - lat1) × π/180
Δλ = (lng2 - lng1) × π/180
a = sin²(Δp/2) + cos(lat1) × cos(lat2) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1-a))
distancia = R × c
```

## Filtros Tácticos

### isLibre (disponibilidad)
- `true`: Repartidor puede recibir pedidos
- `false`: Repartidor ocupado, excluido de asignación

### bloqueado_por_deuda (límite de crédito)
- `false`: Repartidor con deuda dentro del límite permitido
- `true`: Repartidor en mora, no puede recibir pedidos

```javascript
LIMITES_DEUDA_POR_NIVEL = {
  BRONCE: 300,
  PLATA: 500,
  ORO: 600,
  DIAMANTE: 900
}
```

## Geo-Fence

- **Rango máximo**: 2.000 metros (2 km)
- Repartidores fuera de este rango son excluidos automáticamente

## Funciones Auxiliares

### `distanciaMetrosHaversine(lat1, lng1, lat2, lng2)`
Calcula distancia en metros entre dos coordenadas geográficas.

### `esCoordenadaValida(lat, lng)`
Valida que las coordenadas sean números finitos y estén en rangos válidos.

### `ordenarRepartidores(repartidores)`
Ordena por distancia ascendente, luego por nivel descendente.

## Instalación y Deploy

### Instalación local
```bash
cd functions
npm.cmd install
```

### Validar
```bash
npm run deploy -- --dry-run
```

### Desplegar
```bash
npm run deploy
```

### Monitorear
```bash
npm run logs
```

### Pruebas en emulador
```bash
npm run serve
```

Luego visitar: `http://localhost:5001/nelly-delivery/us-central1/testAsignador`

## Pruebas

### HTTP Endpoint: `testAsignador`

Disponible solo en desarrollo (NODE_ENV != 'production'):

```
GET /testAsignador
```

**Respuesta exitosa**:
```json
{
  "success": true,
  "mensaje": "Pedido de prueba creado",
  "pedidoId": "test_asignador_1234567890"
}
```

## Logs y Debugging

Ejemplo de logs esperados:

```
[ASIGNADOR][pedido_123] Nuevo pedido detectado: {...}
[ASIGNADOR][pedido_123] Total repartidores en BD: 15
[ASIGNADOR][pedido_123] Candidatos dentro del geo-fence: 3
[ASIGNADOR][pedido_123] Asignado a: driver_001 (Carlos López, ORO, 1.25km)
[ASIGNADOR][pedido_123] ✅ Asignación completada exitosamente
```

## Errores Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| `ERROR_COORDS_INVALIDAS` | Coordenadas del cliente inválidas | Validar datos de entrada en panel/app |
| `NO_DISPONIBLES` | Sin repartidores en geo-fence | Verificar ubicación y estado de repartidores |
| `ERROR_INTERNO` | Excepción no controlada | Revisar logs de Firebase en Console |

## Configuración Requerida

En `firebase.json`:
```json
{
  "functions": [
    {
      "source": "functions",
      "codebase": "default"
    }
  ]
}
```

En Variables de Entorno (Firebase Console o .env local):
- `NODE_ENV`: "production" o "development"
- Credenciales de Firebase Admin (automáticas en Firebase Hosting)

## Próximas Fases

- **FASE 2**: Reasignación automática si repartidor rechaza o timeout
- **FASE 3**: Notificaciones en tiempo real a panel de cocina
- **FASE 4**: Analytics y métricas de asignación
- **FASE 5**: Algoritmo de machine learning para predicción de tiempos

## Mantenimiento

- Revisar logs semanalmente para detectar patrones de rechazo
- Ajustar `GEO_FENCE_METROS` según densidad de repartidores
- Monitorear tiempos de asignación (p95, p99)
- Validar que no hay repartidores "atrapados" en estado isLibre

## Referencias

- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
