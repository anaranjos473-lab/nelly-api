# ACTA DE APERTURA - PILOTO CONTROLADO 002

## Identificacion

| Campo | Valor |
| --- | --- |
| Codigo | `PILOTO_CONTROLADO_002` |
| Documento | `Acta de apertura del piloto controlado` |
| Version | `1.0` |
| Estado | `LISTO PARA INICIO` |
| Fecha | `2026-08-01` |
| Base URL | `http://127.0.0.1:3001` |
| Responsable tecnico | `Codex` |
| Responsable operativo | `Codex` |
| Revisor de calidad | `Pendiente de firma` |

## Antecedentes

La Jornada 002 se abre con las siguientes referencias previas:

- `PILOTO_CONTROLADO_001` cerrada en `VERDE`;
- `RC2-A`, `RC2-B` y `RC2-C` en `PASS`;
- baseline certificado intacto;
- prepiloto operacional aprobado.

## Objetivo

Abrir formalmente la segunda jornada del piloto controlado para confirmar continuidad operativa con la misma disciplina documental y tecnica.

## Condiciones de arranque

- Doctor Operativo en `OPERABLE`.
- GO vigente.
- Jornada 001 cerrada en verde.
- Backend operativo y dashboard consistente.
- Runbook y plan de jornada disponibles.

## Alcance del piloto

- jornada acotada;
- pedidos reales o semireales segun autorizacion operacional;
- seguimiento por jornada;
- recoleccion de incidencias;
- validacion de continuidad sin abrir nuevas capacidades.

## Fuera de alcance

- no se modifica el baseline certificado;
- no se abren dominios nuevos;
- no se reinterpreta la SSOT;
- no se altera el contrato de cierre de pedidos.

## Resultado

**PILOTO CONTROLADO: CONTINUA**

## Apertura de jornada

| Campo | Valor |
| --- | --- |
| Jornada | `JORNADA_002` |
| Estado | `ABIERTA` |
| Doctor previo | `OPERABLE` |
| Hora de apertura | `2026-08-01` |

## Firmas

| Rol | Nombre | Firma | Fecha |
| --- | --- | --- | --- |
| Responsable tecnico | Codex |  | 2026-08-01 |
| Responsable operativo | Codex |  | 2026-08-01 |
| Revisor de calidad |  |  |  |

## Cierre de jornada 002

### Resumen de corrida

| Corrida | Resultado | Observacion |
| --- | --- | --- |
| RC2-A | `PASS` | Flujo base extremo a extremo completado. |
| RC2-B | `PASS` | Variacion normal con transicion idempotente y cierre correcto. |
| RC2-C | `PASS` | Robustez validada con reintento invalido y cierre correcto. |

### Evidencia consolidada

- `create` -> `OK` en las tres corridas.
- `dispatch` -> `OK` en las tres corridas.
- `accept` -> `OK` en las tres corridas.
- `complete` -> `OK` en las tres corridas.
- `snapshot` -> `OK` en las tres corridas.
- `pedidos_activos = 0` al cierre de cada corrida.
- `dashboard` en estado consistente durante toda la jornada.

### Hallazgos

- La primera corrida valido el flujo base sin incidentes operativos.
- La segunda corrida valido la transicion idempotente en `EN_CURSO` sin romper el cierre.
- La tercera corrida valido un reintento invalido de aceptacion sin afectar el cierre.

### Dictamen diario

| Campo | Valor |
| --- | --- |
| Resultado | `VERDE` |
| Estado | `Jornada estable` |
| GO | `Permanece vigente` |
| Continuidad | `Autorizada` |

### Decision posterior

La Jornada 002 queda cerrada administrativamente con resultado positivo y puede continuar la siguiente jornada bajo la misma disciplina operativa.
