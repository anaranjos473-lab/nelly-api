# NAE E2E Execution

## Estado

PLANNED

## Objetivo

Ejecutar la certificacion E2E del Nelly Archive Engine y recolectar evidencia reproducible de un ciclo completo de operacion.

## Alcance

- Ejecutar el flujo real de un pedido a traves de Cocina, Logistica, Centro Comercial, Historial, Finanzas, Analytics y Auditoria.
- Registrar evidencia concreta para cada hito E01-E10.
- Verificar los casos negativos definidos en la certificacion.
- Confirmar idempotencia del scheduler y consistencia de los resúmenes.

## Matriz de evidencia

| ID | Validacion | Evidencia requerida | Estado |
|---|---|---|---|
| E01 | Pedido creado | Fecha, hora, ID del pedido, captura | Pendiente |
| E02 | Visible en Cocina | Captura de la cola activa | Pendiente |
| E03 | Visible en Logistica | Captura de la vista diaria | Pendiente |
| E04 | Entrega correcta | Captura / estado final | Pendiente |
| E05 | Scheduler ejecutado | Log con fecha y hora | Pendiente |
| E06 | Archivado | Consulta en Historial | Pendiente |
| E07 | Monthly Summary actualizado | Consulta o captura del resumen mensual | Pendiente |
| E08 | Annual Summary actualizado | Consulta o captura del resumen anual | Pendiente |
| E09 | Analytics actualizado | Captura del dashboard analitico | Pendiente |
| E10 | Auditoria consistente | Captura del indice o alerta correspondiente | Pendiente |

## Evidencia minima por caso

Cada registro debe incluir:

- fecha y hora;
- ID del pedido;
- tipo de evidencia;
- resultado esperado;
- resultado obtenido;
- observaciones.

## Casos negativos

### N1 - Pago faltante

Esperado:

- debe aparecer en Auditoria;
- no debe ocultarse silenciosamente.

### N2 - Pedido cancelado

Esperado:

- no debe archivarse como entregado;
- debe conservar la clasificacion correcta.

### N3 - Scheduler ejecutado dos veces

Esperado:

- no duplica registros;
- no duplica indices;
- conserva idempotencia.

### N4 - Contrato no disponible

Esperado:

- entra el fallback temporal definido por cada consumidor;
- la operacion no se rompe.

### N5 - Recuperacion del contrato

Esperado:

- el consumidor vuelve automaticamente al contrato principal.

## Criterios de cierre

La ejecucion solo puede considerarse completa cuando exista evidencia reproducible de:

- flujo completo de pedido;
- archivado correcto al cierre;
- ausencia de duplicados;
- consistencia entre resúmenes mensuales y anuales;
- coherencia entre Analytics y Finanzas;
- alertas de Auditoria generadas cuando corresponda;
- consumo exclusivo del `DataAccessService` por los centros migrados.

## No alcance

- No se agregan funcionalidades nuevas.
- No se hacen refactors amplios.
- No se crea `v2`.
- No se cambia la UI por motivos esteticos.

## Relacion

- [`NAE_E2E_CERTIFICATION.md`](./NAE_E2E_CERTIFICATION.md)
- [`NAE_CLEANUP.md`](./NAE_CLEANUP.md)
- [`DATA_ACCESS_CONTRACT_v1.md`](./../contracts/DATA_ACCESS_CONTRACT_v1.md)

## Historial de cambios

- 2026-07-30: sprint de ejecucion creado para recolectar evidencia certificable.
