# PILOTO PLAN JORNADA 001 V1

**Estado:** Plan operativo preparado  
**Ambito:** Primera jornada del piloto comercial controlado  
**Fecha:** 2026-07-25  
**Referencia ejecutiva:** `GO_NO_GO_PRE_PILOTO_V1.md`  
**Referencia operativa:** `RUNBOOK_OPERATIVO_PILOTO_V1.md`  
**Referencia de evidencia:** `OV1_CHECKLIST_OPERATIVA_V1.md`
**Referencia de congelacion:** `DECISION_CONGELACION_ARQUITECTONICA_PILOTO_V1.md`
**Referencia visual:** `VALIDACION_PANELES_PRE_PILOTO_V1.md`

## 1. Proposito

Definir la primera jornada del piloto comercial controlado de Nelly, manteniendo el GO condicionado y usando evidencia real para evaluar operacion, soporte, calidad e impacto comercial.

Este plan no modifica RC2, no abre nuevos dominios y no sustituye el runbook operativo.

## 2. Objetivo de la jornada

Validar el flujo completo con comercios y repartidores reales o semi reales en condiciones controladas, priorizando aprendizaje operativo sobre volumen.

La jornada debe confirmar:

- que el Doctor Operativo permanece `OPERABLE`;
- que el puerto oficial `3001` se mantiene estable;
- que los dashboards permanecen disponibles;
- que el flujo pedido -> comercio -> repartidor -> entrega funciona sin errores bloqueantes;
- que C4, C5 y Q1 permanecen visibles;
- que OV1 produce evidencia suficiente para decidir continuidad.

## 3. Participantes

| Rol | Responsable / participante | Estado |
| --- | --- | --- |
| Responsable operativo | Pendiente de asignar | Pendiente |
| Responsable tecnico de guardia | Pendiente de asignar | Pendiente |
| Responsable de soporte | Pendiente de asignar | Pendiente |
| Comercios participantes | Pendiente de definir | Pendiente |
| Repartidores participantes | Pendiente de definir | Pendiente |
| Canal de soporte | Pendiente de confirmar | Pendiente |

## 4. Alcance

| Elemento | Definicion inicial |
| --- | --- |
| Tipo de piloto | Comercial controlado |
| Horario | Pendiente de definir |
| Zona geografica | Pendiente de definir |
| Comercios objetivo | 3 a 5 |
| Repartidores objetivo | 5 a 10 |
| Pedidos objetivo | Bajo volumen, suficiente para observar operacion |
| Prioridad | Evidencia y aprendizaje, no volumen |

## 5. Checklist de inicio

La jornada solo puede iniciar si todos los puntos criticos estan conformes.

| Validacion | Comando / evidencia | Estado esperado |
| --- | --- | --- |
| Doctor Operativo | `npm run doctor:operational` | `DICTAMEN: OPERABLE` |
| Puerto oficial | Incluido en Doctor / `validate:operational-port` | `3001` |
| Backend | Health incluido en Doctor | OK |
| Ledger y finanzas | Doctor Operativo | OK |
| Dashboard Operativo | Doctor Operativo / navegador | Visible |
| Dashboard Comercial | Navegador / snapshot | Visible |
| C4 | Snapshot | Oportunidades y acciones visibles |
| C5 | Snapshot | Promociones visibles |
| Q1 | Snapshot | Calidad operativa visible |
| Paneles pre piloto | `VALIDACION_PANELES_PRE_PILOTO_V1.md` | Cerrada o validada manualmente |
| Participantes | Lista de jornada | Confirmados |
| Canal de soporte | Prueba de comunicacion | Confirmado |

## 6. Durante la jornada

Registrar solo evidencia que no se pueda simular correctamente en corridas automatizadas.

