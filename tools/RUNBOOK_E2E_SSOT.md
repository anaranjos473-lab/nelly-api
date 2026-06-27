# Prueba E2E SSOT (Single Source of Truth)

**Objetivo:** Validar que el flujo Admin → Backend → Firestore → RTDB → Android funciona correctamente.

**Estado:** Listo para ejecutar (commit `67e6425` ya en producción).

---

## 📋 Prerrequisitos

- [ ] Backend en Render corriendo
- [ ] Firebase Firestore y RTDB sincronizados
- [ ] Android app instalada y conectada a WiFi
- [ ] Cocina (`public/panel.html`) cargada en navegador
- [ ] Admin autenticado

---

## 🎯 Flujo E2E a Validar

```
Admin (crear pedido)
   ↓
POST /api/admin/pedidos
   ↓
Backend (validar, generar ID)
   ↓
Firestore: Cocina/<id_pedido>
   ↓
Cloud Function: Indexar en pedidos_para_reparto
   ↓
RTDB: pedidos_para_reparto/<id_pedido>
   ↓
Android (listener activo)
   ↓
📱 Pedir que Repartidor acepte
   ↓
RTDB: pedidos_en_camino/<id_pedido>
   ↓
Panel Cocina: Audio + indicador EN_CAMINO
```

---

## ✅ Pasos de Prueba

### Paso 1: Crear pedido desde Admin

```bash
# Opción A: API directo
curl -X POST http://localhost:3000/api/admin/pedidos \
  -H "Content-Type: application/json" \
  -H "X-API-Key: dev-key" \
  -d '{
    "cliente_nombre": "Test SSOT",
    "descripcion": "Pedido prueba E2E",
    "monto": 150,
    "telefono": "+34612345678",
    "direccion": "Calle Test, 123"
  }'

# Opción B: Script
node scripts/createPedidoViaSSOT.js
```

**Resultado esperado:**
- ✅ Status 201 o 200
- ✅ Retorna `id_pedido` y `estado: 'pendiente'`
- ✅ Timestamp creado

### Paso 2: Validar en Panel Cocina

- [ ] Abrir `http://localhost:3000/panel.html`
- [ ] Buscar el pedido por ID o nombre
- [ ] Verificar que aparece en la cola
- [ ] Estado debe ser: **PENDIENTE**

**Observaciones:**
- El panel NO debe escribir en `pedidos_en_camino`
- El panel SOLO lee desde Firestore
- Panel escucha cambios en tiempo real

### Paso 3: Android Repartidor - Aceptar

- [ ] Abrir app Android
- [ ] Ir a "Pedidos Disponibles"
- [ ] Buscar pedido creado
- [ ] Presionar **ACEPTAR**

**Lo que debe pasar:**
- ✅ Audio de confirmación
- ✅ Transición a "En Camino"
- ✅ Sincronización Backend → RTDB

### Paso 4: Validar sincronización

Verificar que los tres puntos de verdad están sincronizados:

```bash
# Terminal 1: Ver Firestore
node -e "
const admin = require('firebase-admin');
const cred = require('./nelly-admin.json');
admin.initializeApp({ 
  credential: admin.credential.cert(cred),
  databaseURL: 'https://nelly-delivery-default-rtdb.firebaseio.com'
});
const id = 'TU_PEDIDO_ID';
admin.firestore().collection('Cocina').doc(id).onSnapshot(snap => {
  console.log('Firestore:', snap.data());
});
"

# Terminal 2: Ver RTDB
node -e "
const admin = require('firebase-admin');
const cred = require('./nelly-admin.json');
admin.initializeApp({ 
  credential: admin.credential.cert(cred),
  databaseURL: 'https://nelly-delivery-default-rtdb.firebaseio.com'
});
const id = 'TU_PEDIDO_ID';
admin.database().ref('pedidos_para_reparto/' + id).on('value', snap => {
  console.log('RTDB pedidos_para_reparto:', snap.val());
});
```

---

## 🔍 Checklist de Validación SSOT

- [ ] **Creación:** Pedido creado via API admin
- [ ] **Firestore:** Existe en Cocina/<id_pedido>
- [ ] **RTDB:** Existe en pedidos_para_reparto/<id_pedido>
- [ ] **Panel:** Aparece sin doble escritura
- [ ] **Android:** Recibe y acepta
- [ ] **EN_CAMINO:** Actualiza Firestore → RTDB
- [ ] **Sincronización:** Los 3 puntos en sincronía
- [ ] **Auditoría:** Logs muestran flujo correcto
- [ ] **Sin duplicados:** No hay pedidos duplicados
- [ ] **Sin inconsistencias:** Estados coherentes

---

## 🐛 Si algo falla

### Síntoma: Pedido no aparece en Android

**Verificar:**
1. ¿Está en `pedidos_para_reparto` en RTDB?
2. ¿El listener en Android está activo?
3. ¿El índice de Firestore existe?

### Síntoma: Panel escribe en `pedidos_en_camino` manualmente

**Verificar:**
1. ¿Se actualizó `public/panel.html`?
2. ¿Hay código que escriba directamente en RTDB?
3. ¿Está usando `dispatch-order` correctamente?

### Síntoma: Inconsistencia entre Firestore y RTDB

**Verificar:**
1. ¿Cloud Function se disparó?
2. ¿Hay errores en logs de Firebase?
3. ¿RTDB está adelantado o retrasado?

---

## 📊 Métricas Esperadas

| Métrica | Esperado | Observado |
|---------|----------|-----------|
| Latencia creación → Android | < 5s | _____ |
| Latencia aceptación → Panel | < 2s | _____ |
| Pedidos duplicados | 0 | _____ |
| Estados inconsistentes | 0 | _____ |
| Errores de auditoría | 0 | _____ |

---

## 📝 Plantilla de Resultado

```
Fecha: 2026-06-23
Ejecutor: ___________
Resultado: PASÓ / FALLÓ

Issues encontrados:
- [ ] ...

Notas:
- ...
```

---

## 🚀 Próximos pasos

Si la prueba PASÓ:
1. ✅ Documentar resultado
2. ✅ Comunicar a equipo
3. ✅ Activar monitoreo de SSOT

Si la prueba FALLÓ:
1. 🔍 Revisar logs
2. 🐛 Depurar inconsistencias
3. 🔄 Reintenta
