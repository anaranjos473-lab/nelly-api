# PLAN DE EVIDENCIA PILOTO MAQUINA DE ESTADOS V1

## Estado

Propuesto

## Proposito

Definir que evidencia debe capturarse durante el piloto para decidir, con datos reales, si la maquina de estados enriquecida aporta valor suficiente para justificar una migracion futura.

## Regla principal

No se abre migracion nueva hasta que exista evidencia del piloto que demuestre beneficio operativo medible.

## Preguntas que debe responder el piloto

1. Cuantos pedidos completados hubo.
2. Cuanto tiempo paso entre `ASIGNADO` y `ENTREGADO`.
3. En cuantas ocasiones habria sido util registrar `LLEGUE_A_TIENDA`.
4. Donde se genera mas espera: restaurante, recoleccion o trayecto.
5. Si la falta de hitos intermedios afecta al seguimiento, al soporte o a las metricas.

## Evidencia minima por pedido

| Campo | Descripcion |
| --- | --- |
| Pedido | Identificador del pedido |
| Comercio | Comercio participante |
| Repartidor | Repartidor que ejecuta el flujo |
| Hora asignacion | Momento en que queda `ASIGNADO` |
| Hora salida | Momento en que inicia el trayecto |
| Hora llegada comercio | Si aplica, momento de llegada al comercio |
| Hora recogida | Momento de recoleccion |
| Hora llegada cliente | Momento de llegada al cliente |
| Hora cierre | Momento de `ENTREGADO` |
| Observacion | Cualquier evento relevante |

## Indicadores a medir

| Indicador | Descripcion |
| --- | --- |
| Tiempo ASIGNADO -> ENTREGADO | Tiempo total de ultima milla |
| Tiempo espera comercio | Diferencia entre llegada al comercio y recogida |
| Tiempo trayecto | Diferencia entre recogida y llegada al cliente |
| Incidencias por etapa | Donde aparecen bloqueos o retrasos |
| Utilidad operativa de hitos | Si los hitos intermedios ayudan a soporte o analitica |
| Consistencia de paneles | Si los paneles siguen mostrando el flujo correctamente |

## Fuentes de evidencia

- Snapshot del backend.
- Registro de estados del pedido.
- Registro de incidencias Q1.
- Checklist OV1 completada.
- Capturas o logs que expliquen un retraso o una transicion invalida.

## Formato de corrida

Cada jornada del piloto debe registrar al menos:

1. Fecha y hora.
2. Comercio y repartidor.
3. Numero de pedidos completados.
4. Pedidos con retraso o incidencia.
5. Observaciones sobre hitos intermedios.
6. Decision sobre si el hito enriquecido aportaria valor en ese caso.

## Criterio de decision

La migracion solo se reabre si la evidencia muestra al menos una de estas situaciones:

- el tiempo de espera no es visible con el contrato actual;
- el trayecto no puede distinguirse de la recoleccion;
- el soporte necesita hitos intermedios para resolver incidencias;
- las metricas mejoran al separar el flujo en mas etapas.

## Criterio de no adopcion

No se adopta la version enriquecida si:

- la evidencia no muestra valor medible;
- la operacion se entiende bien con el contrato actual;
- la complejidad adicional no mejora la toma de decisiones.

## Integracion con el piloto

Esta plantilla debe completarse junto con:

- `OV1_CHECKLIST_OPERATIVA_V1.md`;
- `PILOTO_PROCEDIMIENTO_INCIDENCIAS_V1.md`;
- `RUNBOOK_OPERATIVO_PILOTO_V1.md`.

## Cierre

El objetivo no es documentar mas por documentar, sino capturar la evidencia justa para decidir si la maquina enriquecida realmente conviene al negocio.

