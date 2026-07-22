# U1.4 - INVENTARIO DESACOPLADO V1

## Fecha
2026-07-22

## Proposito
Definir el inventario como un subsistema independiente del dominio universal, capaz de soportar reservas, disponibilidad, sustituciones y multiples almacenes sin acoplarse al flujo operativo de Kitchen.

## Alcance
Este documento formaliza la capa conceptual de inventario para U1. No implementa logica de stock ni altera la baseline certificada de Kitchen Premium.

## Objetivos

- separar stock de estado operativo;
- soportar reservas y liberaciones controladas;
- manejar multiples fuentes de abastecimiento;
- permitir sustituciones o preparacion parcial;
- exponer disponibilidad de forma confiable para fulfillment e integraciones.

## Principios

1. El inventario no es una vista secundaria del pedido.
2. Reservar no es consumir.
3. Liberar no es borrar.
4. La disponibilidad debe poder calcularse por nodo, almacén y SKU.
5. La trazabilidad de stock debe mantenerse aunque cambie el canal o el nodo.

## Entidad canonica: Item de inventario

Responsabilidad:

- representar disponibilidad y movimiento de una unidad o grupo de unidades de stock;
- servir como base para reservas y liberaciones;
- indicar de donde proviene el stock.

Campos conceptuales:

- `id`
- `sku`
- `nodo_id`
- `almacen_id`
- `disponible`
- `reservado`
- `en_preparacion`
- `en_transito`
- `umbral_reorden`
- `metadata`

## Entidad complementaria: Reserva de inventario

Responsabilidad:

- bloquear stock para una orden o linea de pedido;
- definir vigencia, alcance y origen;
- liberar o consolidar la reserva cuando cambie el estado de fulfillment.

Campos conceptuales:

- `id`
- `pedido_id`
- `linea_id`
- `sku`
- `nodo_id`
- `cantidad`
- `estado`
- `creada_en`
- `expira_en`
- `metadata`

## Relacion con Pedido

- `Pedido` solicita disponibilidad.
- `Linea de pedido` pide cantidad concreta.
- `Inventario` responde con disponibilidad o reserva.
- `Reserva de inventario` protege stock mientras se ejecuta la orden.

## Relacion con Fulfillment

El motor de fulfillment consulta inventario para decidir:

- si puede aceptar trabajo;
- si necesita sustitucion;
- si debe derivar a otro nodo;
- si la preparacion parcial es valida.

## Relacion con Ledger

El inventario puede tener impacto financiero, pero el ledger debe registrar solo los efectos economicos que correspondan por regla de negocio. Inventario y contabilidad no son la misma cosa.

## Estados sugeridos

### Item de inventario
- `disponible`
- `reservado`
- `en_preparacion`
- `agotado`
- `en_reorden`
- `en_transito`

### Reserva de inventario
- `activa`
- `parcial`
- `liberada`
- `consumida`
- `expirada`

## Casos de uso

### Reserva de pedido
Al validar un pedido, el sistema reserva las cantidades necesarias en el nodo o almacén correspondiente.

### Sustitucion
Si un SKU no esta disponible, el inventario puede sugerir o aceptar sustituciones segun reglas del dominio.

### Preparacion parcial
El sistema puede mantener parte del pedido en espera mientras otra parte sigue en ejecucion.

### Multi-almacen
El motor puede elegir entre varios almacenes o nodos segun disponibilidad y reglas de fulfillment.

### Liberacion
Cuando un pedido se cancela o se corrige, la reserva debe liberarse de forma trazable.

## Reglas de diseño

1. El inventario debe ser consultable por nodo, SKU y estado.
2. Una reserva debe tener vida propia y trazabilidad.
3. La disponibilidad no debe depender de la interfaz.
4. Kitchen no debe ser el unico lugar donde exista inventario conceptual.
5. Las sustituciones deben quedar explicadas por eventos o registros.

## Eventos sugeridos

- `inventario.disponibilidad.consultada`
- `inventario.reserva.creada`
- `inventario.reserva.liberada`
- `inventario.reserva.consumida`
- `inventario.stock.agotado`
- `inventario.sustitucion.solicitada`
- `inventario.sustitucion.aprobada`

## Criterios de aceptacion

- el inventario puede existir como subsistema independiente;
- reservas y liberaciones tienen trazabilidad;
- la disponibilidad puede calcularse por nodo y almacén;
- Kitchen deja de concentrar la semantica del stock;
- fulfillment puede operar con inventario como dependencia separada.

## Criterio de cierre
U1.4 se considerara estable cuando el inventario pueda crecer y especializarse sin obligar a redisenar pedidos, fulfillment o ledger.

## Referencias
- [`docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md)
- [`docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md)
- [`docs/architecture/U1_2_FULFILLMENT_ENGINE_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_2_FULFILLMENT_ENGINE_V1.md)
- [`docs/architecture/U1_3_LEDGER_FINANCIERO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_3_LEDGER_FINANCIERO_V1.md)
