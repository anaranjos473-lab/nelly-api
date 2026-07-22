# CERTIFICACION U2 - NUCLEO UNIVERSAL V1

## Fecha
2026-07-22

## Proposito
Registrar la certificacion tecnica del nucleo universal U2, incluyendo alcance, componentes implementados, evidencia de prueba, validadores activos, commits de referencia y limitaciones conocidas.

## Alcance
Esta certificacion cubre la implementacion de U2.1 a U2.5 como nucleo operativo de dominio universal. No sustituye la certificacion funcional completa del sistema con acceso a Firebase operativo.

## Componentes certificados

### U2.1 - Contratos canonicos
Estado: certificado

Evidencia:
- libreria comun de contratos en `src/domain/contracts/`
- validacion automatica en `scripts/validation/validate-domain-contracts.js`
- pruebas en `test/domainContracts.test.js`
- integracion en `scripts/validation/doctor.js`

### U2.2 - Maquina de estados
Estado: certificado

Evidencia:
- maquina de estados comun en `src/domain/stateMachine.js`
- pruebas en `test/stateMachine.test.js`
- uso desde `src/services/ordersManager.js`

### U2.3 - Event Bus
Estado: certificado

Evidencia:
- bus interno de eventos en `src/domain/eventBus.js`
- pruebas en `test/eventBus.test.js`
- validador en `scripts/validation/validate-domain-events.js`

### U2.4 - Ledger
Estado: certificado

Evidencia:
- ledger append-only en `src/domain/ledger.js`
- pruebas en `test/ledger.test.js`
- validador en `scripts/validation/validate-ledger.js`

### U2.5 - Fulfillment Engine
Estado: certificado

Evidencia:
- motor de fulfillment en `src/domain/fulfillmentEngine.js`
- pruebas en `test/fulfillmentEngine.test.js`
- validadores en `scripts/validation/validate-fulfillment-engine.js`
- integridad de contratos en `scripts/validation/validate-contract-compatibility.js`
- integridad de eventos en `scripts/validation/validate-event-integrity.js`

## Validaciones ejecutadas

- `test/domainContracts.test.js`
- `test/stateMachine.test.js`
- `test/eventBus.test.js`
- `test/ledger.test.js`
- `test/fulfillmentEngine.test.js`
- `test/ordersManager.test.js`
- `scripts/validation/validate-domain-contracts.js`
- `scripts/validation/validate-domain-events.js`
- `scripts/validation/validate-ledger.js`
- `scripts/validation/validate-fulfillment-engine.js`
- `scripts/validation/validate-contract-compatibility.js`
- `scripts/validation/validate-event-integrity.js`

## Integracion con doctor

El `doctor` ya incorpora los validadores de:
- contratos canonicos;
- máquina de estados;
- bus de eventos;
- ledger;
- compatibilidad de contratos;
- integridad de eventos;
- fulfillment engine.

## Comportamiento de referencia

La plataforma conserva el comportamiento certificado de Kitchen Premium mientras el núcleo U2 se introduce como capa común de dominio y orquestacion.

## Limitacion conocida

`validate-functional-metrics` sigue requiriendo acceso operativo a Firebase para completar la certificacion integral. En este entorno la validacion se queda bloqueada por credenciales/acceso de red, no por los componentes U2 certificados.

## Commits de referencia

- `5c5c3a2` - Add U2.1 canonical domain contracts
- `1a313f1` - Add U2.2 canonical order state machine
- `c80234c` - Add U2.3 domain event bus
- `1b1e61e` - Add U2.4 ledger domain
- `b8d8012` - Add U2.5 fulfillment engine

## Criterios de entrada para U3

1. U2 permanezca estable en pruebas.
2. El doctor continúe verde salvo la limitacion externa de Firebase.
3. Los modulos existentes empiecen a consumir el nucleo U2 gradualmente.
4. Las validaciones funcionales completas se ejecuten en un entorno con Firebase operativo.

## Conclusión
U2 queda cerrado como núcleo universal implementado y verificable, con trazabilidad suficiente para iniciar la migración progresiva U3.
