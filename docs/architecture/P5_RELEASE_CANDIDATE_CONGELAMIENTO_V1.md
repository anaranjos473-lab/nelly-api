# P5 - RELEASE CANDIDATE Y CONGELAMIENTO V1

## Fecha
2026-07-22

## Proposito
Definir la fase final operativa del programa de implementacion: congelar una Release Candidate estable sobre la base ya validada, sin introducir nuevas piezas arquitectonicas.

## Punto de partida

P5 se apoya en:
- P1 estable;
- P2 estable;
- P3 estable;
- P4 documentado;
- baseline funcional certificada;
- RC1 de referencia;
- doctor y validadores automaticos;
- limitacion conocida de `validate-functional-metrics` fuera de un entorno con Firebase operativo.

Referencias:
- [`PROGRAMA_IMPLEMENTACION_PLATAFORMA_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/PROGRAMA_IMPLEMENTACION_PLATAFORMA_V1.md)
- [`P4_CIERRE_PILOTO_CONTROLADO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/P4_CIERRE_PILOTO_CONTROLADO_V1.md)
- [`RELEASE_CANDIDATE_NELLY_DELIVERY.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/RELEASE_CANDIDATE_NELLY_DELIVERY.md)
- [`RC1_BASELINE_REPOSITORIES.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/RC1_BASELINE_REPOSITORIES.md)

## Objetivo operativo

Congelar una candidata de liberacion que mantenga:
- comportamiento certificado;
- pruebas en verde;
- doctor estable;
- evidencia funcional reproducible;
- trazabilidad de backend y Android por repositorio.

## Alcance

- No se incorporan nuevos componentes arquitectonicos.
- Solo se aceptan correcciones, estabilidad y seguridad.
- El trabajo se centra en estabilizar, comparar y decidir liberacion.

## Criterios de congelamiento

1. Todos los tests relevantes pasan.
2. `doctor` permanece verde salvo la excepcion externa conocida.
3. Las validaciones de contratos, eventos, ledger y fulfillment se mantienen consistentes.
4. La evidencia E2E del flujo principal no muestra regresiones de estado.
5. El piloto controlado no introduce incidencias criticas abiertas.
6. `validate-functional-metrics` queda documentado como condicionada por el acceso a Firebase en este entorno.

## Checklist RC1

- Crear una linea base estable del estado certificado actual.
- Confirmar commit y repositorio backend.
- Confirmar commit y repositorio Android.
- Ejecutar regresion consecutiva del flujo de pedidos.
- Verificar que `ENTREGADO` limpia nodos auxiliares.
- Verificar que las ganancias no se duplican.
- Verificar que no aparecen regresiones de estado.
- Verificar que el backend siga siendo la fuente de verdad.

## Matriz de validacion

| Area | Requisito | Estado |
| --- | --- | --- |
| Tests | Suite relevante en verde | Pendiente |
| Doctor | Sin regresiones nuevas | Pendiente |
| Contratos | Estables | Pendiente |
| Eventos | Estables | Pendiente |
| Ledger | Estable | Pendiente |
| Fulfillment | Estable | Pendiente |
| E2E | Flujo principal repetible | Pendiente |
| Piloto | Sin incidencias criticas | Pendiente |
| Firebase | Validacion funcional completa | Condicionada |

## Resultado esperado

Cuando esta fase cierre satisfactoriamente, la plataforma quedara lista para etiquetar RC1 y entrar en estabilizacion previa a una liberacion mas amplia.
