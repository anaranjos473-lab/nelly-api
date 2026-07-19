# SYSTEM_STATE.md
# Nelly OS Operational State

This document summarizes what is stable, what is frozen, and what is still under investigation.

## States

| Component | State | Note |
| --- | --- | --- |
| Delivery backend | CERTIFIED | Base `complete-order` flow and closure contract validated. |
| Kitchen -> LISTO | CERTIFIED | This segment is validated and must not be reopened without new evidence. |
| Radar / publication | CERTIFIED | Courier publication works as part of the operational flow. |
| Android Radar / acceptance | STABLE | Authentication and radar reading work; validate without breaking the contract. |
| Android closure | CERTIFIED | The technical closure chain was validated; after completion the Radar returns and stays visible without falling back to the launcher. |
| RC-01 | APPROVED | Clean E2E run validated with a new order: accept, tracking, `complete-order`, local cleanup, and return to Radar. |
| RC-02 | APPROVED | Post-`complete-order` navigation stability validated across consecutive runs without launcher fallback. |
| RC-03 | IN VALIDATION | Map-based courier home has been restored visually; full functional parity is still being verified. |
| Courier finance | STABLE | The logic exists and should not be altered without functional cause. |
| Admin panel | IN ADJUSTMENT | Must distinguish manual block, debt block, and total ineligible. |
| Data model | CONSOLIDATING | `repartidores/{uid}` is the canonical branch; `usuarios/repartidores` remains legacy/compatibility. |
| Courier blocking | CERTIFIED | Operational separation between `bloqueo_manual`, `bloqueo_por_deuda`, and `total_no_elegible`. |

## Frozen

Do not touch without new evidence:

- `routes/delivery.js` in the base closure contract
- the P17 baseline
- the Kitchen -> Radar flow
- already certified contracts

## Under Investigation

- debt-block consistency for the test profile
- final admin panel consolidation onto a single source
- future UX tweaks only if navigation rules change

## Must Not Change Without Evidence

- final order states
- closure contracts
- SSOT rules
- duplicate sources for the same entity
- reinterpreting `bloqueo_manual` as debt blocking

## RC-03A

- State: IN VALIDATION
- Reason: the tactical UI was restored with a visible map, bottom panel, and visual parity with the reference, but full end-to-end parity is still being confirmed.
