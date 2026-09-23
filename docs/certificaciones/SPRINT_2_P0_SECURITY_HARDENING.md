# Sprint 2 P0 Security Hardening

## Scope

- P0-01: protect `pedidos` in RTDB so clients cannot write order state directly.
- P0-02: remove embedded credential defaults from operational runners and JWT helpers.
- Non-scope: Fiscal, Legal, Cross Gate, Android, Ledger, deployment, commit, and push.

## Implemented Controls

- `security_rules.json` requires authentication to read `pedidos`, rejects client writes at both `pedidos` and `pedidos/{id}`, and declares the `estado` index.
- Backend Firebase Admin remains the writer for the order contract; Admin SDK bypasses RTDB client rules.
- Operational runners require their Firebase API key and password variables at runtime. Missing values fail before authentication requests are made.
- JWT helpers require `JWT_SECRET`; no development or test secret is embedded.
- Firebase Auth response bodies are redacted from runner error output.
- The tracked APK diagnostic dump was sanitized to remove the discovered static credential pattern.

## Local Evidence

- `node --check` passed for modified runners and JWT helpers.
- Missing-secret checks passed for `p1-pilot-internal`, `ov1-rotation-3-drivers`, `validate-panels-pre-pilot`, and `validate-operational-port`; each exited before remote authentication.
- Static scans found no non-empty sensitive environment fallback in tracked source and no remaining discovered static credential pattern.
- `npm.cmd run validate:firebase` passed.
- `npm.cmd run validate:routes` passed.
- `npm.cmd test -- --runInBand` passed: 81 suites, 303 tests.
- `git diff --check` passed; CRLF notices are informational only.

## RTDB Dynamic Rule Evidence

`tests/security/rtdb-pedidos-ssot.integration.cjs` covers and passed under the local Firebase RTDB emulator using JDK 21:

- anonymous read of `pedidos` denied;
- anonymous write denied;
- authenticated direct write denied;
- authenticated read permitted by the current rule;
- backend/Admin write permitted.

No rules were deployed and production was not contacted.

## Status

`LOCALLY VALIDATED — PENDING DEPLOYMENT CERTIFICATION`

Before certifying P0-01 in production, deploy only through a separately authorized release and then run:

```powershell
firebase.cmd emulators:exec --only database "node tests/security/rtdb-pedidos-ssot.integration.cjs"
```

Then rerun the full regression and review the backend-mediated order flow against the deployed rules in a separately authorized production certification.
