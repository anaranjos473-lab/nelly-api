# P4 - PILOTO CONTROLADO DE PLATAFORMA V1

## Fecha
2026-07-22

## Proposito
Definir la fase de piloto controlado sobre la plataforma ya consolidada por B, U1, U2, U3 y el programa de implementacion. El objetivo es validar el comportamiento operativo en condiciones cercanas a produccion sin abrir una nueva arquitectura.

## Punto de partida

El piloto parte de una base ya estabilizada:
- Admin migrado de forma incremental;
- Driver endurecido con helpers de dominio;
- Backend con creacion y mutacion canónicas compartidas;
- U3 consolidada y cerrada;
- baseline funcional certificada;
- RC1 existente como referencia de regresion;
- RC1-B disponible como certificacion visual pre piloto;
- doctor y validadores automaticos.

Referencias:
- [`PROGRAMA_IMPLEMENTACION_PLATAFORMA_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/PROGRAMA_IMPLEMENTACION_PLATAFORMA_V1.md)
- [`U3_CIERRE_MAESTRO_PLATAFORMA_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U3_CIERRE_MAESTRO_PLATAFORMA_V1.md)
- [`VALIDACION_PANELES_PRE_PILOTO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/VALIDACION_PANELES_PRE_PILOTO_V1.md)
- [`POL_PILOTO_001.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/POL_PILOTO_001.md)
- [`RELEASE_CANDIDATE_NELLY_DELIVERY.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/RELEASE_CANDIDATE_NELLY_DELIVERY.md)
- [`RC1_BASELINE_REPOSITORIES.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/RC1_BASELINE_REPOSITORIES.md)

## Objetivo operacional

Ejecutar la plataforma con comercios y repartidores reales o semireales para comprobar:
- estabilidad del flujo;
- ausencia de regresiones;
- consistencia entre Admin, Backend y Driver;
- trazabilidad de incidencias;
- preservacion del baseline.

## Alcance del piloto

- Pedidos nuevos creados durante el piloto.
- Flujo completo: crear -> publicar -> aceptar -> iniciar -> entregar -> limpiar.
- Interacciones con Admin, Backend y Driver.
- Comparacion contra baseline funcional y RC1.
- Documentacion de incidencias y resoluciones.

## Fuera de alcance

- No se introducen nuevas reglas de negocio.
- No se amplian contratos sin evidencia.
- No se abre una nueva rama arquitectonica.
- No se considera fase de features nuevas.

## Criterios de entrada

1. P1 debe permanecer estable.
2. P2 debe permanecer estable.
3. P3 debe permanecer estable.
4. `doctor` debe seguir verde salvo la limitacion externa conocida.
5. La validacion funcional completa debe poder repetirse.
6. RC1-B debe estar aprobado antes de iniciar Jornada 001.

## Plan del piloto

### P4.1 - Preparacion
- Confirmar baseline a usar.
- Registrar fecha, responsable y commits de referencia.
- Verificar que no existan cambios pendientes.

### P4.2 - Ejecucion controlada
- Cerrar RC1-B si aun no esta aprobado.
- Ejecutar varios pedidos consecutivos.
- Revisar estados, limpieza y finanzas.
- Registrar cualquier incidencia funcional.

### P4.3 - Observacion
- Mantener seguimiento durante varias iteraciones.
- Confirmar estabilidad de Driver y Backend.
- Revisar que no haya estados residuales.

### P4.4 - Cierre
- Consolidar hallazgos.
- Comparar contra RC1 y baseline certificada.
- Decidir si procede RC1 formal o si hace falta correccion menor.

## Matriz de evidencia

| Area | Evidencia esperada | Estado |
| --- | --- | --- |
| RC1-B | Certificacion visual pre piloto aprobada | Pendiente |
| Flujo pedido | Secuencia completa sin ruptura | Pendiente |
| Admin | Creacion y metricas estables | Pendiente |
| Driver | Accept/complete estables | Pendiente |
| Backend | Persistencia canónica consistente | Pendiente |
| Limpieza | `pedido_activo`, `pedidos_en_camino`, `pedidos_para_reparto` limpios | Pendiente |
| Finanzas | Ganancia y registro coherentes | Pendiente |
| RC1 | Comportamiento equivalente o mejorado | Pendiente |

## Limitacion conocida

La certificacion funcional completa sigue dependiendo de ejecutar `validate-functional-metrics` en un entorno con Firebase operativo. El piloto no sustituye esa validacion; la prepara y la complementa.

## Cierre esperado

P4 queda cerrada cuando el piloto demuestre estabilidad repetible, sin regresiones, RC1-B este aprobado y deje evidencia suficiente para congelar una Release Candidate.
