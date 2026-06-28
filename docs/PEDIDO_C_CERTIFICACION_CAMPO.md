# Certificacion Pedido C - Campo

Checkpoint base: `18e75d2 Certificar auth panel y complete-order`

Regla de ejecucion: no introducir funcionalidad nueva entre Pedido C y Pedido D. Este documento registra evidencia operativa paso a paso y separa cada tramo para aislar fallas sin mezclar backend, RTDB, cocina y Android.

## Estado inicial

- Producto congelado en checkpoint de nucleo operativo.
- Backend complete-order certificado previamente.
- Nuevos artefactos permitidos: herramientas de certificacion y evidencia.
- Pendiente principal: ADB no detecto dispositivo fisico. La evidencia actual de `adb devices` fue lista vacia, por lo que Android fisico no queda certificado todavia.

## Matriz oficial

| Etapa | Alcance | Evidencia | Estado |
| --- | --- | --- | --- |
| C-1 Crear pedido | Administrador -> `POST /api/admin/pedidos` -> RTDB -> Cocina visible | `PED_1782639607602` creado, RTDB `PENDIENTE`, sin reparto/camino | PASS |
| C-2 Cocina | Cocina marca LISTO -> `pedidos_para_reparto` | `PED_1782639607602` en `LISTO`, existe en `pedidos_para_reparto`, sin camino | PASS |
| C-3 Driver recibe | Notificacion/Radar Android -> Aceptar | `adb devices` sin dispositivo | Bloqueado por ADB |
| C-4 Tracking | Llegue tienda -> Pedido a bordo -> Cliente | Pendiente | Bloqueado por ADB |
| C-5 Complete Order | ENTREGADO -> RTDB limpia -> Android vuelve al Radar | Pendiente | Bloqueado por ADB |

## Politica de ejecucion

- No ejecutar C-3, C-4 ni C-5 hasta cerrar C-1 y C-2 con evidencia.
- No tomar una respuesta HTTP como certificacion completa si no existe snapshot RTDB correspondiente.
- No considerar Android certificado si ADB no muestra un dispositivo fisico conectado y autorizado.
- Cada etapa debe terminar con una evidencia independiente antes de avanzar a la siguiente.

## C-1 - Crear pedido y confirmar cocina

Objetivo:

Administrador -> `POST /api/admin/pedidos` -> Backend -> RTDB -> Pedido existe -> Cocina lo muestra.

Ejecutado y certificado.

Evidencia esperada:

- Origen: `public/admin-dashboard.html` -> `public/js/admin-dashboard.js` -> `POST /api/admin/pedidos`.
- Backend: `routes/admin.js`.
- RTDB: `pedidos/{pedidoId}`.
- Estado esperado: `estado_pedido = PENDIENTE`, visible como cocina.
- No debe existir aun en `pedidos_para_reparto`.
- No debe existir aun en `pedidos_en_camino`.
- Cocina muestra el pedido en pendientes.

Herramienta sugerida:

```powershell
node scripts\certificar-pedido-c-campo.mjs crear-admin
```

Resultado:

- Estado: PASS.
- Fecha UTC: `2026-06-28T09:40:06.537Z`.
- Pedido: `PED_1782639607602`.
- HTTP: `POST /api/admin/pedidos` respondio `201 Created`.
- RTDB:
  - `pedidos/PED_1782639607602` existe.
  - Estado normalizado: `PENDIENTE`.
  - `pedidos_para_reparto/PED_1782639607602 = null`.
  - `pedidos_en_camino/PED_1782639607602 = null`.
- Conclusion: pedido creado por el flujo admin/backend y queda en fase cocina.

## C-2 - Cocina marca LISTO y publica reparto

Objetivo:

Cocina -> LISTO -> `pedidos_para_reparto` -> evidencia RTDB.

Ejecutado y certificado despues de C-1.

Evidencia esperada:

- Accion correcta: panel cocina o endpoint operativo `POST /api/delivery/dispatch-order`.
- RTDB esperado:
  - `pedidos/{pedidoId}.estado_pedido = LISTO`.
  - `pedidos_para_reparto/{pedidoId}` existe.
  - `pedidos_en_camino/{pedidoId}` no existe todavia.
- El pedido queda disponible para reparto.

Herramienta sugerida:

```powershell
node scripts\certificar-pedido-c-campo.mjs despachar
```

Resultado:

- Estado: PASS.
- Fecha UTC: `2026-06-28T09:40:23.620Z`.
- Pedido: `PED_1782639607602`.
- HTTP: `POST /api/delivery/dispatch-order` respondio `200 OK`.
- RTDB:
  - `pedidos/PED_1782639607602.estado_pedido = LISTO`.
  - `pedidos_para_reparto/PED_1782639607602` existe.
  - `pedidos_en_camino/PED_1782639607602 = null`.
- Conclusion: pedido publicado correctamente para reparto, sin iniciar camino.

## C-3 - Driver recibe y acepta

Objetivo:

Driver fisico -> Notificacion/Radar -> Pedido visible -> Aceptar.

Bloqueado hasta que ADB detecte Motorola/Android y C-1/C-2 esten cerrados.

Evidencia esperada:

- `adb devices` muestra un dispositivo fisico conectado y autorizado.
- La app muestra el pedido disponible o lo recibe por listener.
- La aceptacion se hace desde Android fisico, no solo por API.

RTDB esperado al aceptar:

- `pedidos/{pedidoId}.estado_pedido = EN_CURSO`.
- `repartidores/{driverUid}/pedido_activo = pedidoId`.
- `pedidos_en_camino/{pedidoId}` existe.

Resultado:

- Estado: Bloqueado por ADB.
- Evidencia: `adb devices` vacio el `2026-06-28`.
- Salida observada:

```text
List of devices attached
```

## C-4 - Tracking operativo

Objetivo:

Tracking -> Llegue tienda -> Pedido a bordo -> Cliente.

Bloqueado hasta cerrar C-3 en Android fisico.

Evidencia esperada:

- Android conserva `pedido_activo`.
- Tracking avanza por los estados operativos esperados.
- RTDB refleja el avance sin crear pedidos duplicados ni perder `pedido_activo`.

Resultado:

- Estado: Bloqueado por ADB.
- Evidencia: Pendiente.

## C-5 - Complete Order y limpieza final

Objetivo:

Complete Order -> ENTREGADO -> RTDB limpia -> Android vuelve al Radar.

Bloqueado hasta cerrar C-4 en Android fisico.

Evidencia esperada:

- Complete Order se dispara desde Android fisico.
- Endpoint operativo `POST /api/delivery/complete-order` responde 200.
- `pedidos/{pedidoId}.estado_pedido = ENTREGADO`.
- `repartidores/{driverUid}/pedido_activo = null`.
- `pedidos_en_camino/{pedidoId}` eliminado.
- Android detiene tracking, limpia estado local y vuelve al Radar.

Resultado:

- Estado: Bloqueado por ADB.
- Evidencia: Pendiente.
