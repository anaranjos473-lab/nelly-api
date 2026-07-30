# NAE Fase 2 - Automatizacion y clasificacion

## Estado

IMPLEMENTADA

## Objetivo

Formalizar la fase 2 del Nelly Archive Engine para clasificar pedidos vivos, pedidos del dia, historial diario e indices resumidos sin alterar el contrato de `complete-order`.

## Alcance

- Clasificacion de pedidos en `orders_active`, `orders_today` y `orders_history`.
- Generacion de `monthly_index`.
- Generacion de `annual_summary`.
- Generacion de `history_index`.
- Ejecucion automatica diaria del archivado a las `00:05` hora local de Mexico City.

## Validaciones realizadas

- Pruebas unitarias del clasificador y del update idempotente.
- Verificacion de sintaxis en el servicio, scheduler y servidor.

## Certificacion operativa pendiente

La fase no se considera `CERTIFICADA` hasta completar una validacion E2E con datos reales que demuestre:

- ejecucion automatica del scheduler
- archivado sin duplicados
- preservacion de pedidos activos
- indice mensual y anual consistentes
- auditoria basica sobre entregados sin pago cuando aplique

## Criterios de aceptacion

- El job diario debe ser idempotente.
- Los pedidos entregados del dia deben archivarse en `orders_history/YYYY-MM-DD`.
- Los pedidos activos no deben perder su estado operativo.
- El indice mensual y anual debe generarse sin duplicidad.

## Observacion

La fase queda preparada para integrarse con Cocina, Logistica, Centro Comercial, Finanzas, Analytics y Auditoria como consumidoras de lectura.
