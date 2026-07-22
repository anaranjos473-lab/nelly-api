# U1.1 - MODELO DE DOMINIO UNIVERSAL V1

## Fecha
2026-07-22

## Proposito
Definir las entidades, fronteras y relaciones base del dominio universal de Nelly para soportar Kitchen, marketplace, inventario, integraciones y finanzas sobre una semantica comun.

## Alcance
Este documento establece el vocabulario canonico de U1.1. No implementa logica ni altera la baseline certificada de Kitchen Premium.

## Principios

- Una entidad tiene una responsabilidad principal.
- El estado operativo no debe confundirse con la contabilidad.
- Los movimientos financieros son eventos inmutables.
- El inventario es un subsistema independiente.
- El fulfillment coordina, pero no absorbe todo el dominio.
- Los eventos de dominio permiten reaccionar sin acoplar el flujo principal.

## Entidades canonicas

### Pedido
Unidad central de negocio.

Responsabilidades:

- representar la solicitud de compra o servicio;
- contener el estado operativo del flujo;
- referenciar cliente, comercio, fulfillment y evidencia;
- servir como agregador de la ejecucion.

Campos conceptuales:

- `id`
- `cliente`
- `lineas`
- `estado`
- `fulfillment_node_id`
- `pago_id`
- `evidencia_id`
- `created_at`
- `updated_at`

### Linea de pedido
Elemento indivisible de una solicitud.

Responsabilidades:

- describir un articulo o servicio concreto;
- registrar cantidad, precio y reglas de sustitucion;
- permitir reservas parciales o multiples fuentes.

Campos conceptuales:

- `id`
- `pedido_id`
- `producto_id`
- `cantidad`
- `precio_unitario`
- `subtotal`
- `estado`
- `inventario_source_id`

### Nodo de cumplimiento
Punto capaz de recibir, preparar, despachar o entregar.

Responsabilidades:

- modelar Kitchen, tienda, almacén, farmacia o comercio;
- exponer capacidades y estado de operacion;
- aceptar trabajo de fulfillment.

Campos conceptuales:

- `id`
- `tipo`
- `nombre`
- `capabilities`
- `estado`
- `zona`
- `metadata`

### Inventario
Subsistema de disponibilidad y reserva.

Responsabilidades:

- informar disponibilidad;
- reservar y liberar unidades;
- soportar sustituciones y multiples almacenes;
- desacoplar stock del flujo operativo.

Campos conceptuales:

- `id`
- `sku`
- `location_id`
- `disponible`
- `reservado`
- `en_preparacion`
- `umbral_reorden`
- `metadata`

### Pago
Unidad de intencion o confirmacion de cobro.

Responsabilidades:

- describir el medio y el estado del pago;
- vincularse con movimientos financieros;
- soportar distintos canales y reembolsos.

Campos conceptuales:

- `id`
- `pedido_id`
- `metodo`
- `estado`
- `monto`
- `moneda`
- `referencia_externa`

### Movimiento financiero
Registro inmutable de cualquier impacto economico.

Responsabilidades:

- registrar creditos, debitos, ajustes y reversas;
- servir como fuente de verdad contable;
- permitir conciliacion y auditoria.

Campos conceptuales:

- `id`
- `tipo`
- `origen`
- `referencia_id`
- `monto`
- `moneda`
- `actor`
- `timestamp`
- `metadata`

### Entrega
Tramo logistico de salida y cierre.

Responsabilidades:

- registrar la ejecucion de la entrega;
- vincular conductor, evidencia y tiempos;
- dejar trazabilidad del cierre operativo.

Campos conceptuales:

- `id`
- `pedido_id`
- `repartidor_id`
- `estado`
- `evidencia_id`
- `iniciada_at`
- `finalizada_at`

### Evidencia
Prueba verificable del cumplimiento.

Responsabilidades:

- almacenar fotos, firmas, notas o comprobantes;
- referenciar el evento o la entrega que la produjo;
- servir como soporte de auditoria.

Campos conceptuales:

- `id`
- `tipo`
- `url`
- `mime`
- `origen`
- `referencia_id`
- `timestamp`

### Evento
Hecho relevante del dominio.

Responsabilidades:

- documentar cambios de estado y decisiones;
- activar integraciones o procesos derivados;
- mantener historial de negocio.

Campos conceptuales:

- `id`
- `tipo`
- `aggregate_id`
- `actor`
- `ocurrido_en`
- `registrado_en`
- `payload`

## Relaciones principales

```text
Pedido
  ├── Linea de pedido [1..n]
  ├── Pago [0..1]
  ├── Entrega [0..n]
  ├── Evidencia [0..n]
  ├── Evento [0..n]
  └── Nodo de cumplimiento [0..1]

Linea de pedido
  └── Inventario [0..n]

Movimiento financiero
  └── Referencia a Pedido, Pago, Entrega o Ajuste
```

## Fronteras de dominio

### Operativo
- Pedido
- Linea de pedido
- Nodo de cumplimiento
- Entrega

### Contable
- Pago
- Movimiento financiero

### Soporte
- Inventario
- Evidencia
- Evento

## Reglas de diseño

1. `Pedido` no debe contener logica contable completa.
2. `Movimiento financiero` no debe depender del render.
3. `Inventario` no debe ser un campo derivado del estado visual.
4. `Evento` no reemplaza al estado operativo, pero lo complementa.
5. `Nodo de cumplimiento` no debe quedar atado a Kitchen como unica implementacion.

## Estados y eventos sugeridos

### Pedido
- `creado`
- `validado`
- `asignado`
- `en_preparacion`
- `listo`
- `en_ruta`
- `entregado`
- `cancelado`

### Pago
- `pendiente`
- `confirmado`
- `rechazado`
- `reembolsado`

### Movimiento financiero
- `cargo`
- `abono`
- `ajuste`
- `reversa`

### Inventario
- `disponible`
- `reservado`
- `agotado`
- `en_reposicion`

## Criterios de aceptacion de U1.1

- las entidades quedan separadas por responsabilidad;
- la contabilidad queda desacoplada del saldo acumulado;
- el fulfillment puede operar con distintos nodos;
- el inventario puede evolucionar sin romper pedidos;
- los eventos permiten extender el sistema sin reescribir el flujo principal.

## Criterio de cierre
U1.1 se considerara estable cuando las entidades y relaciones definidas aqui se usen como referencia canonica para las siguientes decisiones de U1.

## Referencias
- [`docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md)
- [`docs/architecture/INDEX_U1_PLATAFORMA_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/INDEX_U1_PLATAFORMA_UNIVERSAL_V1.md)
- [`docs/architecture/ADR_U1_DOMINIO_UNIVERSAL_LEDGER_INVENTARIO_FULFILLMENT_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/ADR_U1_DOMINIO_UNIVERSAL_LEDGER_INVENTARIO_FULFILLMENT_V1.md)
