# DOMAIN_CERT_001 - Protocolo Oficial de Certificacion de Dominio

## Portada

| Campo | Valor |
|---|---|
| Documento | `DOMAIN_CERT_001` |
| Titulo | Protocolo Oficial de Certificacion de Dominio |
| Version | `1.0` |
| Estado | `CERTIFICADO` |
| Clasificacion | `Documento rector de calidad` |
| Proyecto | `Nelly Delivery` |
| Fecha de emision | `2026-08-01` |
| Vigencia | Hasta nueva version aprobada |

## Identificador

- Codigo: `DOMAIN_CERT_001`
- Version semantica: `1.0`
- Estado rector: `CERTIFICADO`
- Tipo: `Documento rector de calidad`
- Proyecto: `Nelly Delivery`

## Proposito

Establecer el protocolo formal de certificacion funcional del dominio para validar que la maquina de estados, las reglas financieras y los bloqueos operativos de Nelly Delivery se comportan exactamente como fueron disenadas.

Este documento no es una nota de investigacion. Es la referencia maestra para:

- certificar flujo feliz
- certificar rutas negativas
- congelar datasets de prueba
- definir evidencia obligatoria
- ordenar gates de liberacion
- proteger la repetibilidad del piloto

## Alcance

Aplica a:

- `dispatch-order`
- `accept-order`
- `complete-order`
- reglas de deuda y bloqueo del repartidor
- validacion de estados del pedido
- actualizacion de RTDB y finanzas
- trazabilidad con `traceId`

No aplica a:

- optimizaciones de rendimiento
- cambios visuales de UI
- ajustes temporales del runner
- experimentos de infraestructura

## Principios de certificacion

1. La evidencia manda sobre la hipotesis.
2. Un caso negativo aprobado sigue siendo un exito si el dominio lo define asi.
3. Un cambio de estado solo es valido si respeta la maquina de estados oficial.
4. No se debe alterar el backend para hacer pasar una prueba.
5. Todo resultado debe ser reproducible.
6. Toda certificacion debe tener dataset, evidencia y acta.

## Reglas operativas

- No mezclar entornos durante una misma certificacion.
- No ejecutar pruebas paralelas sobre el mismo pedido de certificacion.
- No reutilizar pedidos de produccion para validar casos de dominio.
- No cambiar codigo durante una certificacion activa.
- No cerrar una fase sin trazabilidad completa.

## Entorno certificado

El entorno debe quedar congelado antes de certificar:

- un solo backend objetivo
- una unica configuracion de autenticacion
- dataset de prueba controlado
- logs con `traceId`
- repo limpio o con cambios documentados

## Dataset oficial

Ver [`docs/certificaciones/DATASET_DOMAIN_CERT_001.md`](./certificaciones/DATASET_DOMAIN_CERT_001.md).

## Matriz oficial de casos

Ver [`docs/certificaciones/REGRESSION_SUITE_DOMAIN.md`](./certificaciones/REGRESSION_SUITE_DOMAIN.md).

## Evidencia obligatoria

Cada caso debe registrar como minimo:

- identificador del caso
- `traceId`
- fecha y hora
- payload enviado
- codigo HTTP
- estado antes
- estado despues
- logs relevantes
- resultado `PASS` o `FAIL`

## Criterios de aceptacion

La certificacion del dominio se considera aprobada cuando:

- las transiciones validas completan correctamente
- las transiciones invalidas retornan el codigo esperado
- el flujo feliz termina en `ENTREGADO`
- los bloqueos financieros se aplican correctamente
- la actualizacion de finanzas es coherente con el pedido
- no existen estados inconsistentes

## Gates de calidad

### Gate G1 - Integridad tecnica

Verifica build, despliegue, endpoints y accesibilidad del backend.

### Gate G2 - Certificacion de dominio

Verifica la maquina de estados, la deuda, los bloqueos y el flujo feliz.

### Gate G3 - Certificacion operativa del piloto

Verifica el comportamiento del sistema con datos de operacion controlados.

### Gate G4 - Aprobacion para produccion

Se habilita solo cuando G1, G2 y G3 estan cerrados.

## Versionado

- Este documento versiona el protocolo rector.
- Cambios menores compatibles se registran en `docs/certificaciones/CHANGELOG_DOMAIN_CERT.md`.
- Cambios incompatibles requieren nueva version del protocolo.
- El historial de aprobaciones se conserva en `docs/certificaciones/CERT_HISTORY/`.
- La aprobacion de una nueva version requiere evidencia reproducible, dataset certificado y acta firmada.

## Anexos

- [`docs/certificaciones/DATASET_DOMAIN_CERT_001.md`](./certificaciones/DATASET_DOMAIN_CERT_001.md)
- [`docs/certificaciones/ACTA_DOMAIN_CERT_TEMPLATE.md`](./certificaciones/ACTA_DOMAIN_CERT_TEMPLATE.md)
- [`docs/certificaciones/REGRESSION_SUITE_DOMAIN.md`](./certificaciones/REGRESSION_SUITE_DOMAIN.md)
- [`docs/certificaciones/CHANGELOG_DOMAIN_CERT.md`](./certificaciones/CHANGELOG_DOMAIN_CERT.md)

## Conclusiones

`DOMAIN_CERT_001` queda definido como el documento rector certificado para el dominio de Nelly Delivery. Su version 1.0 se considera aprobada para mantenimiento controlado y base de liberacion futura.

## Firma tecnica

| Rol | Nombre | Firma | Fecha |
|---|---|---|---|
| Responsable tecnico |  |  |  |
| Revisor de calidad |  |  |  |
| Aprobacion final |  |  |  |
