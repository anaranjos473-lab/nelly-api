# RC2 - PILOTO CONTROLADO V1

## Estado
Preparado para ejecutar tres corridas operativas controladas.

## Objetivo
Ejecutar el piloto controlado sobre la base certificada, usando el Runsheet UX-Release como hoja de corrida y un acta simple de liberacion para dejar evidencia de decision.

## Estructura de jornada

1. RC2-A: flujo base.
2. RC2-B: variaciones normales.
3. RC2-C: robustez y recuperacion.
4. Cierre y dictamen consolidado.

## Alcance

- Ejecucion del Gate UX-Release en tres corridas.
- Recorrido extremo a extremo del flujo operativo.
- Registro de incidencias si aparecen.
- Dictamen consolidado para autorizar o no el piloto controlado.

## Entregables

1. Runsheet UX-Release con RC2-A, RC2-B y RC2-C.
2. Recorrido extremo a extremo por corrida.
3. Registro de incidencias por corrida.
4. Acta de liberacion consolidada para piloto controlado.
5. Protocolo formal de alta de restaurantes para el siguiente frente operativo.

## 1. Preparacion

- Confirmar backend estable.
- Confirmar autenticacion operativa.
- Abrir el Runsheet UX-Release.
- Verificar entorno, base URL y commit.
- Confirmar que no exista una corrida previa sin cerrar.

## 2. Ejecucion

- Ejecutar RC2-A como flujo base.
- Ejecutar RC2-B como variacion operativa.
- Ejecutar RC2-C como validacion de robustez.
- Completar login en Comercial, Operativo y Admin.
- Verificar responsive y contraste.
- Registrar cualquier incidente con evidencia por corrida.

## 3. Cierre

- Completar la seccion de dictamen del Runsheet por corrida.
- Consolidar incidencias y observaciones.
- Revisar si hubo errores bloqueantes.
- Revisar si aparecieron `429` o fallos de entorno.
- Confirmar consistencia entre corridas.
- Llenar el acta de liberacion consolidada.
- Si RC2 queda cerrado, pasar al protocolo de alta de restaurantes sin abrir registro libre.

## Flujo esperado

1. Crear pedido.
2. Cocina recibe el pedido.
3. Cocina lo prepara.
4. Publicacion al pool.
5. Repartidor acepta.
6. Seguimiento.
7. Entrega.
8. Finanzas actualizadas.
9. CRM actualizado.
10. Dashboard Operativo consistente.
11. Dashboard Comercial consistente.
12. Panel Administrativo consistente.

## Criterio de decision

- APROBADO para piloto controlado.
- APROBADO CON OBSERVACIONES.
- NO APROBADO.

## Criterios de cierre rapido

- Runsheet con tres corridas completado.
- Evidencia adjunta por corrida.
- Recorridos completos sin regresiones.
- Acta consolidada completada.
- Dictamen emitido.

## Regla de uso

RC2 no abre nuevas capacidades. Solo ordena la ejecucion controlada del piloto y su evidencia.

## Referencias

- `GATE_UX_RELEASE_V1.md`
- `UX_RELEASE_RUNSHEET_V1.md`
- `CHECKLIST_UX_RELEASE_V1.md`
- `ALTA_RESTAURANTES_PILOTO_V1.md`

## Historial

- 2026-07-25: Se propone RC2 como siguiente hito operativo para el piloto controlado.
