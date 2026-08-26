# TOOLBOX OPERATIVO DEL PILOTO

Herramienta de entrada rapida para flujo, tokens, errores y validaciones del piloto.

## Objetivo

Concentrar en un solo lugar:

- validaciones utiles;
- documentos de flujo;
- rutas de tokens y bootstrap;
- frentes RCA e investigacion;
- scripts seguros y scripts que no deben usarse en flujo normal.

## Comandos rapidos

```bash
npm run pilot:toolbox -- index
npm run pilot:toolbox -- check
npm run pilot:toolbox -- doctor
npm run pilot:toolbox -- operational
npm run pilot:toolbox -- ui
npm run pilot:toolbox -- full
```

## Cuanto usar cada modo

| Modo | Uso |
|---|---|
| `index` | Ver el mapa completo del piloto. |
| `check` | Ejecutar chequeos locales seguros. |
| `doctor` | Correr el doctor general existente. |
| `operational` | Correr el doctor operacional existente. |
| `ui` | Validar paneles con Playwright. |
| `full` | Encadenar todos los chequeos anteriores. |

## Mapa rapido

### Flujo y gates

- `docs/architecture/PILOTO_CONTROLADO/GATE_E2E_001.md`
- `docs/architecture/PILOTO_CONTROLADO/CHECKLIST_ULTRACORTA_GATE_E2E_001.md`
- `docs/architecture/PILOTO_CONTROLADO/FORMATO_CAPTURA_EVIDENCIA_GATE_E2E_001.md`
- `docs/architecture/PILOTO_CONTROLADO/PLANTILLA_CIERRE_GATE_E2E_001.md`
- `docs/architecture/PILOTO_CONTROLADO/GO_LIVE_CERTIFICATION_001.md`
- `docs/architecture/PILOTO_CONTROLADO/ROADMAP_GATES_CERTIFICACION_PILOTO_V1.md`
- `scripts/validation/short-id-certification-001.mjs`
- `scripts/validation/contract-audit-001.mjs`
- `scripts/validation/validate-panels-pre-pilot.mjs`

### Tokens y autenticacion

- `docs/contracts/DRIVER_TOKEN.md`
- `docs/contracts/COMPLETE_ORDER.md`
- `docs/contracts/ACCEPT_ORDER.md`
- `docs/contracts/UPDATE_LOCATION.md`
- `docs/contracts/DATA_ACCESS_CONTRACT_v1.md`
- `docs/adr/ADR-006-AUTHENTICATION.md`
- `scripts/create-driver-auth.cjs`
- `scripts/create-driver-auth-simple.cjs`
- `scripts/watch_token_change.js`
- `scripts/resolve-test-config.js`
- `scripts/verificar-firebase-admin.js`
- `public/js/local-auth.js`
- `public/js/premium-kitchen/firebase/index.js`

### Errores y RCA

- `prompts/nelly-rca.prompt.md`
- `docs/investigaciones/README.md`
- `docs/investigaciones/INDEX.md`
- `docs/investigaciones/ADR_LIGERO_RCA.md`
- `docs/investigaciones/FRONT_TEMPLATE.md`
- `docs/investigaciones/GO_LIVE_DRIVER_001.md`
- `docs/investigaciones/KITCHEN_SYNC_001.md`
- `docs/investigaciones/CONTRACT_AUDIT_001.md`
- `docs/investigaciones/DATASET_FINALIZATION_001.md`
- `docs/investigaciones/ACTIVE_ORDER_CLASSIFICATION_001.md`
- `docs/architecture/PILOTO_CONTROLADO/RIESGOS_RESIDUALES.md`
- `docs/architecture/PILOTO_CONTROLADO/INCIDENCIAS_Y_RESOLUCIONES.md`
- `tools/forensics/README.md`

### Validadores locales

- `scripts/validation/system-check.js`
- `scripts/validation/docs-check.js`
- `scripts/validation/links-check.js`
- `scripts/validation/validate-firebase.js`
- `scripts/validation/doctor.js`
- `scripts/validation/operational-doctor.js`
- `scripts/validation/validate-operational-port.js`
- `scripts/validation/validate-routes.js`
- `scripts/validation/validate-contracts.js`
- `scripts/validation/validate-data-model.js`
- `scripts/validation/validate-admin-sync.js`
- `scripts/validation/validate-order-sync.js`

### No usar en flujo normal

Estas piezas deben seguir visibles, pero no deben entrar en el camino operativo salvo investigacion controlada:

- `complete-order-fallback.js`
- `simulate-accept-order.js`
- `create-order-ready-complete.js`
- `scripts/generar-pedido-directo-reparto-rtdb.js`

## Checklist de tokens

Estas variables se usan frecuentemente en flujos de auth y bootstrap. El toolbox las marca como presentes o ausentes sin imprimir secretos:

- `FIREBASE_API_KEY`
- `FIREBASE_WEB_API_KEY`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_ADMIN_JSON`
- `FIREBASE_SERVICE_ACCOUNT`
- `FIREBASE_ID_TOKEN`
- `AUTH_BOOTSTRAP_TOKEN`
- `DEV_AUTH_TOKEN`
- `DEV_AUTH_UID`
- `DRIVER_TEST_PASSWORD`
- `DRIVER_TEST_NAME`
- `P1_PANEL_EMAIL`
- `P1_PANEL_PASSWORD`

## Que rescata esta herramienta

Este indice deja accesibles los elementos que mas suelen olvidarse cuando el equipo salta entre panel, driver, tokens y RCA:

- los gates y sus checklists;
- los contratos de auth y cierre;
- los validadores locales;
- los frentes RCA activos;
- las utilidades de forensics;
- los scripts que no deben usarse en flujo normal.

## Regla de uso

No usar las piezas `No usar en flujo normal` como ruta operativa. Solo servir para diagnostico o investigacion controlada.
