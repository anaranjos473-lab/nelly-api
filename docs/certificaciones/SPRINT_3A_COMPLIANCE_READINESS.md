# SPRINT 3A COMPLIANCE READINESS - CERTIFICACION LOCAL

**Estado:** `CERTIFIED LOCAL - PENDING PRODUCTION RELEASE`

**Fecha:** 2026-09-23

**Objetivo:** Preparar evidencia operacional auditable para revision
profesional sin determinar estatus laboral, obligaciones fiscales, contratos,
pagos o liquidaciones.

## Alcance certificado

`GET /api/operational-evidence/drivers/:driverId/compliance-readiness`

La ruta autenticada compone una proyeccion de solo lectura de:

- `work_ledger/{driver_id}`;
- `dispatch_decisions` donde el repartidor figura como candidato;
- `human_reviews` solicitadas por el repartidor o vinculadas a esas decisiones.

La proyeccion expone tiempos observados por tarea, evidencia de decisiones de
algoritmo y revisiones humanas. Las razones y factores de despacho son
evidencia registrada; no ejecutan ni modifican una asignacion.

## Limites certificados

La respuesta mantiene:

```text
mode: READ_ONLY_PREPARATION
writes_performed: false
earnings.status: NOT_COMPUTED
weekly_statement.status: NOT_ISSUED
fiscal.status: NOT_COMPUTED
```

No calcula ni persiste pagos, ingresos, comisiones, retenciones, IMSS, CFDI,
contratos, firmas, estados semanales o settlement. Tampoco cambia pedidos,
estado laboral, disponibilidad real, Ledger o RTDB.

## Evidencia reproducible

`tests/operational-evidence.test.js` verifica que la proyeccion:

- lee solo las tres rutas RTDB declaradas;
- no muta el estado RTDB simulado;
- conserva los marcadores de no calculo;
- devuelve evidencia de tarea y transparencia algoritmica sin adjudicar pedidos.

Corrida local independiente del 2026-09-23:

```text
82/82 suites PASS
308/308 tests PASS
validate:routes PASS
validate:firebase PASS
git diff --check PASS (sin errores; avisos CRLF preexistentes)
```

## Dependencias y gate

Este artefacto no desbloquea Sprint 3. `IMSS_ENGINE`, `FISCAL_ENGINE`,
`CONTRACT_ENGINE`, `E_SIGNATURE`, `WEEKLY_STATEMENT` y `SETTLEMENT_ENGINE`
permanecen bloqueados por
`docs/architecture/LEGAL_FISCAL_READINESS_GATE_SPRINT_3.md`.

Un release requiere una autorizacion separada, deploy aislado y smoke
autenticado que compruebe lectura sin mutacion en el entorno desplegado.
