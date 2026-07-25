# GO NO-GO PRE PILOTO V1

**Estado:** Recomendacion ejecutiva  
**Ambito:** Decision previa al piloto comercial controlado  
**Fecha:** 2026-07-25  
**Referencia estrategica:** `PLAN_ESTRATEGICO_NELLY_V1.md`  
**Referencia arquitectonica:** `RC2_BASELINE_ARQUITECTONICA_ECOSISTEMA_V1.md`  
**Referencia operativa:** `OV1_PRE_PILOTO_GATE_V1.md`
**Referencia de congelacion:** `DECISION_CONGELACION_ARQUITECTONICA_PILOTO_V1.md`
**Referencia politica:** `POL_PILOTO_001.md`

## 1. Proposito

Consolidar la evidencia tecnica, operativa y comercial disponible para decidir si Nelly esta listo para iniciar un piloto comercial controlado.

Este documento no crea nuevas capacidades ni modifica RC2. Sirve como puente entre el trabajo tecnico validado y la decision de negocio.

## 2. Preguntas ejecutivas

| Pregunta | Respuesta |
| --- | --- |
| Que se construyo? | Una plataforma operativa autocontrolada para delivery, con SSOT, dominios comerciales, calidad operativa, diagnostico y validacion repetible. |
| Funciona el flujo principal? | Si. Las series pre piloto muestran ciclos completos en verde. |
| Existe diagnostico operativo? | Si. `doctor:operational` consolida 11 validaciones y entrega dictamen `OPERABLE` o `NO OPERABLE`. |
| Existe evidencia repetida? | Si. Series 004, 005 y 006 completaron 20 ciclos en verde. |
| Se abrio O1? | No. O1 permanece como candidato post-piloto. |
| Se recomienda piloto comercial controlado? | Si, con alcance limitado y disciplina OV1 activa. |

## 3. Lo construido

### 3.1 Vision y arquitectura

- `PLAN_ESTRATEGICO_NELLY_V1.md` define la vision y principios.
- `RC2_BASELINE_ARQUITECTONICA_ECOSISTEMA_V1.md` define el contrato arquitectonico vigente.
- G1 consolida consistencia transversal.
- O1 permanece como candidato post-piloto, no como dominio activo.

### 3.2 Plataforma operativa

- Backend operativo.
- Puerto oficial local `3001`.
- Health checks.
- Snapshot operativo.
- Dashboard Operativo.
- Dashboard Comercial.
- Ledger y finanzas.
- Eventos S3.
- Doctor Operativo.
- Validadores por dominio.

### 3.3 Dominios activos

| Dominio | Estado |
| --- | --- |
| C2 - CRM Basico | Cerrado/certificado |
| C3 - Fidelizacion Basica | Cerrado funcionalmente |
| C4 - Inteligencia Comercial | Activo con oportunidades y acciones sugeridas |
| C5 - Promociones Ligeras | Activo con promociones sugeridas derivadas de C4 |
| Q1 - Calidad Operativa | Dominio transversal con incidencias, causa raiz, merma y accion correctiva |

## 4. Evidencia consolidada

### 4.1 Series pre piloto recientes

| Serie | Resultado | Evidencia clave |
| --- | --- | --- |
| Serie 004 | Aprobada | 20/20 ciclos en verde, token cache validado |
| Serie 005 | Aprobada | Doctor previo/posterior `OPERABLE`, 20/20 ciclos en verde |
| Serie 006 | Aprobada | Estabilidad consecutiva, Doctor previo/posterior `OPERABLE`, 20/20 ciclos en verde |

### 4.2 Resumen cuantitativo

| Indicador | Resultado consolidado |
| --- | ---: |
| Series recientes consideradas | 3 |
| Ciclos solicitados | 60 |
| Ciclos completados | 60 |
| Errores bloqueantes | 0 |
| Dashboard GREEN | 60 |
| Backend OK | 60 |
| Finanzas OK | 60 |
| Refresh after 401 | 0 |

### 4.3 Ultimo snapshot disponible

| Indicador | Valor |
| --- | ---: |
| Puerto operativo | `3001` |
| PID | 9356 |
| Pedidos activos | 0 |
| Entregas hoy | 122 |
| Tiempo promedio de entrega | 0.7 min |
| Entregas puntuales | 99.3% |
| C4 oportunidades | 5 |
| C4 acciones | 5 |
| C5 promociones | 5 |
| Q1 incidencias | 1 |
| Q1 causas raiz | 1 |
| Q1 merma estimada | 20 |
| Q1 acciones correctivas | 1 |

## 5. Riesgos abiertos

| Riesgo | Severidad | Estado | Mitigacion |
| --- | --- | --- | --- |
| Dependencias externas como Firebase Auth | Media | Controlado | Token cache, Doctor Operativo, diagnostico por capas |
| Deuda de repartidores durante corridas largas | Media | Controlado | P1.5, saneamiento controlado en pruebas, bloqueo trazable |
| O1 prematuro | Baja | Controlado | O1 permanece como candidato post-piloto |
| Validacion con usuarios reales aun no iniciada | Media | Pendiente | Piloto comercial controlado con alcance limitado |
| Ruido operativo por puertos alternos | Baja | Controlado | Puerto oficial `3001`, `validate:operational-port`, Doctor Operativo |

## 6. Criterios para abrir piloto controlado

