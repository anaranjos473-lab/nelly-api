# RC2 - PILOTO CONTROLADO V1

## Estado
Propuesto como siguiente hito operativo despues del Gate UX-Release.

## Objetivo
Ejecutar el piloto controlado sobre la base certificada, usando el Runsheet UX-Release como hoja de corrida y un acta simple de liberacion para dejar evidencia de decision.

## Estructura de jornada

1. Preparacion.
2. Ejecucion.
3. Cierre.
4. Dictamen.

## Alcance

- Ejecucion del Gate UX-Release.
- Recorrido extremo a extremo del flujo operativo.
- Registro de incidencias si aparecen.
- Dictamen final para autorizar o no el piloto controlado.

## Entregables

1. Runsheet UX-Release completado.
2. Recorrido extremo a extremo completado.
3. Registro de incidencias.
4. Acta de liberacion para piloto controlado.

## 1. Preparacion

- Confirmar backend estable.
- Confirmar autenticacion operativa.
- Abrir el Runsheet UX-Release.
- Verificar entorno, base URL y commit.
- Confirmar que no exista una corrida previa sin cerrar.

## 2. Ejecucion

- Ejecutar el Gate UX-Release.
- Completar login en Comercial, Operativo y Admin.
- Verificar responsive y contraste.
- Correr el flujo extremo a extremo completo.
- Registrar cualquier incidente con evidencia.

## 3. Cierre

- Completar la seccion de dictamen del Runsheet.
- Revisar si hubo errores bloqueantes.
- Revisar si aparecieron `429` o fallos de entorno.
- Confirmar si el flujo completo quedo consistente.
- Llenar el acta de liberacion.

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

- Runsheet completo.
- Evidencia adjunta.
- Recorrido completo sin regresiones.
- Acta completada.
- Dictamen emitido.

## Regla de uso

RC2 no abre nuevas capacidades. Solo ordena la ejecucion controlada del piloto y su evidencia.

## Referencias

- `GATE_UX_RELEASE_V1.md`
- `UX_RELEASE_RUNSHEET_V1.md`
- `CHECKLIST_UX_RELEASE_V1.md`

## Historial

- 2026-07-25: Se propone RC2 como siguiente hito operativo para el piloto controlado.
