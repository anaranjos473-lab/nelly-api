# ACTA DE LIBERACION PILOTO CONTROLADO V1

## Estado
Dictamen consolidado para cerrar RC2-A, RC2-B y RC2-C.

## Proposito

Dejar un unico registro de decision al final de las tres corridas, con evidencia suficiente para autorizar o no el inicio del piloto controlado.

## Datos de la corrida

| Campo | Valor |
| --- | --- |
| Fecha | 2026-07-25 |
| Responsable | Codex |
| Entorno | Local pre-piloto |
| Base URL | http://127.0.0.1:3001 |
| Commit | d1f15f7 |
| Runsheet | UX_RELEASE_RUNSHEET_V1.md |
| Gate UX-Release | GATE_UX_RELEASE_V1.md |
| RC2-A | Ejecutada |
| RC2-B | Ejecutada |
| RC2-C | Ejecutada |

## Dictamen consolidado

| Campo | Valor |
| --- | --- |
| Resultado | APROBADO CON OBSERVACIONES |
| Observaciones | `LLEGUE_A_TIENDA` no forma parte del contrato actual de estados y debe tratarse como decision de producto/arquitectura, no como bug confirmado. El error `500 {"error":"set"}` observado al inicio de RC2 no se reprodujo en las corridas posteriores. |
| Riesgos abiertos | Decidir si la maquina de estados de ultima milla se mantiene simple o se enriquece con hitos intermedios. |
| Acciones siguientes | Cerrar la observacion de diseño con ADR-008 y mantener seguimiento del incidente no reproducible durante el piloto. |
| Evidencia minima | Runsheet completo por corrida, snapshots operativos y registro de incidencias. |

## Evidencia minima requerida

- Runsheet completo por cada corrida.
- Salida de la corrida correspondiente.
- Snapshot operativo final por corrida.
- Registro de incidencias y observaciones.

## Criterio final

- APROBADO para piloto controlado.
- APROBADO CON OBSERVACIONES.
- NO APROBADO.

## Cierre operativo

La corrida solo puede cerrarse cuando:

- RC2-A, RC2-B y RC2-C estan completadas;
- el runsheet consolida las tres corridas;
- el dictamen fue emitido;
- la observacion de transicion quedo clasificada como decision de diseno.

## Reglas

- No abrir nuevos dominios.
- No modificar RC2.
- No cerrar sin evidencia completa.

## Referencias

- `RC2_PILOTO_CONTROLADO_V1.md`
- `UX_RELEASE_RUNSHEET_V1.md`
- `GATE_UX_RELEASE_V1.md`
