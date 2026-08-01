# ACTA DE CERTIFICACION - DOMAIN_CERT_001

## Identificacion

| Campo | Valor |
|---|---|
| Codigo | `DOMAIN_CERT_001` |
| Documento | `Acta de certificacion del dominio` |
| Version | `1.0` |
| Estado | `ABIERTO` |
| Proyecto | `Nelly Delivery` |
| Fecha | `2026-08-01` |
| Responsable tecnico | `Codex` |
| Revisor de calidad | `Pendiente de firma` |
| Commit evaluado | `Pendiente de cierre` |

## Resumen ejecutivo

Este acta registra la certificacion funcional del dominio de Nelly Delivery.
Su objetivo es demostrar, con evidencia reproducible, que las reglas de negocio
fundamentales operan de forma correcta bajo condiciones controladas.

## Objetivo

Certificar que las transiciones del pedido, el estado del repartidor, las reglas
financieras y los rechazos esperados se comportan exactamente como el dominio lo define.

## Alcance

Incluye la validacion de:

- `dispatch-order`
- `accept-order`
- `complete-order`
- disponibilidad del repartidor
- bloqueo por deuda
- limite financiero
- transiciones de estado
- respuestas HTTP esperadas
- consistencia del estado antes y despues de cada operacion

No incluye:

- UI del panel
- validacion visual
- responsive
- render de cocina
- logistica visual
- CRM
- Analytics
- Developer Center
- pruebas de carga
- rendimiento

## Entorno

Durante la certificacion:

- entorno congelado
- mismo commit
- mismo backend
- mismo dataset
- sin cambios de codigo
- sin despliegues intermedios

## Dataset utilizado

Ver [`DATASET_DOMAIN_CERT_001.md`](./DATASET_DOMAIN_CERT_001.md).

## Casos ejecutados

Ver [`DOMAIN_CERT_CASES.md`](./DOMAIN_CERT_CASES.md).

## Resultados

Ver [`DOMAIN_CERT_RESULTS.md`](./DOMAIN_CERT_RESULTS.md).

## Hallazgos

- El flujo feliz debe terminar en `ENTREGADO`.
- El bloqueo por deuda debe responder `403`.
- La transicion invalida debe responder `409`.

## Riesgos abiertos

- Mantener el dataset de certificacion separado de la operacion real.
- Revalidar si cambian las reglas financieras o la maquina de estados.

## Conclusiones

La certificacion del dominio se considera lista para ejecucion y cierre
cuando la matriz de casos quede completada con evidencia reproducible.

## Firma tecnica

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Responsable tecnico | Codex |  | 2026-08-01 |
| Revisor de calidad |  |  |  |
| Aprobacion final |  |  |  |
