# GO_LIVE_CERTIFICATION_001 - Acta de liberacion para piloto controlado

## Identificacion

- Certificacion: `GO_LIVE_CERTIFICATION_001`
- Estado: `GO`
- Fecha de cierre: 2026-08-01
- Entorno: `http://127.0.0.1:3001`
- Baseline: `ECOSYSTEM_CERT_001` / `DATASET_FINALIZATION_001` / `P17`

## Resumen ejecutivo

La plataforma llego a un estado operativo apto para piloto controlado despues de:

- limpiar el dataset de certificacion que contaminaba `active_orders`;
- recertificar el contrato de lectura;
- validar que panel, cocina y driver reflejan un dataset limpio;
- completar una corrida E2E real con un pedido nuevo;
- usar un conductor elegible para la aceptacion final sin tocar la politica de deuda.

La corrida final demostro:

- creacion de pedido nueva: `PED_1785612556528`;
- despacho exitoso a `LISTO`;
- aceptacion exitosa con conductor elegible `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`;
- cierre exitoso a `ENTREGADO`;
- limpieza de `pedidos_para_reparto`, `pedidos_en_camino` y `pedido_activo`;
- ausencia de reapertura del pedido tras recarga del panel y del driver.

## Alcance de la certificacion

Esta acta cubre:

- flujo de creacion;
- despacho;
- aceptacion;
- entrega;
- limpieza del estado operativo;
- comportamiento tras recarga;
- consistencia entre panel, cocina y driver;
- validacion de elegibilidad del conductor.

## Evidencia principal

### Pedido final

- `pedidoId`: `PED_1785612556528`
- `shortId`: `0801-68`
- `estado final`: `ENTREGADO`
- `conductorId`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`

### Resultado de la corrida

- `POST /api/admin/pedidos` -> `201 Created`
- `POST /api/delivery/dispatch-order` -> `200 OK`
- `POST /api/delivery/accept-order` -> `200 OK`
- `POST /api/delivery/complete-order` -> `200 OK`

### Snapshot final de RTDB

- `estado = ENTREGADO`
- `estado_pedido = ENTREGADO`
- `logistica.estado = ENTREGADO`
- `pedidos_para_reparto = null`
- `pedidos_en_camino = null`
- `pedido_activo = null`
- `repartidores/*/pedido_activo` para el pedido: ninguno activo

### Verificacion visual posterior

- Panel: no reaparece como activo tras recarga
- Driver: no lo muestra como disponible tras recarga

## Componentes certificados

- Dataset de certificacion: saneado
- Contrato de lectura: consistente
- Panel de cocina: consistente
- Driver: consistente
- Reglas de deuda: consistentes y respetadas
- Flujo E2E: completo

## Riesgos residuales

- Volumen mayor al de la corrida de certificacion
- Dependencia de estabilidad de Firebase / red
- Elegibilidad operativa de conductores reales
- Incidencias humanas durante el piloto

## Criterios para suspender el piloto

- reaparece informacion historica en panel, cocina o driver;
- un pedido entregado vuelve a verse como activo tras recarga;
- falla el contrato de lectura;
- vuelve a aparecer un bloqueo funcional no justificado por la politica de negocio;
- se detecta regresion en el flujo de pedido nuevo.

## Decision final

**GO = SI**

Se autoriza iniciar el piloto controlado bajo monitoreo cercano y con congelamiento funcional del baseline.

## Recomendaciones operativas

- Crear y mantener una rama de soporte para incidentes del piloto.
- No introducir cambios funcionales sin evidencia reproducible.
- Tratar cualquier incidente nuevo como incidente operativo bajo `Nelly Engineering Protocol v2.1`.

## Referencias

- [`GO_LIVE_READINESS_CHECKLIST.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/investigaciones/GO_LIVE_READINESS_CHECKLIST.md)
- [`GO_LIVE_DRIVER_001.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/investigaciones/GO_LIVE_DRIVER_001.md)
- [`DATASET_FINALIZATION_001.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/investigaciones/DATASET_FINALIZATION_001.md)
- [`PILOT_DATASET_001.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/investigaciones/PILOT_DATASET_001.md)
- [`GATE_E2E_001.md`](./GATE_E2E_001.md)
- [`CHECKLIST_EJECUCION_GATE_E2E_001.md`](./CHECKLIST_EJECUCION_GATE_E2E_001.md)

## Cierre

La linea base queda habilitada para piloto controlado.
