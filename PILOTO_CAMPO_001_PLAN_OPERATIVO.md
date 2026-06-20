# PILOTO_CAMPO_001: Plan de Operación Comercial
**Fecha Decisión**: 2026-06-19  
**Objetivo**: Validar flujo completo Pedido→Entrega→Cobro en 3-5 ciclos reales  
**Timeline Estimado**: 48-72 horas desde deploy hasta primer ciclo

---

## 🎯 Fase 0: Deploy (HOY — 2h máximo)

### 0.1 Backend en Render
```
Status: ¿Está actualizado a rama main con asignador?
├─ git log --oneline (últimos 5 commits)
├─ ¿Incluye DeliveryTrackingService anti-fraude?
├─ ¿Incluye /api/delivery/accept-order con validación?
├─ ¿Incluye /api/delivery/assign-order (manual)?
└─ ¿Incluye /api/delivery/update-location?

Deploy:
$ git push origin main
→ Render redeploy automático
→ Verificar: https://nelly-api.onrender.com/healthcheck
   Esperado: 200 OK + estado operativo
```

**Go/No-Go**: Backend responde 200 en /healthcheck

---

### 0.2 Firebase Functions
```
Status: ¿Está functions/ completa con asignador?
├─ functions/src/index.js existe?
├─ ¿Incluye Trigger Firestore en pedidos_activos?
├─ ¿Incluye Haversine + geo-fence 2km?
├─ ¿Incluye FCM push a repartidor?
└─ ¿firebase.json ya incluye functions?

Deploy:
$ firebase deploy --only functions
→ Esperar 2-3 minutos
→ Verificar logs: firebase functions:log --limit 50
   Esperado: Sin errores de deployment
```

**Go/No-Go**: Función se activa sin errores (capturar en primer pedido)

---

### 0.3 APK Certificado
```
Status: ¿Dónde está el APK FINAL?
├─ Búsqueda en workspace: app-release.apk o similar
├─ ¿Incluye LocationUpdateClient con 8lh1 como host?
├─ ¿Incluye DeliveryTrackingService con anti-fraude?
├─ ¿Incluye PedidoRepository con fallback /api/delivery/accept-order?
└─ ¿Incluye IncidentReportClient para SOS?

Instalación en dispositivo TEST:
$ adb install -r <path>/app-release.apk
$ adb logcat | grep -i nelly

Verificación en app:
├─ Login con repartidor existente
├─ ¿Aparece "Disponible" en pantalla principal?
├─ ¿Geolocalización funciona (ícono GPS)?
├─ ¿Muestra "Conectado a Nelly"?
└─ ¿Puede ver pedidos_para_reparto?
```

**Go/No-Go**: App inicia, se conecta, ve pedidos disponibles

---

## 📋 Fase 1: Configuración de Prueba (MAÑANA — 1h)

### 1.1 Crear datos de prueba mínimos
```
Crear en Firebase (Admin):

REPARTIDORES (5 mínimo):
├─ UID: DRIVER_TEST_001 (Tuxtla)
│  └─ {nombre: "Test Driver 1", nivel: 3, lat: 16.75..., lng: -93.11...}
├─ UID: DRIVER_TEST_002 (Otro punto)
├─ ... (repetir)
└─ UID: KITCHEN_TEST (ubicación cocina fija)

COCINA (1):
├─ Ubicación GPS: Centro comercial Tuxtla
├─ Nombre: "Cocina Test Piloto"
├─ Capacidad: 20 pedidos/hora

CLIENTE TEST:
├─ Email: cliente.piloto@test.com
├─ Teléfono: +52 9611234567
├─ Dirección: Casa segura (con GPS confirmado)
└─ Nivel de crédito: Sin restricciones
```

**Validación**: Firebase console muestra datos correctos

---

### 1.2 Crear rutas de prueba
```
Crear en Google Maps:
├─ Punto A: Cocina (16.7510, -93.1110)
├─ Punto B: Casa cliente (16.7450, -93.1200)
├─ Distancia: ~1.2 km (5-8 min en vehículo)
├─ Tomar screenshot de ruta

Almacenar en: PILOTO_CAMPO_001_RUTAS.json
├─ Punto inicio (cocina)
├─ Punto fin (cliente)
├─ Distancia estimada
├─ Tiempo estimado
└─ Puntos intermedios (2-3 para prueba de tracking)
```

**Validación**: Ruta cargada, distancia confirma ~1.2 km

---

## 🚗 Fase 2: PILOTO_CAMPO_001 - Ciclo Real #1 (MAÑANA PM — 30-45 min)

### 2.1 Crear Pedido (Panel Cocina)
```
En https://nelly-delivery.web.app (admin):

Nuevo pedido:
├─ Cliente: cliente.piloto@test.com
├─ Ítems: 2 (para evitar error)
├─ Total: $150 MXN
├─ Punto entrega: Casa cliente (GPS)
└─ Prioridad: Normal

Clic "CREAR PEDIDO"
→ Esperado: Pedido aparece en pedidos_para_reparto (Firebase)

Validación en Firebase:
├─ RTDB: /pedidos_para_reparto/{id} existe
├─ Estado: "disponible"
├─ Cliente: Coincide
└─ Ubicación: Correcta
```

