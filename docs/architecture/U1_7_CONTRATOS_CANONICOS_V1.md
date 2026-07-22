# U1.7 - CONTRATOS CANONICOS V1

## Fecha
2026-07-22

## Proposito
Definir los contratos canonicos de las entidades principales del dominio universal para que todas las aplicaciones, paneles y servicios consuman el mismo modelo, con versionado y compatibilidad controlada.

## Alcance
Este documento formaliza contratos de dominio, no implementaciones. No altera la baseline certificada de Kitchen Premium.

## Objetivos

- unificar nombres y responsabilidades de las entidades;
- definir campos obligatorios, opcionales y derivados;
- establecer estados validos por entidad;
- fijar reglas de compatibilidad entre versiones;
- evitar que cada modulo invente su propio modelo.

## Entidades canonicas

- `Pedido`
- `OrderItem`
- `FulfillmentNode`
- `InventoryItem`
- `LedgerEntry`
- `Payment`
- `Shipment`
- `Event`
- `Evidence`

## Estructura de contrato

Cada contrato debe poder describir:

- `id`
- `version`
- `tipo`
- `estado`
- `campos_obligatorios`
- `campos_opcionales`
- `campos_derivados`
- `relaciones`
- `validaciones`
- `compatibilidad`
- `metadata`

## Reglas de contrato

1. El contrato es la fuente compartida entre paneles y servicios.
2. Los cambios incompatibles requieren nueva version.
3. Los campos obligatorios no deben depender del cliente.
4. Los campos derivados no deben reemplazar a los obligatorios.
5. Las compatibilidades hacia atras deben documentarse.

## Contrato: Pedido

Responsabilidad:

- representar la solicitud central de negocio;
- conectar cliente, fulfillment, pago y evidencia.

Campos obligatorios sugeridos:

- `id`
- `cliente`
- `lineas`
- `estado`
- `created_at`
- `updated_at`

## Contrato: OrderItem

Responsabilidad:

- describir una linea indivisible de pedido.

Campos obligatorios sugeridos:

- `id`
- `pedido_id`
- `producto_id`
- `cantidad`
- `precio_unitario`

## Contrato: FulfillmentNode

Responsabilidad:

- describir un nodo capaz de ejecutar fulfillment.

Campos obligatorios sugeridos:

- `id`
- `tipo`
- `estado`
- `capabilities`

## Contrato: InventoryItem

Responsabilidad:

- describir disponibilidad y reserva de stock.

Campos obligatorios sugeridos:

- `id`
- `sku`
- `nodo_id`
- `disponible`
- `reservado`

## Contrato: LedgerEntry

Responsabilidad:

- representar un movimiento financiero inmutable.

Campos obligatorios sugeridos:

- `id`
- `tipo`
- `monto`
- `moneda`
- `referencia_id`
- `ocurrido_en`

## Contrato: Payment

Responsabilidad:

- describir la intencion o confirmacion de pago.

Campos obligatorios sugeridos:

- `id`
- `pedido_id`
- `metodo`
- `estado`
- `monto`

## Contrato: Shipment

Responsabilidad:

- describir el tramo logistico de entrega.

Campos obligatorios sugeridos:

- `id`
- `pedido_id`
- `repartidor_id`
- `estado`

## Contrato: Event

Responsabilidad:

- representar un hecho de dominio con correlacion y causacion.

Campos obligatorios sugeridos:

- `id`
- `tipo`
- `aggregate_id`
- `ocurrido_en`
- `registrado_en`

## Contrato: Evidence

Responsabilidad:

- almacenar la prueba verificable de una accion o cierre.

Campos obligatorios sugeridos:

- `id`
- `tipo`
- `url`
- `timestamp`

## Versionado

- `major`: cambios incompatibles.
- `minor`: nuevos campos compatibles hacia atras.
- `patch`: correcciones no estructurales.

## Compatibilidad

Un contrato nuevo debe especificar:

- que campos admite de versiones previas;
- que campos deja de aceptar;
- si existe mapeo automatico;
- si requiere migracion.

## Criterios de aceptacion

- los paneles y servicios comparten el mismo vocabulario;
- cada entidad tiene campos obligatorios definidos;
- el versionado queda explicitado;
- las reglas de compatibilidad son claras;
- el dominio no depende de contratos improvisados.

## Criterio de cierre
U1.7 se considerara estable cuando los contratos canonicos puedan usarse como referencia unica para implementaciones y validaciones posteriores.

## Referencias
- [`docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md)
- [`docs/architecture/U1_6_EVENTOS_DOMINIO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_6_EVENTOS_DOMINIO_V1.md)
- [`docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md)
