# Nelly Delivery

Nelly Delivery is an operational ordering ecosystem with backend, admin panel, and Android app for couriers.

## Official State

- RC-01: approved
- RC-02: approved
- RC-03: in validation
  - Operational flow validated.
  - Pending comparative financial validation before promotion to approved.

The main courier interface was restored to the reference map-based layout, while keeping the certified dispatch, tracking, and closure logic intact.

## Components

- `Backend`: business rules, order state, assignment, closure, and finance.
- `Panel`: administration, metrics, and internal operations.
- `Android`: courier app for radar, acceptance, tracking, and closure.
- `RTDB`: real-time operational persistence.

## Source Of Truth

The operative source of truth follows this order:

`Backend -> Firebase RTDB -> Android`

Android reflects.
Backend decides.

## Core Documentation

- [`AGENTS.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/AGENTS.md): operating rules for agents.
- [`DATA_MODEL.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/DATA_MODEL.md): canonical data model.
- [`SYSTEM_STATE.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/SYSTEM_STATE.md): project operational state.
- [`CHANGELOG.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/CHANGELOG.md): certified functional history.
- [`CONTRIBUTING.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/CONTRIBUTING.md): contribution guide.
- [`ENGINEERING_PRINCIPLES.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/ENGINEERING_PRINCIPLES.md): engineering principles.
- [`DEPENDENCY_MAP.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/DEPENDENCY_MAP.md): dependency matrix.
- [`RELEASE_CHECKLIST.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/RELEASE_CHECKLIST.md): release checklist.
- [`RC-01.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/RC-01.md): delivery flow certification.
- [`docs/adr/README.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/adr/README.md): ADR index.
- [`docs/contracts/README.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/contracts/README.md): contracts index.
- [`docs/certificaciones/README.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/certificaciones/README.md): certifications index.
- [`docs/investigaciones/README.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/investigaciones/README.md): investigations index.
- [`docs/runbooks/README.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/runbooks/README.md): runbooks index.
- [`OPERACION_INDEX.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/OPERACION_INDEX.md): pilot and operation entry point.
- [`docs/architecture/PRD_NELLY_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/PRD_NELLY_KITCHEN_PREMIUM_V1.md): product vision and roadmap for the premium kitchen console.
- [`docs/architecture/BLUEPRINT_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/BLUEPRINT_KITCHEN_PREMIUM_V1.md): technical blueprint for modular migration to premium kitchen.
- [`docs/architecture/B0_MATRIZ_DEPENDENCIAS_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/B0_MATRIZ_DEPENDENCIAS_KITCHEN_PREMIUM_V1.md): dependency inventory and safe refactor map for kitchen premium.
- [`docs/architecture/MATRIX_PANEL_DEPENDENCIES_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/MATRIX_PANEL_DEPENDENCIES_KITCHEN_PREMIUM_V1.md): practical module-by-module dependency matrix for B1.
- [`CHECKLIST_FINAL_CIERRE_PILOTO_CONTROLADO_2026_07_21.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/CHECKLIST_FINAL_CIERRE_PILOTO_CONTROLADO_2026_07_21.md): final pilot closeout checklist.
- [`ACTA_CIERRE_PILOTO_CONTROLADO_2026_07_21.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/ACTA_CIERRE_PILOTO_CONTROLADO_2026_07_21.md): executive pilot closeout act.
- [`docs/architecture/DEFINITION_OF_DONE_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/DEFINITION_OF_DONE_KITCHEN_PREMIUM_V1.md): acceptance standard for Kitchen Premium commits and stages.
- [`docs/architecture/MIGRATION_PROGRESS_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/MIGRATION_PROGRESS_KITCHEN_PREMIUM_V1.md): official progress board for Kitchen Premium migration.

## Baseline

- P17 is the certified baseline.
- `complete-order` must end with `ENTREGADO`, clear `pedido_activo`, and remove auxiliary nodes.

## Operational Flow

`Client -> Admin -> Kitchen -> LISTO -> Radar -> Accept -> Delivery -> Complete Order -> ENTREGADO`

## Practical Rules

- Do not modify certified components without new evidence.
- Do not open a second hypothesis while an investigation is active.
- Do not duplicate sources of truth for the same entity.
- Do not bypass the backend to decide final states.

## Quick Start

1. Read `AGENTS.md`.
2. Review `DATA_MODEL.md`.
3. Consult the relevant ADR.
4. Change only the component under investigation.
5. Compile and validate one run.
6. If the flow is stable, execute `RC-01`.

## Current State

- `RC-01` approved.
- `RC-02` approved.
- `RC-03` in validation.
  - Operational flow validated.
  - Pending comparative financial validation.
