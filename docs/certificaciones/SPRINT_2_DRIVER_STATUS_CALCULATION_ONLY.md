# SPRINT 2 DRIVER STATUS ENGINE - CALCULATION ONLY

**Estado:** `CERTIFIED LOCAL - PENDING PRODUCTION RELEASE`

**Fecha:** 2026-09-23

**Alcance:** `GET /api/operational-evidence/drivers/:driverId/status-simulation`

## Contrato certificado

El motor recibe evidencia operativa de `work_ledger`, calcula un resultado de
simulacion y lo devuelve. Su modo fijo es `CALCULATION_ONLY`.

El resultado es un **indicador operativo calculado**. No determina estatus
laboral, fiscal, contractual ni financiero de una persona.

## Efectos prohibidos

Esta ruta no esta autorizada para:

- escribir Firebase o RTDB;
- modificar `pedidos` o cualquier estado operativo real;
- escribir Ledger, pagos, comisiones o liquidaciones;
- calcular pagos, retenciones o IMSS;
- registrar datos fiscales;
- crear o modificar contratos;
- modificar disponibilidad o estatus laboral;
- invocar motores fiscales o contractuales.

La respuesta debe mantener `writes_performed: false` y `effects: []`.

## Evidencia local

`tests/operational-evidence.test.js` comprueba que la simulacion:

- lee exclusivamente `work_ledger/{driver_id}`;
- no altera el estado RTDB simulado;
- devuelve `mode: CALCULATION_ONLY`;
- no declara pagos ni ingresos.

Corrida independiente del 2026-09-23:

```text
82/82 suites PASS
307/307 tests PASS
validate:routes PASS
validate:firebase PASS
```

## Gate posterior

No hay autorizacion de despliegue mediante este documento. Una certificacion
de produccion requiere un release aislado, smoke autenticado y evidencia de
lectura sin mutacion contra el entorno desplegado.

Sprint 3 permanece bloqueado hasta validacion Legal/Fiscal y el cierre del
contrato Ledger V1.
