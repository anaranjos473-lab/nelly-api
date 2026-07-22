# U1.3 - LEDGER FINANCIERO V1

## Fecha
2026-07-22

## Proposito
Definir el ledger financiero como la fuente inmutable y auditable de toda operacion economica de la plataforma, para que el saldo acumulado pase a ser una vista derivada y no el nucleo de la contabilidad.

## Alcance
Este documento define la estructura conceptual del ledger. No reemplaza la logica certificada existente ni modifica la baseline funcional de Kitchen Premium.

## Objetivos

- registrar movimientos financieros atomicos e inmutables;
- soportar comisiones, propinas, cupones, reembolsos, devoluciones y conciliaciones;
- permitir auditoria completa y trazabilidad temporal;
- desacoplar el impacto contable de los saldos derivados;
- habilitar una base comun para Kitchen, marketplace y otros verticales.

## Principios

1. Cada movimiento existe una sola vez.
2. Un movimiento nunca se edita para cambiar su verdad historica; se corrige con otro movimiento.
3. El saldo es una proyeccion, no la fuente de verdad.
4. Toda operacion financiera debe tener referencia de origen.
5. Toda conciliacion debe poder reconstruirse desde el historial.

## Entidad canonica: Movimiento financiero

Responsabilidad:

- registrar el impacto economico de un evento de negocio;
- conservar quien lo genero, por que y cuando;
- permitir reconstruccion de balances historicos.

Campos conceptuales:

- `id`
- `tipo`
- `subtipo`
- `origen`
- `referencia_id`
- `actor_id`
- `monto`
- `moneda`
- `saldo_antes`
- `saldo_despues`
- `ocurrido_en`
- `registrado_en`
- `metadata`

## Tipos de movimiento

- `cargo`
- `abono`
- `comision`
- `propina`
- `reembolso`
- `devolucion`
- `ajuste`
- `reversa`
- `conciliacion`

## Regla de inmutabilidad

El ledger no se corrige sobrescribiendo el pasado. Si una transaccion necesita ajustar una operacion previa, debe generar un movimiento adicional que explique la diferencia y conserve trazabilidad completa.

## Relacion con saldo

El saldo puede existir como vista derivada por entidad, por rango de fechas o por corte, pero no reemplaza al ledger.

La vista de saldo debe poder responder:

- cuanto habia antes;
- que movimientos ocurrieron;
- cual es el saldo despues;
- por que cambio.

## Relacion con pedidos

Un pedido puede generar uno o varios movimientos:

- cobro al cliente;
- comision de la plataforma;
- ganancia del repartidor;
- ajuste por reembolso o cancelacion;
- conciliacion de cierre.

## Relacion con fulfillment

El fulfillment puede disparar movimientos, pero no debe contener la logica contable completa. La orquestacion operativa y la contabilidad son responsabilidades distintas.

## Relacion con inventario

El inventario puede disparar reservas o liberaciones con impacto financiero potencial, pero el ledger debe registrar el efecto economico solo cuando la regla de negocio lo requiera.

## Reglas de diseño

1. Ningun saldo aislado debe considerarse suficiente para auditoria.
2. Ningun movimiento debe depender del render.
3. Ninguna correccion debe sobrescribir el historial.
4. Toda conciliacion debe poder reproducirse con los eventos de origen.
5. Kitchen, marketplace y otros nodos deben compartir el mismo lenguaje contable.

## Eventos sugeridos

- `ledger.movimiento.registrado`
- `ledger.saldo.calculado`
- `ledger.conciliacion.ejecutada`
- `ledger.reversion.aplicada`
- `ledger.ajuste.creado`

## Casos de uso

### Pedido entregado
Se registran los movimientos que correspondan a la operacion cerrada.

### Reembolso
Se registra una reversa o abono de ajuste, no un borrado del cargo original.

### Conciliacion
Se recalcula o se valida la vista derivada a partir del historial.

### Corte
Se consolida un periodo financiero sin perder la historia de movimientos previos.

## Criterios de aceptacion

- el sistema puede reconstruir el estado economico desde el historial;
- cada impacto economico queda representado por un movimiento;
- el saldo derivado coincide con la suma de los movimientos aplicables;
- las correcciones no destruyen el rastro historico;
- la arquitectura soporta multiples tipos de negocio sin cambiar el modelo contable.

## Criterio de cierre
U1.3 se considerara estable cuando el ledger pueda usarse como fuente unica de auditoria financiera y las vistas de saldo se generen como derivacion controlada.

## Referencias
- [`docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_PLAN_FORMAL_PLATAFORMA_UNIVERSAL_V1.md)
- [`docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_1_MODELO_DOMINIO_UNIVERSAL_V1.md)
- [`docs/architecture/U1_2_FULFILLMENT_ENGINE_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U1_2_FULFILLMENT_ENGINE_V1.md)
