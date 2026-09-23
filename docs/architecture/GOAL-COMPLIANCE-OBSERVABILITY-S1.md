# GOAL-COMPLIANCE-OBSERVABILITY-S1

**Estado:** `VALIDATED - PENDING CERTIFICATION`
**Fecha:** 2026-09-23
**Propietario tecnico:** Backend Nelly OS

## Problema y alcance

El flujo operativo necesitaba conservar evidencia durable sobre actividad de reparto, versiones de algoritmo, decisiones de despacho y solicitudes de revision sin alterar el contrato de pedidos, el Ledger financiero ni los sistemas Fiscal/Legal certificados.

Este Sprint incorpora rutas backend bajo `/api/operational-evidence` y RTDB como almacenamiento operativo:

- `work_ledger/{driver_id}/{event_id}` para hechos operativos append-only;
- `algorithm_versions/{algorithm_id}/{version}` para versiones de criterios de dispatch;
- `dispatch_decisions/{order_id}/{decision_id}` para evidencia de decisiones;
- `human_reviews/{review_id}` para expedientes de revision humana no ejecutiva.

Tambien expone proyecciones de solo lectura:

- `GET /drivers/:id/productivity` a partir de `work_ledger`;
- `GET /merchants/:id/performance` a partir de resultados operativos de pedidos;
- `GET /drivers/:id/status-simulation` en modo `CALCULATION_ONLY`.

## No alcance estricto

- No modifica `pedidos/{id}` ni adjudica, reasigna o completa pedidos.
- No escribe pagos, comisiones, settlement, tarifas ni el Ledger Financiero V1.
- No modifica Fiscal V1.1, Legal OS V1 ni su Cross Gate certificado.
- No calcula estatus laboral, IMSS, impuestos, recibos, retenciones o reglas de remuneracion.
- Una decision de `human_reviews` no suspende, bloquea, desactiva ni modifica acceso de un repartidor.
- La simulacion de estado no cambia disponibilidad, estatus laboral, pagos, retenciones, IMSS ni datos de RTDB.
- Productividad y desempeno no calculan ingresos, comisiones, tarifas, liquidaciones ni otra metrica monetaria.

## Controles

- El backend autentica al actor y controla el acceso por rol.
- Los eventos de trabajo y dispatch usan identificadores idempotentes y timestamps de servidor para su registro.
- La evidencia de dispatch solo documenta una decision; no ejecuta el algoritmo ni modifica la asignacion existente.
- Las decisiones humanas permitidas son `RECEIVED`, `NEEDS_INFORMATION` y `CLOSED_NO_ACTION`.
- El desempeno comercial requiere actor privilegiado; productividad y simulacion solo se exponen al repartidor titular o a un actor privilegiado.

## Evidencia de validacion

Las suites `tests/operational-evidence.test.js` y `tests/env-loader.test.js` verifican idempotencia, aislamiento de pedidos, la frontera no ejecutiva de revision humana y que el arranque no imprima valores secretos.

Corrida local del 2026-09-23:

```text
npm.cmd test -- --runInBand tests/operational-evidence.test.js tests/env-loader.test.js tests/delivery_panel.test.js
3 suites passed / 34 tests passed

npm.cmd run validate:routes
validate-routes: OK

git diff --check
clean (solo avisos CRLF)
```

Control completo posterior al cierre de regresiones:

```text
npm.cmd test -- --runInBand
81 suites passed / 301 tests passed
```

No hay despliegue ni certificacion de produccion en este goal. La certificacion de produccion sigue requiriendo una corrida controlada contra el entorno desplegado.
