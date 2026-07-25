# ACTA DE LIBERACION PILOTO CONTROLADO V1

## Estado
Plantilla de dictamen para cerrar la corrida del Gate UX-Release y decidir el inicio del piloto controlado.

## Propósito

Dejar un unico registro de decision al final de la corrida, con evidencia suficiente para autorizar o no el inicio del piloto controlado.

## Datos de la corrida

| Campo | Valor |
| --- | --- |
| Fecha | 2026-07-25 |
| Responsable | Codex |
| Entorno | Local pre-piloto |
| Base URL | http://127.0.0.1:3001 |
| Commit | d71dd6b |
| Evidencia | .codex-tmp/run-rc2-local.mjs |
| Runsheet | UX_RELEASE_RUNSHEET_V1.md |
| Gate UX-Release | GATE_UX_RELEASE_V1.md |
| Recorrido extremo a extremo | Ejecutado el 2026-07-25 |

## Dictamen

| Campo | Valor |
| --- | --- |
| Resultado | APROBADO CON OBSERVACIONES |
| Observaciones | RC2 se ejecuto y cerro funcionalmente en local: crear -> despacho -> aceptacion -> entrega -> snapshot operativo. Se registro una transicion intermedia invalida en `LLEGUE_A_TIENDA` que no bloqueo el cierre. |
| Riesgos abiertos | La maquina de estados no acepta `LLEGUE_A_TIENDA` desde `EN_CURSO`; revisar si debe sustituirse por un estado operativo soportado o mantenerse como observacion de corrida. |
| Acciones siguientes | Archivar la evidencia y usar esta corrida como referencia operativa antes de nuevos cambios. |
| Evidencia minima | Runsheet actualizado, salida de la corrida local, snapshot operativo y dictamen final. |

## Evidencia minima requerida

- Runsheet actualizado.
- Salida de la corrida local.
- Snapshot operativo final.
- Registro de la observacion de transicion invalida.

## Criterio final

- APROBADO para piloto controlado.
- APROBADO CON OBSERVACIONES.
- NO APROBADO.

## Cierre operativo

La corrida solo puede cerrarse cuando:

- el runsheet esta completo;
- el recorrido extremo a extremo esta documentado;
- el dictamen fue emitido;
- la unica observacion quedo trazada como no bloqueante.

## Reglas

- No abrir nuevos dominios.
- No modificar RC2.
- No cerrar sin evidencia completa.

## Referencias

- `RC2_PILOTO_CONTROLADO_V1.md`
- `UX_RELEASE_RUNSHEET_V1.md`
- `GATE_UX_RELEASE_V1.md`