| Area | Evidencia a capturar |
| --- | --- |
| Comercio | Dudas, friccion, errores, tiempos de atencion |
| Repartidor | Dificultades al aceptar, completar o reportar |
| Cliente | Comentarios, dudas, problemas de entrega |
| Soporte | Tiempo de respuesta, tipo de ayuda requerida |
| Operacion | Pedidos completados, cancelados, atorados |
| Calidad | Incidencias, causa raiz, merma y accion correctiva |
| Comercial | Recomendaciones C4 revisadas, promociones C5 aplicadas |
| Diagnostico | Warnings, errores o cambios de dictamen |

## 7. Criterios para pausar la jornada

Pausar nuevas altas de pedido si ocurre cualquiera de estos eventos:

- Doctor Operativo devuelve `NO OPERABLE`;
- puerto `3001` deja de responder;
- ledger o finanzas fallan;
- pedido activo queda atorado sin ruta clara de cierre;
- C4, C5 o Q1 desaparecen del snapshot;
- comercio o repartidor no puede operar por fallo reproducible;
- aparece error critico abierto;
- se requiere cambiar de puerto o modificar arquitectura para continuar.

La jornada puede reanudarse solo si:

1. se documenta el incidente;
2. se contiene o corrige la causa;
3. se ejecuta el Doctor Operativo;
4. el dictamen vuelve a `OPERABLE`;
5. el responsable operativo autoriza continuar.

## 8. Indicadores de la jornada

| Categoria | Indicadores |
| --- | --- |
| Tecnica | Salud del sistema, disponibilidad, errores criticos |
| Operativa | Pedidos completados, tiempo de entrega, incidencias, soporte |
| Comercial | Comercios activos, promociones revisadas o usadas, recurrencia |
| Experiencia | Comentarios de comercios, repartidores y clientes |
| Calidad | Incidencias Q1, causas raiz, merma, acciones correctivas |

## 9. Cierre de jornada

Al finalizar, ejecutar:

```bash
npm run doctor:operational
```

Registrar:

- dictamen final;
- snapshot final;
- pedidos completados;
- pedidos cancelados;
- incidencias;
- C4 recomendaciones revisadas;
- C5 promociones aplicadas o descartadas;
- Q1 incidencias y acciones;
- soporte requerido;
- aprendizajes;
- decision para la siguiente jornada.

Completar `OV1_CHECKLIST_OPERATIVA_V1.md`.

## 10. Dictamen de Jornada 001

| Resultado | Criterio |
| --- | --- |
| Verde | Jornada estable, sin errores criticos, GO permanece vigente |
| Amarillo | Jornada operable con observaciones, requiere seguimiento |
| Rojo | Jornada no operable, GO suspendido temporalmente |

## 11. Decision posterior

Al cierre de la jornada se debe decidir:

| Decision | Significado |
| --- | --- |
| Continuar | Se agenda Jornada 002 sin cambios estructurales |
| Continuar con observaciones | Se agenda Jornada 002 con seguimiento especifico |
| Pausar | Se suspende el piloto hasta resolver hallazgos criticos |

## 12. Regla de estabilidad arquitectonica

Durante la Jornada 001:

- se pueden corregir errores reproducibles;
- se pueden ajustar procesos operativos;
- se pueden mejorar mensajes o soporte;
- no se modifica RC2;
- no se abre O1;
- no se abre Q2;
- no se abre C6;
- no se activa IA predictiva;
- no se crean fuentes de verdad paralelas.

La regla completa de estabilidad se rige por `DECISION_CONGELACION_ARQUITECTONICA_PILOTO_V1.md`.

La Jornada 001 no debe iniciar sin cerrar o validar manualmente `VALIDACION_PANELES_PRE_PILOTO_V1.md`.

## 13. Historial

- 2026-07-25: Se crea el plan operativo de Jornada 001 como puente entre GO/NO-GO, runbook y ejecucion del piloto comercial controlado.
- 2026-07-25: Se enlaza la decision de congelacion arquitectonica durante piloto.
- 2026-07-25: Se agrega validacion de paneles pre piloto como condicion visual previa a Jornada 001.
