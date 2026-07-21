# DEFINITION OF DONE - KITCHEN PREMIUM V1

## Objetivo
Definir cuando una tarea, refactorizacion o micro-commit de Kitchen Premium puede considerarse terminada.

## Principio General
Un cambio solo esta terminado si es:
- compilable,
- verificable,
- reversible,
- consistente con el baseline certificado,
- y documentado cuando aplique.

## Criterios Tecnicos
- El codigo compila correctamente.
- `node --check` termina sin errores.
- No existen errores de lint si el proyecto incorpora esa validacion.
- No se introducen cambios no relacionados con el alcance del commit.
- No se rompen dependencias internas ni contratos formales.

## Criterios Funcionales
- El flujo operativo validado sigue funcionando.
- No hay regresiones respecto al panel baseline certificado.
- Backend, Firebase y panel mantienen sus contratos previstos.
- Las acciones criticas siguen pasando por el backend.

## Criterios Visuales
- Si la etapa no contempla UI, no hay cambios visuales.
- No se modifica layout, HTML o CSS fuera del alcance aprobado.
- Si hay cambios visuales, se comparan contra el baseline y quedan documentados.

## Criterios Documentales
- La arquitectura se actualiza si hubo cambios estructurales.
- La matriz de dependencias se actualiza cuando se muevan responsabilidades.
- El plan de commits se marca cuando una etapa se cierra.
- Cualquier decision relevante queda registrada en la documentacion oficial.

## Criterios de Git
- Un solo objetivo tecnico por commit.
- El mensaje del commit sigue la convencion del proyecto.
- Los cambios son revisables y reversibles.
- No se mezclan refactorizacion y funcionalidades nuevas.

## Criterios de Validacion
Cada cambio debe pasar, cuando aplique:
- validacion automatizada existente,
- flujo manual basico,
- comparacion visual con el panel certificado,
- revision de logs si el cambio toca observabilidad o estado.

## Criterios de Cierre
Una tarea solo puede marcarse como terminada si:
- el checklist de la etapa se completo,
- la validacion tecnica fue exitosa,
- no hay regresiones funcionales,
- y existe evidencia suficiente para avanzar a la siguiente etapa.

## Regla de Aplicacion
Este DoD es obligatorio para:
- B1.1 a B1.7,
- B2,
- B3,
- B4,
- B5,
- B6,
- B7,
- y cualquier ajuste posterior de Kitchen Premium.

## Nota Operativa
Si un cambio compila pero no puede validarse funcionalmente o visualmente segun su alcance, no se considera terminado.
