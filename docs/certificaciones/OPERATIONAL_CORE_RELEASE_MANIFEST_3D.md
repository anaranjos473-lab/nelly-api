# OPERATIONAL CORE RELEASE MANIFEST 3D

**Status:** `READY_FOR_ISOLATED_COMMIT`

**Date:** 2026-09-24

## Release identity

```text
release_scope: OPERATIONAL_CORE_3A_3B_3C
candidate_commit: PENDING_ISOLATED_COMMIT
branch: sprint-3a-compliance-readiness
production_baseline: 5caaeeb
database_migration: NONE
firebase_rules_deploy: NOT_REQUIRED_BY_THIS_SCOPE
```

The candidate commit SHA must be recorded here before push and deployment. The
production baseline is the previously published operational-evidence release;
it is the rollback target if the candidate fails deployment or authenticated
read-only smoke validation.

## Allowlist

```text
app.js
routes/operationalEvidence.js
routes/operationalIntelligence.js
routes/operationalDecisionEvidence.js
src/services/operationalEvidenceService.js
src/services/operationalIntelligenceService.js
src/services/operationalDecisionEvidenceService.js
tests/operational-evidence.test.js
tests/operational-intelligence.test.js
tests/operational-decision-evidence.test.js
tests/operational-core-integration.test.js
docs/architecture/SPRINT_3A_PLATFORM_WORK_EVIDENCE_MATRIX.md
docs/architecture/SPRINT_3A_P1_SPECIFICATION.md
docs/architecture/SPRINT_3A_P1_GATE_MATRIX.md
docs/architecture/GOAL_OPERATIONAL_INTELLIGENCE_3B.md
docs/architecture/GOAL_OPERATIONAL_DECISION_EVIDENCE_3C.md
docs/architecture/LEGAL_FISCAL_READINESS_GATE_SPRINT_3.md
docs/architecture/NELLY_COMPLIANCE_GAP_V1.md
docs/certificaciones/SPRINT_3A_P0_WORK_EVIDENCE.md
docs/certificaciones/SPRINT_3A_GATE_REVIEW.md
docs/certificaciones/SPRINT_3B_OPERATIONAL_INTELLIGENCE.md
docs/certificaciones/SPRINT_3C_OPERATIONAL_DECISION_EVIDENCE.md
docs/certificaciones/SPRINT_3C_OPERATIONAL_CORE_GATE_REVIEW.md
docs/certificaciones/SPRINT_3D_OPERATIONAL_CORE_RELEASE_READINESS.md
docs/certificaciones/OPERATIONAL_CORE_RELEASE_MANIFEST_3D.md
```

The allowlist is a release boundary, not an instruction to stage all modified
files blindly. Each candidate file must be reviewed against this list before
the isolated commit.

## Explicit exclusions

```text
P1 earnings, tariff, tips, incentives, fiscal, IMSS, labor status,
contracts, e-signature, weekly statement, settlement and all Ledger changes.

Android, Hosting, Firestore, Storage, Functions, Firebase rules, dependency
changes and unrelated dirty-worktree files.
```

## Runtime and data effects

The release adds only backend API routes and read-only projections. P0 evidence
POST endpoints may create idempotent records under `work_ledger`,
`algorithm_versions`, `dispatch_decisions` and `human_reviews` through the
backend Admin SDK. No schema migration or client RTDB access change is part of
this release.

3B and 3C are GET-only projections. They must return no financial, fiscal,
labor, contract or settlement effect.

## Required pre-release evidence

```text
85/85 suites PASS
316/316 tests PASS
validate:routes PASS
validate:firebase PASS
git diff --check PASS (CRLF notices are not diff errors)
```

## Production gate

Before production certification, record separately:

1. isolated commit SHA and push result;
2. Render deployment SHA and health result;
3. authenticated, read-only smoke for each 3A/3B/3C GET route;
4. unauthenticated `401` and cross-actor `403` checks;
5. confirmation that no smoke request wrote RTDB business, financial or P1 data.

## Rollback readiness

```text
rollback_target: 5caaeeb
rollback_trigger: failed health, failed access-control smoke, unexpected RTDB
                  write, or any P1/money/fiscal/labor/settlement effect
rollback_action: redeploy the Render service from 5caaeeb, then record the
                 incident and preserve evidence before any correction
```