| Criterio | Estado |
| --- | --- |
| RC2 estable | Cumplido |
| OV1 ejecutado con series repetidas | Cumplido |
| Doctor Operativo disponible | Cumplido |
| Puerto operativo estable | Cumplido |
| C4 visible y estable | Cumplido |
| C5 visible y estable | Cumplido |
| Q1 visible y estable | Cumplido |
| Certificacion visual pre piloto aprobada | Requerida por politica |
| Errores criticos abiertos | Cero en series recientes |
| Manuales y procedimientos piloto | Disponibles segun Gate OV1 |

## 7. Condiciones de piloto

La autorizacion recomendada aplica solo para piloto comercial controlado, no para lanzamiento masivo.

Condiciones sugeridas:

- 3 a 5 comercios.
- 5 a 10 repartidores.
- Volumen acotado de pedidos.
- Doctor Operativo antes y despues de cada jornada.
- OV1 como mecanismo de evidencia.
- Registro de incidencias mediante Q1.
- No abrir O1 durante el piloto.
- No abrir Q2, C6 ni IA predictiva durante el piloto.

## 8. Reglas de detencion

La jornada debe detenerse o mantenerse en revision si ocurre cualquiera de estos eventos:

- `npm run doctor:operational` devuelve `NO OPERABLE`;
- existen pedidos activos atorados;
- ledger o finanzas dejan de estar saludables;
- C4, C5 o Q1 desaparecen del snapshot;
- el puerto operativo `3001` no responde;
- se detecta un error critico reproducible;
- se requiere cambiar de puerto para continuar.

## 9. Condiciones de permanencia del GO

El GO no es una autorizacion permanente.

El GO permanece vigente mientras se cumplan todas estas condiciones:

- `npm run doctor:operational` mantiene dictamen `OPERABLE`;
- el puerto oficial sigue siendo `3001`;
- no existen errores criticos abiertos;
- OV1 sigue produciendo evidencia trazable;
- C4, C5 y Q1 continuan visibles en el snapshot;
- ledger y finanzas permanecen saludables;
- no se requieren puertos alternos ni reinicios improvisados para operar.

El GO se suspende temporalmente si ocurre cualquiera de estas condiciones:

- Doctor Operativo emite `NO OPERABLE`;
- aparece un error critico sin resolver;
- se pierde trazabilidad de OV1;
- falla de forma persistente un componente esencial del flujo de pedidos;
- C4, C5 o Q1 dejan de estar disponibles;
- ledger o finanzas dejan de conciliar;
- se necesita cambiar el puerto oficial para completar una jornada.

La suspension no implica rechazo definitivo. Implica detener el piloto, diagnosticar por capas, corregir con evidencia y emitir nuevo dictamen antes de continuar.

## 10. Criterios de exito del piloto

El piloto comercial controlado se considerara exitoso si demuestra, con evidencia:

| Criterio | Resultado esperado |
| --- | --- |
| Operacion estable | Jornadas completadas con Doctor previo/posterior `OPERABLE` |
| Flujo funcional | Pedidos creados, aceptados y entregados sin errores criticos |
| Autonomia de usuarios | Comercios y repartidores completan tareas basicas con asistencia minima |
| C4 util | Recomendaciones revisadas y al menos una aplicada o descartada con razon documentada |
| C5 medible | Al menos una promocion con resultado cuantificable |
| Q1 util | Incidencias registradas con causa raiz, accion correctiva y seguimiento |
| Finanzas | Ledger y finanzas saludables al cierre de jornada |
| Soporte | Incidencias documentadas y clasificadas por capa |
| Continuidad | Sin necesidad de cambios estructurales al core durante el piloto |

El piloto no debera cerrarse por fecha, sino por evidencia suficiente para decidir continuidad, ajuste o pausa.

## 11. Decision GO/NO-GO

| Decision | Estado |
| --- | --- |
| GO | Recomendado |
| NO-GO | No recomendado con la evidencia actual |

## 12. Recomendacion formal

Se recomienda avanzar a **piloto comercial controlado** solo cuando la certificacion visual pre piloto haya sido aprobada segun `POL_PILOTO_001.md`.

La recomendacion se basa en:

- arquitectura RC2 estable;
- evidencia OV1 repetida;
- Doctor Operativo en 100% durante las ultimas series;
- 60 ciclos recientes completados sin errores bloqueantes;
- C4, C5 y Q1 visibles y estables;
- puerto oficial `3001` estable;
- ausencia de necesidad de abrir nuevos dominios antes del piloto.

## 13. No autorizaciones

Este GO no autoriza:

- lanzamiento publico masivo;
- apertura formal de O1;
- Q2;
- C6;
- IA predictiva;
- nuevas fuentes de verdad;
- cambios estructurales al core.

Durante el piloto aplica la congelacion arquitectonica definida en `DECISION_CONGELACION_ARQUITECTONICA_PILOTO_V1.md`.

## 14. Siguiente paso

Preparar la primera jornada de piloto comercial controlado con:

1. Doctor Operativo previo.
2. Lista de comercios participantes.
3. Lista de repartidores participantes.
4. Objetivo de pedidos por jornada.
5. Checklist OV1.
6. Registro Q1 de incidencias.
7. Doctor Operativo posterior.
8. Dictamen diario.

El procedimiento diario queda definido en `RUNBOOK_OPERATIVO_PILOTO_V1.md`.

## 15. Historial

- 2026-07-25: Se crea el GO/NO-GO pre piloto con base en RC2, OV1, Doctor Operativo y Series 004, 005 y 006.
- 2026-07-25: Se agregan condiciones de permanencia del GO y criterios de exito del piloto.
- 2026-07-25: Se enlaza el runbook operativo del piloto como procedimiento diario bajo GO condicionado.
- 2026-07-25: Se enlaza la decision de congelacion arquitectonica durante el piloto.
