# ACTA DE INICIO DEL PILOTO CONTROLADO 003

## Identificacion

- Proyecto: `Nelly Delivery`
- Rama operativa: `pilot-support`
- Estado: `INICIADO`
- Fecha: 2026-08-01
- Referencia de liberacion: `GO_LIVE_CERTIFICATION_001`

## Proposito

Dejar constancia del arranque operativo del piloto controlado sobre un baseline ya certificado, congelado en `main`, con soporte y seguimiento activo en `pilot-support`.

## Condiciones de arranque

- Baseline funcional certificado.
- Dataset de certificacion saneado.
- Contrato consistente.
- Panel, cocina y driver validados.
- Flujo E2E completo verificado.
- Conductor elegible validado para cierre de certificacion.

## Alcance operativo

- Ejecucion controlada de pedidos reales.
- Monitoreo cercano de panel, cocina y driver.
- Registro de incidencias bajo `Nelly Engineering Protocol v2.1`.
- Correccion solo con evidencia reproducible.

## Reglas

- No tocar reglas de negocio certificadas sin evidencia nueva.
- No reabrir investigaciones cerradas sin regresion.
- No modificar mas de una capa por incidencia.
- Mantener `main` congelado.

## Referencias

- [`GO_LIVE_CERTIFICATION_001.md`](./GO_LIVE_CERTIFICATION_001.md)
- [`GO_LIVE_READINESS_CHECKLIST.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/investigaciones/GO_LIVE_READINESS_CHECKLIST.md)
- [`pilot-support`](../../../README.md)

## Cierre

El piloto controlado entra en ejecucion bajo supervision operativa.
