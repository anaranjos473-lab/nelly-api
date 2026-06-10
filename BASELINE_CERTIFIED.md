# BASELINE_CERTIFIED

## Propósito
Certificar la línea base arquitectónica del release `v1.0-rtdb-field-trial` antes de iniciar la validación operativa.

## Rama
- `release/rtdb-field-trial`

## Etiqueta
- `v1.0-rtdb-field-trial`

## Congelamiento arquitectónico
Los siguientes artefactos deben permanecer sin cambios durante la validación operativa:
- `ordersController.js`
- `agenteDespacho.js`
- `agenteAntifraude.js`
- `agenteSoporte.js`
- `agenteTarifaDinamica.js`
- `panel.html`
- `MainViewModel.kt`
- `DeliveryTrackingService.kt`

## Justificación
Esta línea base define el alcance de la validación operativa real y evita que cambios ajenos impacten la certificación RTDB-first.

## Estado inicial
- Flujo RTDB-first certificado como línea base operacional.
- Dependencias Firestore residuales identificadas como deuda técnica, no como bloqueantes inmediatos.

## Entregable
- Línea base certificada para field trial controlado.
