# U1.8 - MAQUINA DE ESTADOS V1

## Fecha
2026-07-22

## Proposito
Definir la maquina de estados canonica para el dominio universal, de forma que las transiciones validas de pedidos, pagos, fulfillment e inventario queden documentadas y no dependan de la interpretacion de cada modulo.

## Alcance
Este documento establece transiciones y reglas conceptuales. No modifica la baseline certificada de Kitchen Premium.

## Objetivos

- evitar que cada modulo implemente reglas distintas;
- documentar transiciones validas e invalidas;
- incluir cancelaciones, devoluciones y pedidos parciales;
- alinear el comportamiento de los estados con el modelo de dominio.

## Principios

1. Un estado describe una situacion verificable.
2. Una transicion debe tener origen, destino y regla.
3. Las transiciones invalidas deben ser detectables.
4. La cancelacion y la devolucion son caminos formales, no excepciones improvisadas.
5. Los estados parciales deben ser primer clase cuando el negocio lo requiera.

## Maquina de estados: Pedido

```text
CREADO
  ↓
PAGADO
  ↓
VALIDADO
  ↓
EN_PROCESO
  ↓
LISTO
  ↓
ASIGNADO
  ↓
EN_TRANSITO
  ↓
ENTREGADO
  ↓
CERRADO
```

## Ramas alternas

### Cancelacion

```text
CREADO -> CANCELADO
PAGADO -> CANCELADO
VALIDADO -> CANCELADO
EN_PROCESO -> CANCELADO
LISTO -> CANCELADO
ASIGNADO -> CANCELADO
EN_TRANSITO -> CANCELADO
```

### Devolucion

```text
ENTREGADO -> REEMBOLSADO
ENTREGADO -> DEVUELTO
```

### Pedido parcial

```text
CREADO -> PARCIAL
PARCIAL -> EN_PROCESO
PARCIAL -> LISTO
PARCIAL -> ASIGNADO
```

## Estados sugeridos

- `CREADO`
- `PAGADO`
- `VALIDADO`
- `EN_PROCESO`
- `PARCIAL`
- `LISTO`
- `ASIGNADO`
- `EN_TRANSITO`
- `ENTREGADO`
- `CERRADO`
- `CANCELADO`
- `DEVUELTO`
- `REEMBOLSADO`

## Reglas de transicion

1. No todas las transiciones son secuenciales.
2. Algunas transiciones requieren evento disparador o validacion previa.
3. Un estado final no debe reabrirse sin una causa formal.
4. La transicion debe registrar por que ocurrio.
5. El mismo estado puede significar cosas distintas por entidad, pero no dentro de la misma entidad.

## Transiciones por entidad

### Pedido
- validacion comercial;
- pago confirmado;
- asignacion de fulfillment;
- preparacion;
- despacho;
- entrega;
- cierre;
- cancelacion;
- reembolso.

### Payment
- pendiente;
- confirmado;
- rechazado;
- reembolsado.

### FulfillmentNode
- disponible;
- ocupado;
- pausado;
- fuera de servicio.

### InventoryItem
- disponible;
- reservado;
- en_preparacion;
- agotado;
- en_reorden.

## Eventos vinculados

Cada transicion canonica debe poder emitir un evento:

- `pedido.creado`
- `pedido.pagado`
- `pedido.validado`
- `pedido.en_proceso`
- `pedido.listo`
- `pedido.asignado`
- `pedido.en_transito`
- `pedido.entregado`
- `pedido.cancelado`
- `pedido.reembolsado`

## Reglas de diseño

1. Ninguna UI define por si sola las transiciones.
2. El core debe validar si una transicion es permitida.
3. Los caminos alternos deben ser parte del contrato.
4. El estado final debe ser interpretable por auditoria.
5. Las transiciones deben poder probarse con secuencias deterministas.

## Criterios de aceptacion

- las transiciones validas estan documentadas;
- las invalidas son identificables;
- cancelaciones y reembolsos tienen camino formal;
- los estados parciales son soportados;
- la plataforma comparte una misma maquina conceptual.

## Criterio de cierre
U1.8 se considerara estable cuando las transiciones canonicas puedan usarse como referencia unica para implementar reglas de estado en todos los modulos.

## Referencias
- [`docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md)
- [`docs/architecture/U1_6_EVENTOS_DOMINIO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_6_EVENTOS_DOMINIO_V1.md)
- [`docs/architecture/U1_7_CONTRATOS_CANONICOS_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_7_CONTRATOS_CANONICOS_V1.md)
