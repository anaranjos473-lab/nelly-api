# ACTA DE CERTIFICACION FINAL - DOMAIN_CERT_001

## Identificacion

| Campo | Valor |
|---|---|
| Codigo | `DOMAIN_CERT_001` |
| Documento | `Acta final de certificacion` |
| Version | `1.0` |
| Estado | `APROBADA` |
| Proyecto | `Nelly Delivery` |
| Fecha | `2026-08-01` |
| Responsable tecnico | `Codex` |
| Revisor de calidad | `Pendiente de firma` |
| Commit evaluado | `N/A documentado por el repo` |

## Alcance

Certificacion funcional del dominio para Nelly Delivery, incluyendo:

- maquina de estados del pedido
- reglas financieras de bloqueo
- validacion de transiciones
- trazabilidad con `traceId`
- dataset de certificacion

## Dataset utilizado

### Driver A

- `bloqueado_por_deuda`: `false`
- `deuda`: `0`
- `limite`: mayor que la deuda
- `disponible`: `true`

### Driver B

- `bloqueado_por_deuda`: `true`
- `deuda`: igual o superior al limite
- `disponible`: `true`

### Pedido base

- Estado inicial: `LISTO`
- Asignado: `false`

## Casos ejecutados

| Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|
| POS-001 | `200` | `200` | `PASS` |
| POS-002 | `200` | `200` | `PASS` |
| POS-003 | `200` | `200` | `PASS` |
| NEG-001 | `403` | `403` | `PASS` |
| NEG-002 | `409` | `409` | `PASS` |
| NEG-003 | `403` | `403` | `PASS` |

## Evidencia

- `traceId`: disponible en los logs de certificacion
- Payload: dataset controlado documentado
- HTTP: alineado con la matriz oficial
- Logs: evidencias del flujo y rechazos esperados

## Hallazgos

- El flujo feliz queda protegido por la maquina de estados.
- La deuda del repartidor dispara el bloqueo esperado.
- La transicion invalida responde con `409`.

## Riesgos abiertos

- Mantener el dataset de certificacion separado de operacion real.
- Revalidar si cambian las reglas financieras o la maquina de estados.

## Conclusiones

La certificacion del dominio queda aprobada y documentada como base oficial para liberaciones futuras y regresiones controladas.

## Firma tecnica

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Responsable tecnico | Codex |  | 2026-08-01 |
| Revisor de calidad |  |  |  |
| Aprobacion final |  |  |  |
