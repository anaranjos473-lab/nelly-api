# NELLY OMEGA

# MAPA OFICIAL DEL ECOSISTEMA

## Single Source of Truth (SSOT)
**Version:** 1.0
**Estado:** Certificado para desarrollo operativo

---

# OBJETIVO

Este documento define oficialmente que proyecto corresponde a cada aplicacion del ecosistema Nelly Delivery.

Todo desarrollador, IA, Copilot, Codex o agente de VS Code debe consultar este documento antes de modificar cualquier proyecto Android.

Su proposito es evitar trabajar sobre el proyecto equivocado.

---

# PROYECTOS OFICIALES

## 1. NELLY DRIVER

### Estado
Proyecto Oficial

### Ruta
C:\Users\hp14\AndroidStudioProjects\NellyDriver

### Package
com.example.nellydriver

### Version
4.0.0-PRO

### Rol
Unidad tactica de reparto.

Es la aplicacion utilizada por los repartidores.

### Responsabilidades

- Login del repartidor
- Tracking GPS
- DeliveryTrackingService
- Radar
- Recepcion de pedidos
- Estados del pedido
- FCM
- Telemetria
- Navegacion
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
Proyecto Oficial

### Ruta
C:\Users\hp14\AndroidStudioProjects\nelly

### Package actual
com.example.nelly

### Version
4.0.0-PRO
(Code 404)

### Arquitectura
Nexus / Sentinel OMEGA

Reactive & Modular

### Rol
Aplicacion del Comercio / Tienda.

Es utilizada por restaurantes y comercios.

### Responsabilidades

- Recepcion de pedidos
- Gestion del comercio
- Menus
- Productos
- Carrito
- Cobro
- Estado LISTO
- Comunicacion con el Backend

### Evidencia encontrada

- PantallaDetalleMenu
- ModalCarrito
- ComercioCard
- PantallaPagoExitoso
- PantallaSeguimientoPedido

---

## 3. NELLY ADMIN V2

### Estado
Proyecto Oficial

### Ruta
C:\Users\hp14\AndroidStudioProjects\nelly2

### Package
com.example.nelly2

### Rol
Centro de Operaciones.

### Responsabilidades

- Dashboard
- Heat Maps
- Telemetria
- Nomina
- Sentinel
- Diagnosticos
- Finanzas
- Auditoria
- Administracion

### Evidencia encontrada

- HeatMapScreen
- NominaScreen
- TelemetriaForenseScreen
- SentinelDiagnostics

---

# PROYECTO FUERA DEL FLUJO

## MyApplication

### Ruta
C:\Users\hp14\AndroidStudioProjects\MyApplication

### Estado
Fuera del desarrollo operativo

### Motivo

Durante la certificacion se detecto que multiples modificaciones fueron realizadas en este proyecto mientras las pruebas se ejecutaban realmente sobre NellyDriver.

Esto genero:

- cambios sin efecto
- diagnosticos incorrectos
- tiempo perdido
- falsas conclusiones

Por lo tanto:

No debe utilizarse para nuevas implementaciones.

Solo puede abrirse para:

- recuperar codigo
- comparar versiones
- migraciones

Nunca como proyecto principal.

---

# BACKEND OFICIAL

### Base API
https://nelly-api-8lh1.onrender.com/api/

### Realtime Database
https://nelly-delivery-default-rtdb.firebaseio.com

### Firestore
nelly-delivery

---

# CONTRATO DE COMUNICACION

## DRIVER

Escucha:

- pedidos_para_reparto/

Escribe:

- pedidos_en_camino/

Tracking:

- repartidores_activos/

## STORE

- Genera pedidos.
- Marca pedidos LISTOS.
- Publica pedidos hacia el flujo operativo.

## ADMIN

Escucha:

- pedidos/
- repartidores_activos/
- finanzas/
- telemetria/

Controla:

- Dashboard
- Auditoria
- Operacion

---

# REGLAS DEL ECOSISTEMA

## Driver

- Nunca modifica Finanzas.
- Nunca modifica Comercios.

## Store

- Nunca modifica GPS.
- Nunca modifica asignacion final.

## Admin

- No inventa estados.
- No reemplaza la autoridad del backend.

---

# DECISION

Este mapa es la referencia oficial para identificar el proyecto correcto antes de tocar cualquier flujo Android.

Si una tarea pertenece al driver, se trabaja en `NellyDriver`.
Si pertenece a tienda, se trabaja en `nelly`.
Si pertenece a operaciones, se trabaja en `nelly2`.

No usar `MyApplication` como base de certificacion operativa.
