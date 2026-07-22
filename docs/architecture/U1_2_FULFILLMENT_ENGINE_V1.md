# U1.2 - FULFILLMENT ENGINE V1

## Fecha
2026-07-22

## Proposito
Definir el motor de fulfillment como la capa que coordina la ejecucion operativa de un pedido a traves de uno o varios nodos de cumplimiento, manteniendo Kitchen como una implementacion mas y no como el centro de la arquitectura.

## Alcance
Este documento define el comportamiento conceptual del motor de fulfillment. No implementa integraciones ni altera el flujo certificado de Kitchen Premium.

## Objetivos

- recibir pedidos validados desde el dominio;
- asignarlos a un nodo de cumplimiento adecuado;
- coordinar estados operativos;
- propagar eventos de ejecucion;
- mantener trazabilidad de la mision hasta su cierre.

## Responsabilidades

### 1. Recepcion de trabajo
El motor recibe una solicitud de fulfillment ya validada desde `Pedido`.

Debe conocer:

- identificador del pedido;
- tipo de servicio;
- restricciones logisticas;
- prioridad;
- nodo de cumplimiento candidato.

### 2. Seleccion de nodo
El motor decide donde ejecutar el trabajo.

Nodos posibles:

- Kitchen;
- tienda;
- almacén;
- farmacia;
- comercio externo;
- cualquier nodo compatible con el contrato.

La seleccion debe depender de capacidades, zona, disponibilidad y reglas del dominio, no de la UI.

### 3. Orquestacion operativa
El motor coordina la vida util de la mision:

- validado;
- asignado;
- en preparacion;
- listo;
- en ruta;
- entregado;
- cancelado;
- reasignado.

### 4. Propagacion de eventos
Cada cambio relevante debe emitir un evento de dominio o de ejecucion para observabilidad, sincronizacion y analitica.

### 5. Trazabilidad
El motor debe conservar:

- nodo que asumio el trabajo;
- timestamps relevantes;
- actor responsable;
- razon de cambio de estado;
- evidencia asociada cuando aplique.

## Estados sugeridos

- `pendiente`
- `validado`
- `asignado`
- `en_preparacion`
- `listo`
- `en_ruta`
- `entregado`
- `cancelado`
- `reasignado`

## Entradas canonicas

- `pedido_id`
- `fulfillment_node_id`
- `tipo_servicio`
- `restricciones`
- `prioridad`
- `evento_disparador`
- `contexto_operativo`

## Salidas canonicas

- `estado`
- `nodo_asignado`
- `evento_emitido`
- `timestamp`
- `resultado`
- `motivo`

## Reglas

1. Kitchen no define la arquitectura completa del fulfillment.
2. El motor no debe depender de la UI para decidir.
3. El motor debe emitir eventos, no solo mutar estado.
4. La reasignacion debe ser explicable y trazable.
5. La entrega solo puede cerrarse si el dominio lo permite.

## Relacion con U1.1

- `Pedido` es la solicitud.
- `Fulfillment Engine` es el orquestador.
- `Nodo de cumplimiento` es el ejecutor.
- `Evento` registra los cambios.

## Casos de uso

### Kitchen
- recibe pedidos de comida;
- prepara;
- marca listo;
- cede el flujo al reparto.

### Marketplace
- recibe pedidos con multiples items;
- puede derivar a distintos nodos;
- coordina preparacion parcial o consolidada.

### Inventario
- deriva trabajo a un almacén;
- reserva y libera stock segun reglas;
- puede notificar faltantes o sustituciones.

### Servicios externos
- permite nodos de terceros bajo contrato;
- mantiene el mismo flujo conceptual;
- evita codificar reglas por cada integracion.

## Criterios de aceptacion

- Kitchen deja de ser el unico centro de pensamiento operativo;
- el motor puede dirigir trabajo a distintos nodos;
- el flujo se entiende igual para Kitchen, marketplace o almacén;
- la trazabilidad queda separada de la interfaz.

## Criterio de cierre
U1.2 se considerara estable cuando el motor pueda describir y coordinar fulfillment para varios tipos de nodo sin modificar la semantica central del pedido.

## Referencias
- [`docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md)
- [`docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md)
- [`docs/architecture/INDEX_U1_PLATAFORMA_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/INDEX_U1_PLATAFORMA_UNIVERSAL_V1.md)
