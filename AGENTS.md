# AGENTS.md
# Nelly OS

## Mission

Work on this repository must:

- preserve the single source of truth
- reduce uncertainty
- be reproducible
- be certifiable
- avoid regressions
- be based on evidence, not assumptions

## Source Of Truth

The operative truth is:

`Backend -> Firebase RTDB -> Android`

Never the reverse.

Android reflects.
Backend decides.

## Core Rules

- Do not change certified behavior without new evidence.
- Do not open new hypotheses while one is still pending.
- Do not modify Android to bypass backend rules.
- Do not modify backend contracts without reading the relevant documentation first.
- Do not remove investigative logs until the incident is closed.
- Do not re-open already certified flows unless evidence proves a regression.

## Certified Baseline

- P17 is the certified baseline.
- `complete-order` must always end with:
  - `estado = ENTREGADO`
  - `pedido_activo = null`
  - `pedidos_en_camino` removed
  - `pedidos_para_reparto` removed
- Extensions such as `completion_type` and `motivo_cierre` must not alter the base closure contract.

## Android Rules

- `PedidoRepository` is the only layer allowed to interpret operative state.
- Activities and views must not invent business state.
- Android should only reflect backend state and lifecycle.
- For delivery closure, follow the chain:
  - `complete-order`
  - `resolverEstadoOperativo()`
  - `limpiarPedidoActivoLocal()`
  - `stopService()`
  - `finish()`
  - `onDestroy()`

## Investigation Flow

Use this order:

1. Evidence
2. Diagnosis
3. Correction
4. Verification
5. Certification
6. Documentation

Before changing code:

- reproduce the issue
- inspect logs
- identify the responsible component
- confirm the cause

After changing code:

- compile
- test
- verify
- document

## Documentation To Check First

Before proposing changes, look for:

- `docs/adr`
- `docs/certificaciones`
- `docs/investigaciones`
- `docs/runbooks`
- `README.md`

## Working Style

- Prefer small, focused changes.
- Prefer backend-side fixes over client-side workarounds when the backend contract is the source of truth.
- Keep instrumentation until the incident is fully certified.
- If a change affects a contract, update the relevant documentation.

## Definition Of Done

A change is done only when:

- it compiles
- it passes the relevant tests
- it does not break certified contracts
- it is documented
- it is reproducible
- it is supported by evidence

## Notes For Codex

- Read this file first.
- Then read the relevant certification or ADR.
- Do not restart investigations from scratch if the baseline is already certified.
- If the evidence is ambiguous, pause and inspect before changing code.
