# Sprint 3 - npm Audit 001

## Scope

Read-only audit of production dependencies. No `npm audit fix`, dependency installation, lockfile change, deployment, commit, or push was performed.

## Baseline Result

`npm.cmd audit --omit=dev --json` reported 19 findings:

- 1 critical
- 5 high
- 13 moderate

The production dependency graph confirms that the critical `websocket-driver` finding is reachable through `firebase-admin` and its Firebase Database compatibility dependency. High findings include transitive gRPC, YAML, address parsing, and brace expansion paths.

## Isolated Firebase Admin Upgrade

`firebase-admin` was updated from 13.10.0 to 14.4.0 as the only dependency upgrade in this change.

- Node 24 satisfies the target package requirement of Node 22 or newer.
- Full regression passed: 81 suites and 304 tests.
- `validate:firebase` and `validate:routes` passed.
- The RTDB SSOT integration passed in the local emulator.
- No deployment, commit, or push was performed.

The production audit improved from 19 findings (1 critical, 5 high, 13 moderate) to 11 findings (1 critical, 3 high, 7 moderate).

The critical `websocket-driver` remained transitive to the Firebase Admin RTDB compatibility graph after this upgrade. This upgrade also removed the reported vulnerable gRPC path.

## Isolated Websocket Driver Remediation

An npm root override pins the RTDB compatibility dependency `websocket-driver` to 0.7.5, which satisfies the `faye-websocket` range.

- No direct dependency other than the prior Firebase Admin upgrade changed.
- Full regression passed: 81 suites and 304 tests.
- `validate:firebase` and `validate:routes` passed.
- The RTDB SSOT emulator integration passed.
- The production audit now reports 10 findings: 0 critical, 3 high, and 7 moderate.
- No deployment, commit, or push was performed.

## Isolated IP Address Remediation

An npm root override pins the `express-rate-limit` dependency `ip-address` to 10.7.2, which satisfies its declared `^10.2.0` range.

- This removes the reported high SSRF and trust-boundary findings for `ip-address`.
- Full regression passed: 81 suites and 304 tests.
- `validate:firebase`, `validate:routes`, and the RTDB SSOT emulator integration passed.
- The production audit now reports 9 findings: 0 critical, 2 high, and 7 moderate.
- No deployment, commit, or push was performed.

## Isolated Swagger Transitive Remediation

Root overrides pin `js-yaml` to 4.3.2 and `brace-expansion` to 1.1.21. Both satisfy the declared ranges of the Swagger dependency path.

- The two remaining high findings were removed.
- Full regression passed: 81 suites and 304 tests.
- `validate:firebase`, `validate:routes`, and the RTDB SSOT emulator integration passed.
- The production audit now reports 7 findings: 0 critical, 0 high, and 7 moderate.
- No deployment, commit, or push was performed.

## Dependency Paths Requiring Deliberate Remediation

- `firebase-admin` is now 14.4.0. Its isolated compatibility validation passed, but its RTDB compatibility graph still resolves the critical `websocket-driver` version.
- `websocket-driver` is transitive to the Firebase Admin path. It has a patched release, but forcing a transitive version must be tested against the Admin SDK graph.
- `express` and `morgan` are direct dependencies with compatible patched releases available.
- `swagger-jsdoc` contributes an older `brace-expansion` path; its update must be evaluated separately from API documentation behavior.

## Why No Automatic Fix Was Applied

`npm audit fix --omit=dev --dry-run --json` proposed broad graph changes, removals, and the Firebase Admin major upgrade. Applying that result as a batch would violate the focused-change and recertification requirements for the certified backend baseline.

## Residual Remediation Sequence

1. Update direct patch/minor dependencies (`express`, `morgan`) only in a separate isolated change.
2. Evaluate the seven remaining moderate findings by dependency path before selecting a remediation.
3. Run full regression, route validation, RTDB emulator integration, and backend flow certification after each isolated dependency change.
4. Re-run `npm audit --omit=dev --json` and record the residual findings.

## Status

## Isolated Moderate Remediation

Five compatible patches were applied after the high/critical closure:

- `express` was pinned to 4.22.3.
- `morgan` was pinned to 1.12.1.
- Root overrides pin `body-parser` to 1.20.8, `qs` to 6.16.0, and `protobufjs` to 7.6.6.

The patched versions satisfy their consumers' declared ranges. Full regression passed:

- 81 of 81 suites and 304 of 304 tests.
- `validate:firebase` and `validate:routes` passed.
- The local RTDB SSOT emulator integration passed all five checks.
- `npm audit --omit=dev` now reports 2 moderate findings and no critical or high findings.

The remaining `gaxios@6.7.1` and `uuid@9.0.1` are transitive to the
`firebase-admin -> @google-cloud/storage` compatibility path. Their fixed
releases require versions outside the declared dependency ranges, so they
remain out of scope for this compatible-patch change and require a separate
migration plan. No deployment, commit, or push was performed.

## Storage Migration Feasibility Check

The isolated migration check found no upstream-compatible upgrade at the
time of review:

- `firebase-admin` 14.4.0 is the latest published release.
- `@google-cloud/storage` 8.2.0 is the latest published release.
- Storage 8.2.0 still declares `gaxios ^6.0.2`, which resolves to the
  vulnerable `gaxios@6.7.1` and its `uuid@9.0.1` dependency.

Forcing newer `gaxios` or `uuid` versions would violate the Storage package's
declared ranges and becomes an unvalidated API migration, not an isolated
compatible patch. No override was added and no dependency was changed by this
feasibility check. The two moderate findings remain pending an upstream
compatible release or a separately approved migration with Storage API tests.

## Final Sprint 3 Decision

Sprint 3 dependency hardening is closed locally with two accepted moderate
findings blocked by upstream compatibility:

- Critical: 0.
- High: 0.
- Moderate: 2 (`gaxios@6.7.1` and `uuid@9.0.1` through the Storage path).

The project will not force versions outside the ranges declared by
`@google-cloud/storage` merely to obtain an artificial zero-vulnerability
audit result. Re-evaluate this decision only when an upstream-compatible
release is published or a separately approved Storage API migration includes
upload, download, authentication, error handling, signed URL (when used),
and full-regression evidence.

The final local validation baseline remains 81 of 81 suites, 304 of 304
tests, `validate:firebase`, `validate:routes`, and the five-check RTDB SSOT
emulator integration. No deployment, commit, or push was performed.

`SPRINT 3 HIGH/CRITICAL REMEDIATION LOCALLY VALIDATED — 0 CRITICAL, 0 HIGH RESIDUAL`
