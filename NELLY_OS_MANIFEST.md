# NELLY_OS_MANIFEST.md
# Nelly OS Manifest

## What Nelly OS Is

Nelly OS is the engineering operating system for Nelly Delivery. It defines how the team and agents should reason about architecture, contracts, data, certification, and investigations.

## Objective

Build and maintain a delivery platform that is:

- stable
- reproducible
- certifiable
- evidence-driven
- compatible with a single source of truth

## Philosophy

- Stability before speed.
- Evidence before change.
- Certification before expansion.
- One source of truth per entity.
- Business rules live once.
- Investigations and certifications stay separate.

## Architecture

```text
Client -> Admin -> Kitchen -> LISTO -> Radar -> Accept -> Delivery -> Complete Order -> ENTREGADO
```

Operating truth flows as:

```text
Backend -> Firebase RTDB -> Android
```

Android reflects. Backend decides.

## Where To Find Things

| If you need... | Look here |
| --- | --- |
| Architecture decisions | [`docs/adr`](./docs/adr/) |
| API contracts | [`docs/contracts`](./docs/contracts/) |
| Current project state | [`SYSTEM_STATE.md`](./SYSTEM_STATE.md) |
| Data model | [`DATA_MODEL.md`](./DATA_MODEL.md) |
| Runbooks | [`docs/runbooks`](./docs/runbooks/) |
| Engineering rules | [`ENGINEERING_PRINCIPLES.md`](./ENGINEERING_PRINCIPLES.md) |
| Investigations | [`docs/investigaciones`](./docs/investigaciones/) |
| Certifications | [`docs/certificaciones`](./docs/certificaciones/) |

## Baseline

- P17 is the certified baseline.
- `complete-order` must end in `ENTREGADO`.
- `pedido_activo` must be cleared.
- Auxiliary nodes must be removed.

## How To Work

1. Read `AGENTS.md`.
2. Read this manifest.
3. Read the relevant ADR / contract / certification.
4. Inspect the data model and system state.
5. Change only the investigated component.
6. Validate once.
7. Document the result.

