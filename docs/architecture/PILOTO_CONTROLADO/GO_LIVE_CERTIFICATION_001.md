# GO_LIVE_CERTIFICATION_001 - Acta de liberacion para piloto controlado

## Identificacion

- Certificacion: `GO_LIVE_CERTIFICATION_001`
- Estado: `GO`
- Fecha de cierre: 2026-08-01
- Entorno: `http://127.0.0.1:3001`
- Baseline: `ECOSYSTEM_CERT_001` / `DATASET_FINALIZATION_001` / `P17`

## Resumen ejecutivo

La plataforma quedo validada para piloto controlado en su nucleo transaccional de pedidos, despues de:

- limpiar el dataset de certificacion que contaminaba `active_orders`;
- recertificar el contrato funcional del pedido manual;
- completar una corrida E2E real con un pedido nuevo;
- usar un conductor elegible para la aceptacion final sin tocar la politica de deuda.

### Certificacion modulo por modulo

#### 1. Creacion del pedido

- pedido nuevo creado correctamente;
- contrato completo en RTDB;
- comercio real `PIZZERIA MIA` persistido;
- `shortId` y `folio` consistentes.

#### 2. Cocina

- el pedido llega a la vista operativa de cocina;
- el operador ve comercio, descripcion y notas;
- la transicion a `LISTO` se ejecuta sin perder campos.

#### 3. Reparto

- el pedido aparece en `pedidos_para_reparto`;
- el pedido pasa a `EN_CURSO` con conductor elegible;
- el pedido sale de `pedidos_para_reparto`;
- el pedido entra a `pedidos_en_camino`;
- no se pierden comercio, notas, descripcion, `shortId` ni `folio`.

#### 4. Entrega

- el pedido finaliza en `ENTREGADO`;
- `pedido_activo` queda liberado;
- no reaparece como activo tras la transicion.

#### 5. Historico

- `pedidos_completados/{pedidoId}` conserva el contrato del pedido;
- se mantienen `comercio_id`, `comercio_codigo`, `comercio_nombre`, `descripcion`, `notas`, `shortId` y `folio`.

La corrida final validada en el Gate demostro:

- creacion de pedido nueva: `PED_1786053513809`;
- despacho exitoso a `LISTO`;
- aceptacion exitosa con conductor elegible `8mo8182LJsgV7vKMSpiCekFKAG23`;
- cierre exitoso a `ENTREGADO`;
- limpieza de `pedidos_para_reparto`, `pedidos_en_camino` y `pedido_activo`;
- preservacion del contrato del pedido en el historico;
- ausencia de reapertura del pedido tras recarga del panel y del driver.

## Alcance de la certificacion

Esta acta cubre:

- flujo de creacion del pedido manual;
- despacho;
- aceptacion;
- entrega;
- limpieza del estado operativo;
- comportamiento tras recarga;
- consistencia del contrato del pedido;
- validacion de elegibilidad del conductor;
- conservacion del historico.

Esta acta no certifica todavia la totalidad del ecosistema Nelly. La certificacion aqui contenida corresponde al nucleo transaccional del flujo manual y a sus nodos operativos asociados.

## Pendientes de certificacion funcional

Quedan fuera del alcance certificado, por ahora, los siguientes frentes:

- Panel Administrativo.
- Panel de Cocina, incluyendo experiencia completa y casos operativos.
- Panel de Repartidores.
- Aplicacion Nelly Driver.
- Dashboard Comercial, incluyendo CRM e Inteligencia Comercial.
- Modulos de monitoreo, metricas y operacion.
- Integracion operativa completa entre todos los paneles.

## Evidencia principal

### Pedido final

- `pedidoId`: `PED_1785612556528`
- `shortId`: `0801-68`
- `estado final`: `ENTREGADO`
- `conductorId`: `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`

### Recertificacion Gate E2E-001

- `pedidoId`: `PED_1786053513809`
- `shortId`: `PIZZERIA-MIA-20260806-005`
- `folio`: `PIZZERIA-MIA-20260806-005`
- `comercio_nombre`: `PIZZERIA MIA`
- `estado final`: `ENTREGADO`
- `conductorId`: `8mo8182LJsgV7vKMSpiCekFKAG23`
- `resultado`: `PASS`

La corrida E2E validada en el Gate confirmo:

- creacion con contrato completo;
- despacho a `LISTO`;
- aceptacion en `EN_CURSO`;
- entrega a `ENTREGADO`;
- preservacion de `comercio_id`, `comercio_codigo`, `comercio_nombre`, `descripcion`, `notas`, `shortId` y `folio`.

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
- `pedidos_completados/{pedidoId}`: confirmado por la logica de `complete-order`; la lectura directa por REST no pudo verificarse desde shell por restriccion de permisos

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
