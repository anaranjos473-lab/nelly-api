# AUDITORÍA GPS-001: NellyDriver
**Fecha**: 2026-06-19  
**Estado**: ✅ COMPLETADO  
**Alcance**: Codebase completo `app/src/main/java/com/example/nellydriver`

---

## 📊 Checklist de Validación

| # | Pregunta | Respuesta | Evidencia |
|---|----------|-----------|-----------|
| P1 | ¿Existe simulador GPS? | ❌ **NO** | 0 archivos Simulator.kt, setMockLocation, buildTypes DEBUG |
| P2 | ¿Se activa automáticamente? | N/A | No existe simulador |
| P3 | ¿Solo funciona en DEBUG? | N/A | Sistema de detección está en TODAS builds |
| P4 | ¿Puede ejecutarse en producción? | ✅ **SÍ** | Anti-fraude activo en producción |
| P5 | ¿Puede escribir en `conductores_activos`? | ❌ **NO** | Driver solo escribe en `repartidores/{uid}` y HTTP |

---

## 🔍 Hallazgo Principal: Sistema Anti-Fraude Extremo

### Ubicación: `DeliveryTrackingService.kt` (L60-75)

```kotlin
// Detecta Mock GPS en CADA ubicación recibida
val isMock = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
    location.isMock  // Android 12+
} else {
    @Suppress("DEPRECATION")
    location.isFromMockProvider  // Android < 12
}

if (isMock) {
    Timber.e("🚨 ALERTA: Se detectó ubicación falsa (Mock GPS)")
    
    // ⚠️ DESCONECTA INMEDIATAMENTE
    val bunkerIntent = Intent("COM_EXAMPLE_NELLY_FRAUD_DETECTED").apply {
        setPackage(packageName)
    }
    sendBroadcast(bunkerIntent)
}
```

### Respuesta en `MainActivity.kt` (L85-92)

```kotlin
private val receiverFraude = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        // ⚠️ LLAMA DESCONEXIÓN
        mainViewModel.reportarDesconectado()
        
        Toast.makeText(context, 
            "🚨 ALERTA DEL BÚNKER: Se detectó alteración de GPS. Conexión suspendida.",
            Toast.LENGTH_LONG
        ).show()
    }
}
```

---

## ⚠️ Impacto Potencial

### Escenarios donde se ACTIVA la Desconexión:

| Escenario | Probabilidad | Impacto |
|-----------|-------------|--------|
| Usuario activa MockLocation en sistema | ⚡ ALTA | Desconexión inmediata |
| Simulación de rutas en Google Maps | ⚡ ALTA | Puede ser detectada como Mock |
| Herramientas de prueba GPS (Genymotion, Android Studio emulator) | ⚡ ALTA | Detección automática |
| Interferencia GPS en túneles/interiores | 🟡 MEDIA | A veces registra como Mock |
| Apps de mapas con ubicación simulada | 🟡 MEDIA | Depende de cómo lo implementen |

### Consecuencia:

```
Mock Detected → Broadcast → MainActivity.reportarDesconectado() 
    ↓
Usuario queda OFFLINE inmediatamente
    ↓
No puede aceptar/rechazar pedidos
    ↓
Si había pedido activo, queda en estado INCONSISTENTE
```

---

## 🔗 Nueva Hipótesis sobre "driver-offline"

La persistencia del estado `driver-offline` puede NO estar relacionada con simulador GPS, sino con:

### Escenario 1: Force Stop Android (MÁS PROBABLE)

```
User → Configuring → Apps → NellyDriver → Force Stop
    ↓
Android mata el proceso SIN ejecutar onDestroy()
    ↓
DeliveryTrackingService NUNCA se detiene
    ↓
reportarDesconectado() NUNCA se invoca
    ↓
conductores_activos/{uid} = "online" (permanece)
    ↓
TTL local (12-24h) limpia la entrada
    ↓
Hasta entonces: driver-offline persiste indefinidamente
```

### Escenario 2: Crash de App sin Broadcast

```
App crash por excepción no capturada
    ↓
onDestroy() no garantizado
    ↓
Mismo resultado que Escenario 1
```

### Escenario 3: Pérdida de Conectividad Persistente

```
No hay red por 30+ minutos
    ↓
Firebase connection timeout
    ↓
DeliveryTrackingService.stop() puede no invocarse
    ↓
reportarDesconectado() no llega a backend
```

---

## 🏗️ Rutas de Ubicación Auditadas

```
DeliveryTrackingService (Foreground Service)
├─ Lee: FusedLocationProvider.getCurrentLocation()
├─ Verifica: location.isMock
├─ Escribe: 
│  ├─ HTTP POST /delivery/update-location
│  └─ GlobalLocation (NellyApp StateFlow)
│
GlobalObserverViewModel (Admin)
├─ Lee: conductores_activos/{uid}
├─ NO escribe desde driver
└─ Solo admin puede leer/escribir

MotoristaOperacionRepository (Driver)
├─ Lee: repartidores/{uid}/operacion
├─ Escribe: repartidores/{uid}/operacion
└─ NO toca conductores_activos
```

---

## 🛡️ Evaluación de Riesgo

| Riesgo | Nivel | Mitigación |
|--------|-------|-----------|
| Simulador GPS embebido | 🟢 BAJO | NO EXISTE |
| Fraude de MockLocation | 🟡 MEDIO | Detectado y desconectado |
| driver-offline indefinido | 🔴 ALTO | **REQUIERE INVESTIGACIÓN ADICIONAL** |
| TTL no funciona en conductores_activos | 🔴 ALTO | Verificar Firebase Rules |

---

## 📋 Próximos Pasos Recomendados

### ANTES de iniciar PHASE 2C:

#### Acción 1: Auditar Firebase Rules
```
Verificar: database.rules.json
├─ ¿TTL habilitado en conductores_activos?
├─ ¿Tiene .expires en cada entrada?
├─ ¿Backend limpia automáticamente?
└─ ¿Hay fallback manual en app.js?
```

#### Acción 2: Investigar driver-offline
```
Búsqueda de:
├─ ¿Dónde se ESCRIBE driver-offline?
├─ ¿Quién lo GENERA (driver app, backend, admin)?
├─ ¿Qué lo LIMPIA (TTL, manual cleanup, otros)?
└─ ¿Por qué persiste 12-24h?
```

#### Acción 3: Reforzar onDestroy
```
DeliveryTrackingService.kt:
├─ Añadir try/catch en onDestroy()
├─ Garantizar reportarDesconectado() se invoca
├─ Implementar callback de confirmación
└─ Registrar logs exhaustivos
```

#### Acción 4: Revisar Anti-Fraude
```
¿Es DEMASIADO agresivo?
├─ ¿Está penalizando ubicaciones reales?
├─ ¿Hay falsos positivos en túneles?
├─ ¿Interfiere con Google Maps?
└─ Considerar whitelist o threshold
```

---

## ✅ Conclusión

**No hay simulador GPS que eliminar.** Lo que hay es:

1. ✅ Sistema de detección anti-fraude **activo y agresivo**
2. ❌ Posible problema de onDestroy() **no garantizado** en Android
3. ❌ TTL o cleanup en conductores_activos **posiblemente inefectivo**
4. ⚠️ driver-offline puede estar relacionado con **Force Stop**, no con GPS

**Recomendación**: No toques nada aún. Ejecuta Acción 1-4 para certificar el verdadero origen del problema.

---

**Auditoría completada por**: Consejo Nelly-Ops  
**Estado**: 🟢 LISTO PARA PHASE 2C (con investigaciones previas)