**Go/No-Go**: Pedido existe en RTDB y Firestore

---

### 2.2 Aceptar Pedido (App Driver)
```
En NellyDriver (DRIVER_TEST_001):

Pantalla "Disponibles":
├─ ¿Aparece nuevo pedido?
├─ Clic en pedido
├─ Muestra: Cliente, dirección, total
└─ Botón "ACEPTAR PEDIDO"

Clic "ACEPTAR PEDIDO"
→ Esperado: Backend recibe POST /api/delivery/accept-order
→ Estado cambia a: "repartidor_asignado"
→ Toast: "Pedido aceptado"

Validación en Firebase:
├─ RTDB: /pedidos/{id}/estado = "repartidor_asignado"
├─ RTDB: /pedidos/{id}/repartidor_uid = "DRIVER_TEST_001"
└─ RTDB: /conductores_activos/{uid}/pedido_actual existe
```

**Go/No-Go**: App acepta pedido, backend registra, RTDB actualiza

---

### 2.3 Ir a Cocina (Simulación GPS)
```
En NellyDriver:

Pantalla "En Reparto":
├─ Muestra: "Recogiendo en Cocina"
├─ Dirección GPS: Cocina
├─ ¿Botón "Llegué a Cocina"?

Simulación GPS (Google Maps):
├─ Abrir Google Maps en simulador o dispositivo
├─ Activar "Iniciar simulación de viaje" hacia cocina
├─ O manualmente moverse a GPS de cocina (16.7510, -93.1110)

Esperar 10-15 segundos:
└─ App debe mostrar "Ubicación actualizada"
└─ Backend recibe POST /api/delivery/update-location

Validación en Backend:
├─ Logs en Render: [LOCATION_UPDATE] DRIVER_TEST_001
├─ RTDB: /conductores_activos/{uid}/lat ≈ 16.7510
├─ RTDB: /conductores_activos/{uid}/lng ≈ -93.1110
```

**Go/No-Go**: Ubicación actualiza en RTDB cada 10-15s

---

### 2.4 Marcar "Llegué a Cocina"
```
En NellyDriver:

Pantalla "En Reparto":
├─ Botón "Llegué a Cocina"
└─ Clic

→ Esperado: Backend recibe evento
→ Estado cambia: "en_cocina"
→ Push a cocina: "Driver {nombre} llegó"

Validación en Firebase:
├─ RTDB: /pedidos/{id}/estado = "en_cocina"
├─ RTDB: /pedidos/{id}/timestamp_llegada_cocina = ahora
└─ Firestore: pedidos_activos/{id}/estado = "en_cocina"
```

**Go/No-Go**: Estado transiciona a en_cocina

---

### 2.5 Ir a Cliente (Simulación GPS)
```
En NellyDriver:

Pantalla "En Reparto":
├─ Muestra: "Entregando en Cliente"
├─ Dirección GPS: Casa cliente (16.7450, -93.1200)

Simulación GPS:
├─ Mover GPS lentamente desde cocina a cliente
├─ Tomar 3-5 waypoints intermedio
├─ Registrar tiempos en cada waypoint

Timeline esperado:
├─ T+0s: Salida cocina (16.7510, -93.1110)
├─ T+10s: Waypoint 1 (16.7490, -93.1130)
├─ T+20s: Waypoint 2 (16.7470, -93.1160)
├─ T+30s: Waypoint 3 (16.7450, -93.1190)
├─ T+40s: Llegada cliente (16.7450, -93.1200)

Validación en Backend:
├─ Logs Render: 4-5 eventos [LOCATION_UPDATE]
├─ RTDB: /conductores_activos/{uid}/lat cambia progresivamente
└─ Sin "driver-offline" ni desconexiones
```

**Go/No-Go**: GPS actualiza suavemente sin desconexiones

---

### 2.6 Marcar "Llegué al Cliente"
```
En NellyDriver:

Pantalla "En Reparto":
├─ Botón "Llegué al Cliente"
└─ Clic

→ Esperado: Backend recibe evento
→ Estado cambia: "entregado"
→ Monto: $150 acreditado

Validación en Firebase:
├─ RTDB: /pedidos/{id}/estado = "entregado"
├─ RTDB: /pedidos/{id}/timestamp_entrega = ahora
├─ Firestore: pedidos_activos/{id}/estado = "entregado"
└─ RTDB: /repartidores/{uid}/finanzas/saldo_hoy += 150

Validación en Backend:
├─ Logs Render: [DELIVERY_COMPLETE] DRIVER_TEST_001 +150 MXN
└─ /api/admin/repartidores retorna saldo actualizado
```

**Go/No-Go**: Entrega registra, crédito suma, estado final es correcto

