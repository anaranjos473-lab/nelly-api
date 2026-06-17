# SOURCE_OF_TRUTH — Nelly Decisiones Arquitectónicas

## Propósito
Este documento define la autoridad oficial para cada entidad. Ningún componente (Android o Web) debe asumir autoridad sobre estos datos; solo el Backend tiene permiso de escritura maestra.

## 1. Pedidos (Orders)
**Fuente oficial:** RTDB (`/pedidos`)
**Razón:** Latencia ultra baja necesaria para el flujo Cocina-Driver.
**Lectura desde:** Admin Panel (vía Backend), Cocina UI (RTDB Listener), Driver App (RTDB Listener).
**Escritura desde:** Solo Backend API.
**Regla de Oro (PROHIBIDO):** Queda estrictamente prohibido que Android, Panel Cocina o Admin Dashboard escriban directamente en `RTDB/pedidos`. Todo cambio de estado DEBE pasar por el Backend API.
**Versionado de Estados (Optimistic Concurrency):** Cada actualización de pedido debe incluir:
  - `version`: (int) Incremental. El Backend debe validar que no se intenten procesar estados obsoletos (concurrencia).
  - `updated_at`: (timestamp) Timestamp del servidor.
  - **Ejemplo:** `{ "estado": "EN_CAMINO", "version": 7, "updated_at": 1781543469085 }`.
**Archivado (OrderArchiveService):** Al transicionar a `entregado` o `cancelado`:
1. Escribir en `Firestore/historico_pedidos`.
2. Confirmar escritura.
3. Eliminar del nodo operativo `RTDB/pedidos`.

## 2. Repartidores (Separación Operación/Perfil)
**Operación:** `RTDB/repartidores_operativos/{uid}`
- Campos: `online`, `ocupado`, `pedido_actual`, `ultima_actividad`.
- Frecuencia: Alta (segundos).
**Perfil/Financiero:** `RTDB/repartidores/{uid}`
- Campos: `capital`, `deuda`, `nivel`, `nombre`, `telefono`.
- Frecuencia: Baja (eventual).

## 3. GPS en Vivo
**Fuente oficial:** RTDB (`/conductores_activos`)
**Razón:** Datos efímeros de alta frecuencia. No requieren persistencia a largo plazo a menos que se requiera auditoría de ruta.
**Escritura desde:** Driver App (Android).
**Lectura desde:** Admin Dashboard (Mapa en tiempo real).
**TTL de GPS Centralizado (Anti-Ghosting):** 
  - **Capa UI:** Debe filtrar e ignorar cualquier registro con `timestamp` > 120 segundos (prevención visual).
  - **Capa Backend (Autoridad):** El Backend DEBE ejecutar `cleanupConductoresActivos()` cada 60 segundos para purgar físicamente los registros obsoletos y evitar el crecimiento silencioso.

## 4. Ledger y Finanzas (Estratégico)
**Fuente oficial:** Firestore (`/liquidaciones`)
**Razón:** Requiere integridad transaccional y persistencia garantizada. Los datos financieros no deben vivir únicamente en una base de datos volátil como RTDB.
**Ledger de Auditoría (Firestore `/order_events`):**
  - Registro inmutable de cada cambio de estado importante.
  - Campos: `pedido`, `evento`, `actor`, `timestamp`, `version_pedido`.
  - Propósito: Resolver disputas de "¿quién aceptó y cuándo?".
  - Ejemplo:
    ```json
    {
      "pedido": "PED_1781543469085", "evento": "ACEPTADO", "actor": "DRIVER_TUXTLA_001", "timestamp": 1781543469085, "version_pedido": 7
    }
    ```
**Lectura desde:** Admin Dashboard.
**Escritura desde:** Backend (Cloud Functions o API).

## 5. Tabla Resumen de Autoridad

| Entidad       | Fuente de Verdad | Escritor Primario | Consumidor Crítico |
|---------------|------------------|-------------------|-------------------|
| Pedidos (Op)  | RTDB (v/ Ledger) | Backend API       | Cocina/Driver     |
| Repartidor Op | RTDB             | Driver App        | Smart Dispatch    |
| Perfil/Capital| RTDB             | Backend API       | Driver App        |
| Ubicación     | RTDB             | Driver App        | Admin (Mapa)      |
| Histórico/Ev. | Firestore        | Backend (Async)   | Admin (Auditoría/Ledger) |
| Liquidación   | Firestore        | Backend API       | Finanzas          |

## Reglas de Oro
1. **Jerarquía de Escritura:** Cliente → Backend API → RTDB/Firestore. Ningún cliente escribe directo en Pedidos.
2. **Prohibido el "Double-Write" desde el Cliente:** La App de Android nunca debe escribir en Firestore y RTDB al mismo tiempo.
2. **RTDB es para el "Ahora":** Si el dato tiene más de 24 horas, debe vivir en Firestore.
3. **Idempotencia:** Cada creación de pedido (`PED_*`) debe ser validada contra la fuente de verdad antes de ser procesada para evitar los duplicados observados.

## Auditoría del Bridge Firestore ↔ RTDB
**Estado:** ELIMINADO.
**Sustitución:** El flujo se ha movido a los endpoints del Backend. 
- `POST /api/admin/pedidos/:id/listo` es ahora el encargado de mover el objeto entre nodos de RTDB. 
- **Riesgo detectado:** Falta la persistencia final a Firestore al completar el pedido.