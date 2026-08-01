# ACTA DE CERTIFICACION - DOMAIN_CERT_001

## Identificacion

| Campo | Valor |
|---|---|
| Codigo | `DOMAIN_CERT_001` |
| Documento | `Acta de certificacion del dominio` |
| Version | `1.0` |
| Estado | `CERTIFICADO` |
| Proyecto | `Nelly Delivery` |
| Fecha | `2026-08-01` |
| Responsable tecnico | `Codex` |
| Revisor de calidad | `Pendiente de firma` |
| Commit evaluado | `50a076d` |

## Resumen ejecutivo

La certificacion funcional del dominio de Nelly Delivery se ejecuto de forma controlada
sobre un entorno congelado y con dataset dedicado.
Los seis casos oficiales completaron la matriz de certificacion con resultado esperado.

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
- mismo backend local certificado
- mismo dataset de certificacion
- sin cambios de codigo durante la ejecucion
- sin despliegues intermedios

## Dataset utilizado

Ver [`DOMAIN_CERT_DATASET.md`](./DOMAIN_CERT_DATASET.md).

## Casos ejecutados

Ver [`DOMAIN_CERT_CASES.md`](./DOMAIN_CERT_CASES.md).

## Resultados

Ver [`DOMAIN_CERT_RESULTS.md`](./DOMAIN_CERT_RESULTS.md).

## Hallazgos

- La ruta feliz completa se certifico con el repartidor `8mo8182LJsgV7vKMSpiCekFKAG23`.
- `accept-order` rechaza correctamente cuando el repartidor esta bloqueado por deuda.
- `complete-order` rechaza correctamente cuando el pedido no esta en reparto.

## Riesgos abiertos

- Mantener el dataset de certificacion separado de la operacion real.
- Revalidar si cambian las reglas financieras o la maquina de estados.

## Conclusiones

La certificacion del dominio queda aprobada.
Las reglas de negocio fundamentales operan de forma correcta bajo condiciones controladas.
La matriz de casos quedo completada con evidencia reproducible.

## Firma tecnica

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Responsable tecnico | Codex |  | 2026-08-01 |
| Revisor de calidad |  |  |  |
| Aprobacion final |  |  |  |
