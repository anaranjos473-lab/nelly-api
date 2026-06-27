# NELLY OMEGA

# MAPA OFICIAL DEL ECOSISTEMA

## Single Source of Truth (SSOT)
**Versión:** 1.0
**Estado:** Certificado para desarrollo operativo

---

# OBJETIVO
Este documento define oficialmente qué proyecto corresponde a cada aplicación del ecosistema Nelly Delivery.

Todo desarrollador, IA, Copilot, Codex o agente de VS Code deberá consultar este documento antes de modificar cualquier proyecto Android.

Su propósito es evitar trabajar sobre el proyecto equivocado.

---

# PROYECTOS OFICIALES

## 1. NELLY DRIVER

### Estado
✅ Proyecto Oficial

### Ruta
C:\Users\hp14\AndroidStudioProjects\NellyDriver

### Package
com.example.nellydriver

### Versión
4.0.0-PRO

### Rol
Unidad táctica de reparto.

Es la aplicación utilizada por los repartidores.

### Responsabilidades

- Login del repartidor
- Tracking GPS
- DeliveryTrackingService
- Radar
- Recepción de pedidos
- Estados del pedido
- FCM
- Telemetría
- Navegación
- Complete Order

### Backend
https://nelly-api-8lh1.onrender.com/api/

### Firebase
Realtime Database

https://nelly-delivery-default-rtdb.firebaseio.com

Firestore

nelly-delivery

---

## 2. NELLY STORE

### Estado
✅ Proyecto Oficial

### Ruta
C:\Users\hp14\AndroidStudioProjects\nelly

### Package actual
com.example.nelly

### Versión
4.0.0-PRO
(Code 404)

### Arquitectura
Nexus / Sentinel OMEGA

Reactive & Modular

### Rol
Aplicación del Comercio / Tienda.

Es utilizada por restaurantes y comercios.

### Responsabilidades

- Recepción de pedidos
- Gestión del comercio
- Menús
- Productos
- Carrito
- Cobro
- Estado LISTO
- Comunicación con el Backend

### Evidencia encontrada
PantallaDetalleMenu

ModalCarrito

ComercioCard

PantallaPagoExitoso

PantallaSeguimientoPedido

---

## 3. NELLY ADMIN V2

### Estado
✅ Proyecto Oficial

### Ruta
C:\Users\hp14\AndroidStudioProjects\nelly2

### Package
com.example.nelly2

### Rol
Centro de Operaciones.

### Responsabilidades

- Dashboard
- Heat Maps
- Telemetría
- Nómina
- Sentinel
- Diagnósticos
- Finanzas
- Auditoría
- Administración

### Evidencia encontrada
HeatMapScreen

NominaScreen

TelemetriaForenseScreen

SentinelDiagnostics

---

# PROYECTO FUERA DEL FLUJO

## MyApplication

### Ruta
C:\Users\hp14\AndroidStudioProjects\MyApplication

### Estado
❌ FUERA DEL DESARROLLO OPERATIVO

### Motivo
Durante la certificación se detectó que múltiples modificaciones fueron realizadas en este proyecto mientras las pruebas se ejecutaban realmente sobre NellyDriver.

Esto generó:

- cambios sin efecto
- diagnósticos incorrectos
- tiempo perdido
- falsas conclusiones

Por lo tanto:

NO debe utilizarse para nuevas implementaciones.

Solo podrá abrirse para:

- recuperar código
- comparar versiones
- migraciones

Nunca como proyecto principal.

---

# BACKEND OFICIAL
Base API

https://nelly-api-8lh1.onrender.com/api/

Realtime Database

https://nelly-delivery-default-rtdb.firebaseio.com

Firestore

nelly-delivery

---

# CONTRATO DE COMUNICACIÓN

## DRIVER
Escucha

pedidos_para_reparto/

Escribe

pedidos_en_camino/

Tracking

repartidores_activos/

---

## STORE
Genera pedidos.

Marca pedidos LISTOS.

Publica pedidos hacia el flujo operativo.

---

## ADMIN
Escucha

pedidos/

repartidores_activos/

finanzas/

telemetría/

Controla:

Dashboard

Auditoría

Operación

---

# REGLAS DEL ECOSISTEMA

## Driver
Nunca modifica Finanzas.

Nunca modifica Comercios.

---

## Store
Nunca modifica GPS.

Nunca modifica Tracking.

---

## Admin
Nunca modifica DeliveryTrackingService.

Nunca modifica Tracking interno.

---

# REGLA OBLIGATORIA PARA VS CODE
Antes de modificar cualquier archivo Android responder:

¿Qué módulo voy a modificar?

Si es GPS

→ Abrir NellyDriver

Si es Tracking

→ Abrir NellyDriver

