# PILOTO_CAMPO_001: Checklist Operativo de Ejecución

**Objetivo**: Validar ciclo completo sin intervención manual.  
**Scope**: 1 pedido, 1 repartidor, 1 operador.  
**Criterio de éxito**: Admin → Cocina → Driver → GPS → Entrega → Finanzas sin reiniciar ni editar Firebase.

---

## T-15 Minutos: Pre-Vuelo

### Backend ✅

```
[ ] curl https://nelly-api-8lh1.onrender.com/api/health → 200
[ ] Render: Sin redeploy activo
[ ] Logs Render: Sin errores repetitivos en últimos 2 min
[ ] Firebase Admin: getApp() funciona (verificar en console)
```

### Firebase ✅

```
[ ] Firebase Console: Abierta y accesible
[ ] Conductor prueba existe en /repartidores/{uid}
[ ] Admin UID conocido (verificar auth.token.admin == true)
[ ] /conductores_activos → vacío o limpio
[ ] Firestore: Accesible (sin cuota excedida)
```

### Android App ✅

```
[ ] APK Release instalada y funcionando
[ ] Sesión iniciada con conductor UID
[ ] Ubicación: "Permitir siempre" habilitado
[ ] Batería: Optimización deshabilitada para NellyDriver
[ ] GPS: Activo (punto azul visible en Google Maps)
```

### Paneles ✅

```
[ ] Panel Cocina: Abierto en tab/ventana
[ ] Panel Admin: Abierto en otra tab/ventana
[ ] Mapa Logístico: Abierto (si existe)
```

**Si algo falla aquí, STOP. No avances.**

---

## Ejecución: 6 Fases (Cronómetro Activo)

### FASE 1: Creación [T+0s]

**Quién**: Administrador

**Acción**:
```
Panel Admin → Crear pedido
```

**Captura**:
```
TIMESTAMP_CREACION = [HH:MM:SS]
PEDIDO_ID         = [copy-paste aquí]
```

**Verificación**:
```
[ ] Pedido aparece en lista Admin
[ ] ID es numérico o UUID válido
```

---

### FASE 2: Visibilidad Driver [T+10s máx]

**Quién**: Sistema (validar automático)

**Objetivo**: Pedido visible en app Android.

**Verificación en Driver**:
```
[ ] Notificación push recibida (¿sí/no?)
[ ] Pedido aparece en lista "Disponibles"
[ ] Monto, dirección, cliente legibles
```

**Captura**:
```
TIMESTAMP_APARICION = [HH:MM:SS]
LATENCIA_DRIVER     = TIMESTAMP_APARICION - TIMESTAMP_CREACION
STATUS: ✅ PASS   /   ❌ FAIL
```

**Si FAIL**: Revisar FCM token en RTDB. **STOP piloto, no continúes.**

---

### FASE 3: Aceptación [T+13s máx]

**Quién**: Repartidor

**Acción**:
```
App Driver → Presionar "Aceptar Pedido"
```

**Captura**:
```
TIMESTAMP_ACEPTACION = [HH:MM:SS]
LATENCIA_ACCEPT      = TIMESTAMP_ACEPTACION - TIMESTAMP_CREACION
```

**Verificación en Panel Admin**:
```
[ ] Estado pedido cambia a EN_REPARTO (o equivalente)
[ ] Repartidor UID asignado correctamente
[ ] No hay duplicados en lista
[ ] No hay error 500 en logs Render
```

**Verificación en Driver**:
```
[ ] UI transiciona a mapa
[ ] Sin errores visibles
[ ] Vuelve a inicio OK
```

**Status**: ✅ PASS / ❌ FAIL

---

### FASE 4: GPS [T+43s máx]

**Quién**: Repartidor

**Acción**:
```
Camina/conduce ~50 metros en dirección diferente
Espera 30 segundos
```

**Verificación en RTDB**:
```
/conductores_activos/{UID}
├── lat (¿cambió?)
├── lng (¿cambió?)
└── ultimaActualizacion (¿reciente?)
```

**Verificación en Mapa (si existe)**:
```
[ ] Marcador apareció
[ ] Posición correcta (~50m de origen)
[ ] Timestamp actualiza cada 5-30s
```

**Captura**:
```
GPS_VISIBLE = ✅ SÍ   /   ❌ NO
LAT_CAMBIÓ  = ✅ SÍ   /   ❌ NO
TIMESTAMP_OK = ✅ SÍ   /   ❌ NO
```

---

### FASE 5: Entrega [T+46s máx]

**Quién**: Repartidor

**Acción**:
```
App Driver → "Marcar como Entregado"
```

**Captura inmediata**:
```
TIMESTAMP_ENTREGADO = [HH:MM:SS]
LATENCIA_TOTAL      = TIMESTAMP_ENTREGADO - TIMESTAMP_CREACION
```

