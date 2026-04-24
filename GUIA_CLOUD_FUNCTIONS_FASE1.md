# GUÍA: Cloud Functions - Agente Asignador FASE 1

## ¿Qué se implementó?

Un sistema automático en Firebase Cloud Functions que asigna pedidos a repartidores disponibles basándose en:
- **Disponibilidad**: Solo repartidores con `isLibre === true`
- **Crédito**: Excluyendo `bloqueado_por_deuda === true`
- **Geolocalización**: Máximo 2km de distancia (Haversine)
- **Jerarquía**: En empate de distancia, elige por nivel (ORO > PLATA > BRONCE)

---

## Estructura de Archivos

```
functions/
├── index.js              ← Cloud Function principal (asignadorPedidos)
├── package.json          ← Dependencias
├── .gitignore
├── node_modules/         ← firebase-admin, firebase-functions
└── README.md             ← Documentación detallada
```

---

## Cómo Funciona

### Trigger
- **Escucha**: Colección `pedidos_activos` en Firestore
- **Activación**: Cuando se crea un nuevo documento (nuevo pedido)

### Flujo (7 pasos)
1. Valida coordenadas del cliente
2. Consulta repartidores en RTDB
3. Filtra por `isLibre === true` y `bloqueado_por_deuda === false`
4. Calcula distancia con Haversine
5. Excluye fuera del geo-fence (2km)
6. Ordena por distancia, luego por nivel
7. Asigna al primero y notifica por FCM

### Salida
**Firestore (pedidos_activos)**:
```json
{
  "estado_asignacion": "ASIGNADO",
  "repartidor_uid": "driver_001",
  "repartidor_nombre": "Carlos López",
  "repartidor_nivel": "ORO",
  "distancia_metros": 1250,
  "candidatos_count": 3
}
```

**RTDB (pedidos_asignados/{id})**:
```json
{
  "repartidor_uid": "driver_001",
  "repartidor_nombre": "Carlos López",
  "repartidor_nivel": "ORO",
  "distancia_metros": 1250,
  "estado": "PENDIENTE_ACEPTACION"
}
```

---

## Niveles y Jerarquía

```
DIAMANTE (4) > ORO (3) > PLATA (2) > BRONCE (1)
```

**Límites de deuda por nivel:**
- BRONCE: $300
- PLATA: $500
- ORO: $600
- DIAMANTE: $900

---

## Desplegar a Firebase

### Paso 1: Instalar dependencias (si no lo hizo)
```powershell
cd functions
npm.cmd install
```

### Paso 2: Validar
```powershell
npm run deploy -- --dry-run
```

### Paso 3: Desplegar
```powershell
npm run deploy
```

### Paso 4: Monitorear logs
```powershell
npm run logs
```

---

## Pruebas Locales

### Emulador
```powershell
npm run serve
```

Luego visitar: `http://localhost:5001/nelly-delivery/us-central1/testAsignador`

(Solo disponible en desarrollo, NODE_ENV != 'production')

---

## Logs Esperados

```
[ASIGNADOR][pedido_123] Nuevo pedido detectado: {...}
[ASIGNADOR][pedido_123] Total repartidores en BD: 15
[ASIGNADOR][pedido_123] Candidatos dentro del geo-fence: 3
[ASIGNADOR][pedido_123] Asignado a: driver_001 (Carlos López, ORO, 1.25km)
[ASIGNADOR][pedido_123] ✅ Asignación completada exitosamente
```

---

## Errores Comunes

| Estado | Significado |
|--------|-------------|
| `ASIGNADO` | ✅ Éxito, repartidor asignado |
| `ERROR_COORDS_INVALIDAS` | ❌ Coordenadas del cliente no son válidas |
| `NO_DISPONIBLES` | ⚠️ Sin repartidores en geo-fence |
| `ERROR_INTERNO` | ❌ Error crítico, revisar logs |

---

## Configuración (firebase.json)

Ya actualizado ✅:
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

---

## Próximas Fases

- **FASE 2**: Reasignación automática si repartidor rechaza
- **FASE 3**: Notificaciones a panel de cocina
- **FASE 4**: Analytics y métricas
- **FASE 5**: Machine learning para predicción de tiempos

---

## Links Útiles

- 📄 [Documentación completa](./functions/README.md)
- 🔗 [Firebase Console](https://console.firebase.google.com/project/nelly-delivery)
- 📊 [Cloud Functions Logs](https://console.firebase.google.com/project/nelly-delivery/functions/logs)

---

## Checklist Predeployment

- [ ] Instaladas dependencias: `npm.cmd install` en functions/
- [ ] Validado: `npm run deploy -- --dry-run`
- [ ] firebase.json actualizado con bloque functions[]
- [ ] Revisados logs de prueba en emulador
- [ ] Coordenadas de test válidas (Tuxtla Gutiérrez: 16.7575, -93.1096)
- [ ] FCM tokens configurados en repartidores (opcional para notificaciones)

---

**Estado**: LISTO PARA DESPLEGAR ✅

