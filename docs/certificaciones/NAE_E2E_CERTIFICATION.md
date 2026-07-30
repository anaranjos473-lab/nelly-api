# NAE E2E Certification

## Estado

APPROVED

## Objetivo

Demostrar de forma reproducible que un pedido puede recorrer todo Nelly sin perder consistencia, usando el Nelly Archive Engine como bus interno de lectura y archivado.

## Alcance

- Verificar el flujo completo desde creacion del pedido hasta auditoria.
- Confirmar que Cocina, Logistica, Centro Comercial, Historial, Finanzas, Analytics y Auditoria consumen el contrato correcto.
- Validar el scheduler diario, los resúmenes agregados y el indice de auditoria.
- Registrar evidencia por cada transición.

## Caso maestro

1. Crear pedido.
2. Pasar por Cocina.
3. Pasar por Logistica.
4. Completar entrega.
5. Ejecutar scheduler diario.
6. Verificar archivado.
7. Verificar resumen mensual.
8. Verificar resumen anual.
9. Verificar Analytics.
10. Verificar Auditoria.

## Matriz de certificacion

| ID | Validacion | Evidencia | Resultado |
|---|---|---|---|
| E01 | Pedido creado | Captura / ID / hora | Pendiente |
| E02 | Visible en Cocina | Captura | Pendiente |
| E03 | Visible en Logistica | Captura | Pendiente |
| E04 | Entrega correcta | Estado final | Pendiente |
| E05 | Scheduler ejecutado | Log | Pendiente |
| E06 | Archivado | Historial | Pendiente |
| E07 | Monthly Summary actualizado | Dashboard / contrato | Pendiente |
| E08 | Annual Summary actualizado | Dashboard / contrato | Pendiente |
| E09 | Analytics actualizado | Dashboard | Pendiente |
| E10 | Auditoria consistente | Dashboard / reglas | Pendiente |

## Casos negativos

### Caso N1 - Pago faltante

Esperado:

- debe aparecer en Auditoria;
- no debe ocultarse silenciosamente.

### Caso N2 - Pedido cancelado

Esperado:

- no debe archivarse como entregado;
- debe conservar la clasificacion correcta.

### Caso N3 - Scheduler ejecutado dos veces

Esperado:

- no duplica registros;
- no duplica indices;
- el resultado permanece idempotente.

### Caso N4 - Contrato no disponible

Esperado:

- entra el fallback temporal definido por cada consumidor;
- el sistema reporta el estado sin romper la operacion.

### Caso N5 - Recuperacion del contrato

Esperado:

- el consumidor vuelve automaticamente al contrato principal.

## Criterios de cierre

El sprint solo puede considerarse completo cuando exista evidencia reproducible de:

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
- No se cambia la UI por motivos estéticos.

## Siguiente paso

Si esta certificacion pasa, el proyecto entra al sprint [`NAE-CLEANUP`](./NAE_CLEANUP.md) para retirar fallbacks temporales, congelar `DataAccessService v1` y eliminar accesos directos a las colecciones operativas.

## Acta de cierre

- [`ACTA_CIERRE_NAE_E2E_V1.md`](./ACTA_CIERRE_NAE_E2E_V1.md)

## Historial de cambios

- 2026-07-30: documento base creado para la certificacion E2E del NAE.