**Verificación en RTDB** (dentro de 3 segundos):
```
/pedidos/{ID}              → estado: "ENTREGADO"
/pedidos_en_camino/{ID}    → DESAPARECE o cambia estado
/pedidos_para_reparto/{ID} → DESAPARECE o NO_DISPONIBLE
```

**Verificación en Panel Admin**:
```
[ ] Pedido sale de "En Reparto"
[ ] Aparece en "Completados" o similar
[ ] Sin error en UI
```

**Status**: ✅ PASS / ❌ FAIL

---

### FASE 6: Finanzas [T+51s - **CRÍTICA**]

**Quién**: Sistema + Admin verifica

**Verificación en Firebase** (conductor financiero):
```
/repartidores/{UID}/finanzas
├── saldo_anterior    → [X]
├── monto_pedido      → [Y]
├── comision (18%)    → [Y * 0.18]
├── saldo_actual      → [X + Y - comision]
└── ultimaTransaccion → [timestamp reciente]
```

**Verificación en Firestore** (si existe colección transacciones):
```
/transacciones/{ID}
├── pedido_id
├── conductor_uid
├── monto
├── estado: "COMPLETADA"
└── timestamp
```

**Verificación Manual en Admin**:
```
Panel Admin → Sección Finanzas
[ ] Cobro registrado
[ ] Saldo repartidor actualizado
[ ] Comisión aplicada correctamente (18%)
[ ] Sin valores null o 0 inesperados
```

**Captura**:
```
SALDO_ANTERIOR  = [X]
MONTO_PEDIDO    = [Y]
COMISION_18_PCT = [Y * 0.18]
SALDO_POSTERIOR = [X + Y - comisión]
TRANSACCION_ID  = [copy-paste]

FINANZAS_OK = ✅ PASS   /   ❌ FAIL
```

**⚠️ SI FALLA AQUÍ**: Revisar si es null en saldo o comisión mal aplicada. Este fue el bug histórico.

---

## Criterio GO / NO-GO

```
RESULTADO FINAL

Fase 1 (Creación)       ✅ PASS
Fase 2 (Visibilidad)    ✅ PASS
Fase 3 (Aceptación)     ✅ PASS
Fase 4 (GPS)            ✅ PASS
Fase 5 (Entrega)        ✅ PASS
Fase 6 (Finanzas)       ✅ PASS

────────────────────────────────────

PILOTO_CAMPO_001 = ✅ PASS

Nelly está lista para operación piloto en Tuxtla.
```

**Si cualquier fase falla**: Documentar qué falló y dónde. **NO marcar como PASS**.

---

## Tiempos Críticos Observados

```
Latencia Driver      = FASE 2 - FASE 1       (objetivo: < 10 s)
Latencia Aceptación  = FASE 3 - FASE 1       (objetivo: < 13 s total)
Latencia Total       = FASE 5 - FASE 1       (objetivo: < 46 s)
Finanzas Registrado  = FASE 6 - FASE 5       (objetivo: < 5 s)
```

---

## Evidencia Mínima Requerida

Capturar screenshots o fotos:

1. **Panel Admin**: Pedido creado, ID visible
2. **App Driver**: Pedido en lista, antes de aceptar
3. **App Driver**: Después de "Aceptar" (transición a mapa)
4. **Mapa/RTDB**: GPS marker visible, coordenadas actualizadas
5. **Panel Admin**: Pedido en "Completados" o "Entregados"
6. **Finanzas**: Saldo actualizado, monto registrado, comisión aplicada

Con esas 6 capturas + tiempos registrados = **Evidencia válida de PILOTO_CAMPO_001**.

---

## Rollback / Emergencia

```
Si en cualquier momento el piloto falla gravemente:

1. NO reiniciar Render (mantener logs)
2. NO editar Firebase manualmente
3. SCREENSHOT de error o pantalla
4. DETENER piloto inmediatamente
5. Capturar logs Render para diagnóstico posterior
6. Documentar hora, fase, y descripción del fallo
```

---

## Post-Piloto

Si **PILOTO_CAMPO_001 = PASS**:

```
✅ RC2.6 certificado en operación real
✅ Siguiente paso: Ejecutar 2-3 pilotos adicionales en Tuxtla
✅ Validar estabilidad con volumen real
✅ Escalar a operación comercial
```

Si **PILOTO_CAMPO_001 = FAIL**:

```
1. Revisar log Render (hora exacta del error)
2. Consultar RTDB (¿nodos huérfanos?)
3. Revisar Firestore (¿transacción incompleta?)
4. Corregir y re-ejecutar
```

---

**Fecha de este checklist**: 2026-06-20  
**Versión**: 1.0 Operativo  
**Responsable de validación**: [nombre operador]  
**Timestamp inicio piloto**: [HH:MM:SS]
