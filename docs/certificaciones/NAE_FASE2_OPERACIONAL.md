# NAE Fase 2 - Certificacion operacional

## Estado

IN VALIDATION

## Objetivo

Validar el comportamiento real del Nelly Archive Engine en un ciclo completo de operacion antes de cerrar la Fase 2 como certificada.

## Escenarios de validacion

### Escenario 1

Crear un pedido, aceptarlo, prepararlo y entregarlo.

Esperado:

- `orders_active` no conserva el pedido entregado como activo.
- `orders_today` conserva el pedido del dia.
- `orders_history` incrementa en 1.
- `monthly_index` se actualiza.

### Escenario 2

Ejecutar el scheduler dos veces sobre el mismo corte.

Esperado:

- no hay duplicados en historial
- los indices no se duplican
- el resultado es idempotente

### Escenario 3

Pedido cancelado.

Esperado:

- no se archiva como entregado
- queda clasificado como cancelado o en incidencia segun la politica definida

### Escenario 4

Pedido pendiente al corte.

Esperado:

- permanece activo
- no se mueve a historial

### Escenario 5

Pedido entregado sin pago donde el pago sea obligatorio.

Esperado:

- no se oculta silenciosamente
- se marca para auditoria o incidencia

## Criterios de cierre

La Fase 2 solo puede pasar a `CERTIFICADA` cuando existan evidencias reproducibles de:

- scheduler automatico funcionando
- archivado diario correcto
- idempotencia real
- indices completos
- auditoria basica operativa

## Observacion

Esta certificacion no modifica el contrato de `complete-order` ni la fuente de verdad operativa.
