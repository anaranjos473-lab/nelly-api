# CHECKLIST PRE PILOTO CONTROLADO V1

**Estado:** Lista de verificacion operativa  
**Ambito:** Preparacion inmediata antes de abrir la primera jornada del piloto controlado  
**Referencia base:** `PAQUETE_PREPARACION_PILOTO_CONTROLADO_V1.md`

## 1. Uso

Esta checklist se completa justo antes de la primera jornada del piloto.

No sustituye el runbook operativo ni el documento de GO/NO-GO. Solo concentra la
verificacion minima para decidir si la primera jornada puede arrancar.

## 2. Verificacion de infraestructura

| Verificacion | Resultado | Observacion |
| --- | --- | --- |
| Backend responde en el puerto oficial | Pendiente | |
| Firebase RTDB operativo | Pendiente | |
| Panel Comercial carga | Pendiente | |
| Panel Operativo carga | Pendiente | |
| Panel Administrativo carga | Pendiente | |
| Cocina carga | Pendiente | |
| Driver carga | Pendiente | |
| Dashboard Operativo consistente | Pendiente | |
| Dashboard Comercial consistente | Pendiente | |

## 3. Verificacion de monitoreo

| Verificacion | Resultado | Observacion |
| --- | --- | --- |
| `npm run doctor:operational` devuelve `OPERABLE` | Pendiente | |
| `npm run validate:operational-port` confirma puerto oficial | Pendiente | |
| Consola sin errores bloqueantes | Pendiente | |
| Snapshot operativo visible | Pendiente | |
| C4 visible | Pendiente | |
| C5 visible | Pendiente | |
| Q1 visible | Pendiente | |

## 4. Verificacion de procedimientos

| Verificacion | Resultado | Observacion |
| --- | --- | --- |
| Runbook operativo disponible | Pendiente | |
| Manual de comercios disponible | Pendiente | |
| Manual de repartidores disponible | Pendiente | |
| Procedimiento de incidencias disponible | Pendiente | |
| Procedimiento de soporte disponible | Pendiente | |
| Responsables asignados | Pendiente | |
| Comercios participantes definidos | Pendiente | |
| Repartidores participantes definidos | Pendiente | |

## 5. Verificacion de contingencia

| Verificacion | Resultado | Observacion |
| --- | --- | --- |
| Plan para fallo de comercio disponible | Pendiente | |
| Plan para fallo de repartidor disponible | Pendiente | |
| Plan para fallo de backend disponible | Pendiente | |
| Plan para fallo de monitoreo disponible | Pendiente | |
| Regla de pausa de nuevas operaciones entendida | Pendiente | |

## 6. Verificacion de metricas

| Verificacion | Resultado | Observacion |
| --- | --- | --- |
| Metricas base documentadas | Pendiente | |
| Tiempo promedio de entrega visible | Pendiente | |
| Pedidos completados visibles | Pendiente | |
| Pedidos cancelados visibles | Pendiente | |
| Incidencias Q1 visibles | Pendiente | |
| Rechazos por deuda visibles | Pendiente | |
| Rechazos por repartidor desconectado visibles | Pendiente | |

## 7. Criterios de aceptacion

La primera jornada puede iniciar solo si todos estos puntos estan en verde:

- backend operativo;
- RTDB operativo;
- paneles cargando sin errores bloqueantes;
- doctor operativo en `OPERABLE`;
- puerto oficial confirmado;
- procedimientos listos;
- plan de contingencia disponible;
- metricas base documentadas;
- participantes definidos.

## 8. Criterio de no inicio

No iniciar la jornada si al menos uno de estos puntos falla:

- backend no responde;
- el doctor no es `OPERABLE`;
- falta un panel critico;
- la consola muestra errores bloqueantes;
- no hay responsables definidos;
- no hay participantes definidos;
- no existe plan de contingencia utilizable.

## 9. Dictamen

| Resultado | Estado |
| --- | --- |
| GO | Permitido solo con checklist completa en verde |
| NO-GO | Cualquier fallo bloqueante o falta de evidencia |

## 10. Historial

- 2026-08-01: se crea la checklist pre piloto para transformar el paquete de preparacion en una lista ejecutable.