---

### 2.7 Validación Financiera
```
En admin-dashboard (o endpoint /api/admin/repartidores):

Verificar:
├─ Saldo DRIVER_TEST_001 incrementó +150
├─ Comisión calculada correctamente (18% = 27 MXN)
├─ Neto acreditado: 150 - 27 = 123 MXN
├─ Hora de entrega registrada
└─ Pedido linkado correctamente

Go/No-Go: Finanzas suman correctamente
```

---

## 📊 Fase 3: Análisis de Resultados (Ciclo #1)

### 3.1 Matriz de Evidencia
```
| Métrica | Esperado | Observado | Status |
|---------|----------|-----------|--------|
| Pedido crea OK | ✅ | ? | ⬜ |
| Driver ve pedido | ✅ | ? | ⬜ |
| Driver acepta | ✅ | ? | ⬜ |
| Ubicación cocina | ✅ | ? | ⬜ |
| Ubicación cliente | ✅ | ? | ⬜ |
| Entrega registra | ✅ | ? | ⬜ |
| Finanzas actualizan | ✅ | ? | ⬜ |
| Tiempo total | <15 min | ? | ⬜ |
| Errores | 0 | ? | ⬜ |
```

### 3.2 Reporte del Ciclo
```
Documento: PILOTO_CAMPO_001_CICLO_01.md

Contenido:
├─ Timestamp inicio/fin
├─ Driver usado (UID)
├─ Cliente (anónimo o test)
├─ Pedido ID
├─ Eventos capturados (con timestamps)
├─ Logs relevantes de Render
├─ Pantallazos de RTDB
├─ Pantallazos de finanzas
├─ Incidentes (si los hay)
└─ Conclusión (OK / ISSUE)
```

---

## 🔄 Ciclos #2-5 (Variaciones)

### Ciclo #2: Distancia mayor (2.5 km)
```
Objetivo: Validar GPS en trayecto más largo
├─ Nuevo cliente más alejado
├─ Tiempo estimado: 15-20 min
└─ Buscar: ¿driver-offline aparece?
```

### Ciclo #3: Espera en cocina (15 min)
```
Objetivo: Validar que TTL mantenga conductor online
├─ Aceptar pedido
├─ ESPERAR 15 min sin mover GPS
├─ Validar: conductores_activos sigue vivo
└─ Buscar: ¿Desconexión espuria?
```

### Ciclo #4: GPS degradado
```
Objetivo: Validar recuperación ante falta de GPS
├─ Desactivar GPS
├─ Esperar 30s
├─ Reactivar GPS
└─ Buscar: ¿App se recupera automáticamente?
```

### Ciclo #5: Red intermitente
```
Objetivo: Validar Network Resilience
├─ Poner dispositivo en modo avión
├─ Esperar 10s
├─ Poner modo online
└─ Buscar: ¿Se sincroniza automáticamente?
```

---

## ✅ Criterios de GO/NO-GO

### GO para Operación Piloto Real
```
✅ 5 ciclos completados
✅ 0 entregas perdidas
✅ Finanzas exactas en 100% de casos
✅ TTL funciona (sin driver-offline fantasma)
✅ GPS actualiza sin saltos > 100m
✅ App NO se desconecta sin causa
✅ Backend logs claros y sin errores 500
```

### NO-GO (Requiere investigación)
```
❌ >1 entrega con estado inconsistente
❌ driver-offline persiste >2 min sin causa
❌ Finanzas no suman en >1 caso
❌ GPS saltos > 500m sin razón
❌ Backend retorna 500 en >1 evento
❌ App crash durante entrega
```

---

## 📞 Soporte en Vivo

Durante los 5 ciclos:

```
OBSERVAR:
├─ Render logs (real-time): tail -f logs
├─ Firebase console (RTDB live updates)
├─ Device logs (adb logcat)
├─ Admin dashboard

COMUNICACIÓN:
├─ Si cliente real: teléfono + WhatsApp
├─ Si test: solo logs
└─ Si issue: PARAR y documentar antes de siguiente ciclo
```

---

## 📈 Siguiente Paso (Después de GO)

Si los 5 ciclos pasan:

```
OPERACIÓN PILOTO COMERCIAL:
├─ Deploy APK a 2-3 drivers reales
├─ Activar por 7 días en zona Tuxtla
├─ Capturar datos: tiempo, errores, ingresos
├─ Decidir: ¿Escalar a 5-10 drivers?
└─ RECIÉN ENTONCES: Evaluar PHASE 2C si aplica

Métrica de Éxito:
├─ 50+ entregas en 7 días
├─ 98%+ sin errores críticos
├─ Ingresos >$1,500 MXN
└─ Drivers dicen "está bien, dejen así"
```

---

**Este es el plan. No hay PHASE 2C hasta que operación piloto valide la hipótesis de mercado.**

**Tiempo: Deploy (2h) + Prueba (3-5 ciclos = 2-3 horas) = ~1 día de trabajo concentrado.**
