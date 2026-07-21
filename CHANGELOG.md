# CHANGELOG.md
# Nelly OS Functional History

This changelog does not replace Git. It records functional milestones and certifications.

## 2026-07-16

- P17 certified as baseline.
- The closure flow related to courier earnings was validated.
- The backend became the stable reference for the base flow.

## 2026-07-18

- ICV-02 was instrumented to observe the Android closure chain.
- It was detected that the courier session was a required precondition.
- Test authentication was restored to continue the investigation.

## 2026-07-19

- `AGENTS.md` was consolidated as the operating guide.
- `DATA_MODEL.md` was added to fix canonical routes.
- The ADR index was created.
- The separation between `bloqueo_manual`, `bloqueo_por_deuda`, and `total_no_elegible` was documented.
- The diagnostic endpoint was aligned with panel terminology.
- Android technical closure was certified with ICV-02.
- Post-`complete-order` navigation was adjusted with controlled restart toward Radar.
- Post-`complete-order` navigation without launcher fallback was validated in RC-02.
- The contaminated order `RC26_1781785625899` was cleaned to resume RC-01 with a clean case.
- RC-01 was approved with `PED_1784485230438`: accept, tracking, `complete-order`, local cleanup, and return to Radar.
- RC-02 was approved with `PED_1784486749978` and `PED_1784487166526`: Radar stability after `complete-order` across consecutive runs.
- RC-03 was marked as in validation after restoring the courier home map UI.

## 2026-07-20

- RC-03 operational flow validation was consolidated in `docs/certificaciones/RC-03.md`.
- The certification index was updated to reflect RC-03 as `IN VALIDATION`.
- The main README was aligned with the current RC-03 state.
- `SYSTEM_STATE.md` was updated to distinguish the validated delivery flow from the pending financial comparison.
- `REPOSITORY_CERTIFICATION.md` was aligned with the RC-03 validation state.
- RC-03-INC-001 was documented after reproducing the post-`FINALIZAR ENTREGA` return to evidence capture twice.
- The RC-03 certification was linked to the investigation for traceability.
- The financial comparison remains pending until the delivery flow closes cleanly.

## Rule

Before adding a new entry, confirm that reproducible evidence exists and, when applicable, that there is a certification or commit link.
