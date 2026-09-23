# NELLY COMPLIANCE GAP V1

**Fecha:** 2026-09-23

**Estado:** `LOCAL CERTIFIED - PENDING COMMIT / PRODUCTION RELEASE`

## Regla de estado

`IMPLEMENTADO` no equivale a `PUBLICADO`. Los componentes de esta matriz son
locales hasta completar commit, release aislado, smoke autenticado y evidencia
de produccion.

```text
IMPLEMENTADO -> VALIDADO LOCALMENTE -> PUBLICADO -> CERTIFICADO EN PRODUCCION
```

## Matriz de cumplimiento

| Sprint | Componente | Contrato real | Estado | Limite |
| --- | --- | --- | --- | --- |
| 1A | Work Ledger | `POST /api/operational-evidence/work-events` | `IMPLEMENTED_LOCAL` | Evidencia de trabajo; no calcula dinero. |
| 1A | Work Summary | `GET /api/operational-evidence/drivers/:id/work-summary` | `IMPLEMENTED_LOCAL` | Solo evidencia observada. |
| 1B | Dispatch Decision Log | `POST /api/operational-evidence/dispatch-decisions` | `IMPLEMENTED_LOCAL` | Registra evidencia; no adjudica ni reasigna pedidos. |
| 1B | Dispatch Evidence | `GET /api/operational-evidence/orders/:id/dispatch-evidence` | `IMPLEMENTED_LOCAL` | Visible segun autorizacion. |
| 1C | Algorithm Version | `POST /api/operational-evidence/algorithm-versions` | `IMPLEMENTED_LOCAL` | Requiere `algorithm_id`, `version`, `effective_from`, `criteria`, `change_reason`; `effective_to` es opcional. |
| 1C | Algorithm Version Read | `GET /api/operational-evidence/algorithm-versions/:algorithmId/:version` | `IMPLEMENTED_LOCAL` | Consulta de version registrada. |
| 1D | Human Review | `POST /api/operational-evidence/reviews` | `IMPLEMENTED_LOCAL` | Expediente no ejecutivo. |
| 1D | Human Review Read | `GET /api/operational-evidence/reviews/:id` | `IMPLEMENTED_LOCAL` | Acceso del solicitante o actor privilegiado. |
| 1D | Human Review Decision | `POST /api/operational-evidence/reviews/:id/decisions` | `IMPLEMENTED_LOCAL` | Solo actor privilegiado; no ejecuta cambios operativos. |
| 1E | Driver Productivity | `GET /api/operational-evidence/drivers/:id/productivity` | `IMPLEMENTED_LOCAL` | Indicador operativo; no pago ni estatus laboral. |
| 1F | Merchant Performance | `GET /api/operational-evidence/merchants/:id/performance` | `IMPLEMENTED_LOCAL` | Solo actor privilegiado; no ingreso ni liquidacion. |
| 2 | Driver Status Engine | `GET /api/operational-evidence/drivers/:id/status-simulation` | `CERTIFIED_LOCAL_CALCULATION_ONLY` | No escribe ni determina estatus laboral, pagos, IMSS, fiscal o contratos. |
| 3A | Compliance Readiness | `GET /api/operational-evidence/drivers/:id/compliance-readiness` | `CERTIFIED_LOCAL_READ_ONLY` | Conserva evidencia; earnings/fiscal `NOT_COMPUTED`, weekly statement `NOT_ISSUED`. |
| 3 | IMSS Engine | Sin contrato | `BLOCKED` | Requiere decision legal y de seguridad social atribuible. |
| 3 | Fiscal Engine | Sin contrato | `BLOCKED` | Requiere decision fiscal/contable atribuible. |
| 3 | Contract Engine | Sin contrato | `BLOCKED` | Requiere modelo contractual y ADR. |
| 3 | E-Signature | Sin contrato | `BLOCKED` | Requiere documentos, identidad e integridad definidos. |
| 3 | Weekly Statement | Sin contrato | `BLOCKED` | Requiere Ledger, contrato y politica aprobados. |
| 3 | Settlement Engine | Sin contrato | `BLOCKED` | Requiere Ledger V1 y flujo fiscal aprobados. |

## Evidencia local vigente

```text
82/82 suites PASS
308/308 tests PASS
validate:routes PASS
validate:firebase PASS
git diff --check PASS (sin errores; avisos CRLF preexistentes)
```

## Gate de produccion

Antes de cambiar cualquier fila local a `CERTIFIED_PRODUCTION` se requiere:

1. commit aislado con solo los archivos autorizados;
2. deploy del commit identificado;
3. health check del backend;
4. smoke autenticado de cada ruta publicada;
5. evidencia de que los endpoints de solo lectura no mutan RTDB;
6. registro de SHA, timestamp y resultados.

Los motores Sprint 3 no pueden pasar este gate hasta que
`LEGAL_FISCAL_READINESS_GATE_SPRINT_3.md` sea desbloqueado mediante decisiones
profesionales atribuibles y ADR.
