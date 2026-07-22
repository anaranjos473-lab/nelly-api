# U1.6 - EVENTOS DE DOMINIO V1

## Fecha
2026-07-22

## Proposito
Definir el sistema de eventos de dominio como la capa de observabilidad, extensibilidad y reaccion desacoplada del modelo universal, permitiendo que la plataforma evolucione sin modificar el flujo principal.

## Alcance
Este documento define el contrato conceptual de eventos para U1. No implementa bus de eventos ni altera la baseline certificada de Kitchen Premium.

## Objetivos

- publicar hechos de negocio relevantes;
- separar reacciones secundarias del flujo operativo principal;
- dar trazabilidad temporal a cada cambio importante;
- habilitar integraciones y procesos derivados;
- permitir evolucion sin acoplar consumidores al dominio central.

## Principios

1. Un evento representa algo que ya ocurrio.
2. Un evento no es una instruccion, es un hecho.
3. Los eventos no deben depender de la UI.
4. Un mismo evento puede alimentar multiples consumidores.
5. Los eventos no deben reescribir el pasado.

## Entidad canonica: Evento de dominio

Responsabilidad:

- registrar un hecho de negocio con contexto minimo suficiente;
- conectar cambios de dominio con observabilidad e integraciones;
- servir como linea de tiempo reproducible.

Campos conceptuales:

- `id`
- `tipo`
- `aggregate_id`
- `aggregate_tipo`
- `actor_id`
- `origen`
- `ocurrido_en`
- `registrado_en`
- `correlation_id`
- `causation_id`
- `payload`
- `metadata`

## Propiedades requeridas

- inmutabilidad;
- orden temporal;
- trazabilidad;
- identificacion del agregado;
- capacidad de correlacion con otros eventos.

## Tipos de evento sugeridos

- `pedido.creado`
- `pedido.validado`
- `pedido.asignado`
- `pedido.en_preparacion`
- `pedido.listo`
- `pedido.en_ruta`
- `pedido.entregado`
- `pedido.cancelado`
- `pago.confirmado`
- `pago.rechazado`
- `ledger.movimiento.registrado`
- `inventario.reserva.creada`
- `inventario.reserva.liberada`
- `integracion.error`
- `fulfillment.nodo.asignado`

## Relacion con el dominio

### Pedido
Cada cambio importante del pedido debe poder generar un evento.

### Fulfillment
El motor de fulfillment publica eventos de asignacion, preparacion, en ruta y cierre.

### Ledger
Los movimientos financieros pueden derivarse de eventos del dominio, pero su registro debe ser explicito.

### Inventario
Reservas, liberaciones y faltantes deben producir eventos consultables.

### Integraciones
Los conectores consumen eventos para sincronizar sistemas externos sin invadir el core.

## Correlation y causation

- `correlation_id` agrupa eventos de una misma operacion o flujo.
- `causation_id` enlaza el evento actual con el evento que lo provoco.

Esto permite reconstruir secuencias como:

`pedido.creado -> pedido.validado -> fulfillment.nodo.asignado -> pedido.listo -> pago.confirmado -> pedido.entregado`

## Reglas de diseño

1. Ningun consumidor debe necesitar mutar el evento original.
2. El evento debe contener contexto suficiente para auditoria.
3. La emision del evento no debe depender del render.
4. El mismo evento puede disparar sincronizacion, ledger, analitica e integraciones.
5. La ausencia de evento relevante debe poder detectarse como incidencia.

## Estados sugeridos de procesamiento

- `emitido`
- `persistido`
- `consumido`
- `reintentando`
- `fallido`

## Casos de uso

### Observabilidad
Permite reconstruir el recorrido de un pedido desde su creacion hasta su cierre.

### Integraciones
Un ERP o un WMS puede suscribirse a eventos sin conocer la estructura interna del dominio.

### Auditoria
Los movimientos y cambios relevantes pueden auditarse con una linea temporal comun.

### Automatizacion
Una nueva regla de negocio puede reaccionar a un evento sin modificar el flujo principal.

## Criterios de aceptacion

- los eventos representan hechos y no comandos;
- el dominio puede crecer con consumidores multiples;
- la trazabilidad temporal queda preservada;
- fulfillment, ledger e inventario pueden emitir eventos comunes;
- el modelo no depende de la interfaz para ser observable.

## Criterio de cierre
U1.6 se considerara estable cuando el sistema pueda publicar y correlacionar eventos de dominio para soportar observabilidad, integraciones y automatizacion sin tocar el flujo principal.

## Referencias
- [`docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md)
- [`docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md)
- [`docs/architecture/U1_2_FULFILLMENT_ENGINE_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_2_FULFILLMENT_ENGINE_V1.md)
- [`docs/architecture/U1_3_LEDGER_FINANCIERO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_3_LEDGER_FINANCIERO_V1.md)
- [`docs/architecture/U1_4_INVENTARIO_DESACOPLADO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_4_INVENTARIO_DESACOPLADO_V1.md)
- [`docs/architecture/U1_5_INTEGRACIONES_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_5_INTEGRACIONES_V1.md)
