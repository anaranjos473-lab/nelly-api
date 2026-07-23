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

## Nelly Engineering Contract

This file is the operational contract for any developer or AI that works on the repository.

It must be treated as the first source of engineering governance, together with the relevant ADRs and certifications.

The contract covers:

- Nelly's current vision as an operational intelligence platform for delivery.
- The active architecture and certified baseline.
- Design principles and technical conventions.
- Git flow, release flow, and evidence flow.
- Test flow, certification flow, and closure flow.
- Documentation rules for decisions, ADRs, and phase closure.
- The boundary of what an AI may modify and what it must not change without evidence.
- The incremental evolution rule: do not introduce a new capability until the previous one is operational, validated, and documented.

### What an AI may modify

- Focused implementation within the scope of the current task.
- Small refactors that preserve certified behavior.
- Tests, validations, and documentation that match the change.

### What an AI must not modify without evidence

- Certified behavior.
- Backend contracts already validated.
- Android flows that are already certified.
- Observed production-like flows without a reproducible incident.

### Required working cycle

Design -> Goal -> Implementation -> Tests -> Corrections -> Validation -> Documentation -> Commit -> Push -> Certification

### Goal handling

- Every goal should have a unique identifier.
- Each goal should define scope, non-scope, evidence, and exit criteria.
- If a goal is already certified, do not reopen it without evidence of regression.

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
- UI changes must be made from Android Studio and the Android source tree only; do not modify screens from web, docs, or other non-Android paths when the issue belongs to the Android app.
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
- Work by domain rather than by code structure when planning parallel effort.
- Treat AI as a capability enabler, not as an isolated agent authoring business behavior.

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
