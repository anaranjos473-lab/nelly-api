# NELLY DELIVERY — ARCHITECTURE

## 1. PROPÓSITO

Este documento es la Fuente Única de la Verdad técnica para Nelly Delivery.

Todo cambio de arquitectura, código generado por IA, refactorización o integración debe respetar este documento.

## 2. PRINCIPIOS RECTORES

### Pilar 1 — Single Source of Truth
Existe una sola fuente oficial para cada dato.

#### Runtime Oficial
- `server.js`
- `app.js`

#### Backend Oficial
- `nelly-api`

#### Base de Datos Oficial
- Firebase Realtime Database

#### APIs Oficiales
- `/api/ordenes`
- `/api/delivery`
- `/api/auth`

Queda prohibido crear rutas paralelas o lógicas duplicadas.

### Pilar 2 — Zero Trust
Los clientes Android y Web no son confiables.

Toda operación crítica ocurre exclusivamente en el servidor.

#### Cliente Android
Puede:
- Leer datos autorizados
- Solicitar operaciones
- Reportar ubicación

No puede:
- Asignar pedidos
- Reservar capital
- Liberar capital
- Cambiar estados financieros
- Aprobar pagos

### Pilar 3 — Arquitectura Reactiva
Android utiliza:
- Kotlin
- MVVM
- Coroutines
- StateFlow

La UI observa estado.

La UI no contiene lógica de negocio.

### Pilar 4 — Disciplina Operativa
Toda funcionalidad nueva requiere:
1. Evidencia
2. Prueba E2E
3. Certificación

No se despliega código sin validación.

### Pilar 5 — Crecimiento Táctico
Validar operación antes de escalar arquitectura.

Negocio primero.

Código después.

### Pilar 6 — Gobernanza IA
Toda IA debe:
- respetar arquitectura existente
- generar cambios atómicos
- evitar refactors masivos
- preservar compatibilidad

## 3. TOPOLOGÍA OFICIAL

Cliente Android
↓
Firebase Auth
↓
Node.js API
↓
Firebase Admin SDK
↓
Realtime Database

Toda modificación crítica pasa por Node.js.

## 4. OPERACIONES CRÍTICAS CENTRALIZADAS

### Exclusivas del Backend
- Accept Order
- Update Order Status
- Complete Order
- Smart Dispatch
- Reserva de Capital
- Liberación de Capital
- Elegibilidad
- Tarifa Dinámica
- Motor Financiero

### Permitidas al Cliente
- Login
- Consulta
- Tracking
- Solicitud de acción

## 5. ESTRUCTURA RTDB OFICIAL

- `pedidos/`
- `pedidos_para_reparto/`
- `pedidos_en_camino/`
- `repartidores/`
- `conductores_activos/`
- `restaurantes/`
- `usuarios/`

## 6. REGLA ANTI RACE CONDITION

Ningún pedido puede ser tomado mediante escritura directa desde Android.

Siempre:
Android
↓
POST backend
↓
RTDB Transaction
↓
Resultado

Nunca:
Android
↓
RTDB write
↓
Pedido Tomado

## 7. POLÍTICA OFFLINE

Android debe operar con:
- Firebase Persistence
- WorkManager
- Foreground Service
- Reintentos exponenciales
- Cola local de eventos

## 8. REGLAS DE SEGURIDAD

- Capital financiero: Solo Backend
- Estados financieros: Solo Backend
- Asignación: Solo Backend
- Smart Dispatch: Solo Backend
- `repartidores/$uid/capital`: `.write = false` en `firebase/database.rules.json`
- `finanzas` y `capital` deben protegerse con reglas RTDB y solo modificarse desde backend.

## 9. ESTADO ACTUAL

- FASE 0
- CERTIFICADA

- BOOT-001: PASS
- E2E-001: PASS
- E2E-002: PASS
- E2E-003: EN EJECUCIÓN
- CASE-001: BLOQUEADO
- FIN-006: BLOQUEADO
- FIN-007: BLOQUEADO