Si es DeliveryTrackingService

→ Abrir NellyDriver

Si es PedidoRepository

→ Abrir NellyDriver

Si es Radar

→ Abrir NellyDriver

Si es Comercio

→ Abrir nelly

Si es Productos

→ Abrir nelly

Si es Restaurante

→ Abrir nelly

Si es Dashboard

→ Abrir nelly2

Si es HeatMap

→ Abrir nelly2

Si es Nómina

→ Abrir nelly2

Si el proyecto abierto es MyApplication

DETENER EL TRABAJO.

Verificar el proyecto correcto.

---

# CERTIFICACIÓN DEL FLUJO OPERATIVO
Estado actual

Backend

✅ Certificado

RTDB

✅ Certificado

Pruebas Backend

21/21 aprobadas

Autenticación

✅ Corregida

Persistencia

✅ Corregida

Estados monotónicos

✅ Corregidos

Pedido fantasma

✅ Corregido

Limpieza de RTDB

✅ Corregida

Helper de Pedido Fresco

✅ Disponible

Plan de Certificación

✅ Documentado

FCM

⚠️ Pendiente de validar completamente con reglas RTDB.

---

# PENDIENTES ANTES DEL PILOTO

1. Confirmar reglas Firebase para permitir escritura del:

repartidores/{uid}/fcm_token

o definir oficialmente si el nodo autorizado será:

repartidores_activos/{uid}/fcm_token

2. Validar Pedido C completamente.

Crear pedido.

Despachar.

Aceptar.

GPS.

Llegar tienda.

Pedido a bordo.

Entrega.

Complete Order.

Verificar limpieza automática.

3. Validar Pedido D.

Repetir exactamente el flujo.

Sin reutilizar pedidos.

4. Validar Push Notification.

Crear pedido real.

Confirmar llegada inmediata al Motorola.

5. Validar Piloto.

Tres pedidos consecutivos.

Sin rebotes.

Sin estados fantasma.

Sin residuos en RTDB.

Sin errores complete-order.

---

# METODOLOGÍA OPERATIVA DE CONGELACIÓN
A partir de este punto, el desarrollo debe entrar en una fase de estabilización operativa y evitar mezclar validación con nuevas funcionalidades.

## Fase 0 – Gobernanza del ecosistema
- Cerrar la identidad del ecosistema antes de volver a tocar código.
- Confirmar el proyecto oficial del Driver, de la Tienda, del Admin y el estado de MyApplication como proyecto fuera de servicio.
- Documentar ruta física, package, versionCode, versionName, backend, Firebase, RTDB, Firestore y responsabilidad de cada aplicación.
- Definir claramente quién escribe y quién lee cada nodo de RTDB para evitar divergencias operativas.
- Confirmar si existe una app Kitchen independiente o si esa funcionalidad vive dentro de otro proyecto.

## Fase 1 – Estabilización
- No agregar nuevas funciones.
- Corregir únicamente defectos del flujo actual.
- Priorizar estabilidad, consistencia de estados y limpieza de datos.

## Fase 2 – Certificación
- Completar los pedidos C y D con evidencia verificable.
- Registrar evidencia en RTDB, Android, Panel y Backend.
- Validar que el flujo operativo complete sin estados fantasma ni residuos.

## Fase 3 – Piloto controlado
- Salir con 2 o 3 restaurantes seleccionados.
- Trabajar con un repartidor inicial para validar el flujo en condiciones reales.
- Medir tiempos, reintentos y errores operativos antes de escalar.

## Fase 4 – Escalamiento
- Una vez que el flujo operativo sea estable, incorporar más comercios y repartidores.
- Mantener la disciplina de no introducir cambios mayores durante la fase de validación.

Esta metodología reduce el riesgo de introducir regresiones justo antes del piloto y permite validar el núcleo operativo antes de expandir el ecosistema.

---

# ESTADO DEL ECOSISTEMA
Nelly Driver

90%

Nelly Store

85%

Nelly Admin V2

85%

Backend

95%

Firebase

90%

Integración General

88%

Piloto Comercial

NO AUTORIZADO TODAVÍA

Condición para autorizar:

Completar Pedido C.

Completar Pedido D.

Confirmar que las notificaciones FCM llegan de forma consistente.

Verificar que no quedan pedidos residuales ni referencias activas en RTDB al finalizar.

Completar tres ciclos consecutivos extremo a extremo sin intervención manual.

---

# REGLA FINAL
Toda modificación futura deberá comenzar verificando este documento.

El ecosistema se considera certificado únicamente cuando las aplicaciones Driver, Store y Admin trabajen sobre el mismo Backend, la misma RTDB, el mismo contrato de API y un flujo operativo validado extremo a extremo.
