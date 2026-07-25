# RUNBOOK OPERATIVO PILOTO V1

- **Estado:** Procedimiento operativo activo
- **Ambito:** Jornada diaria del piloto comercial controlado
- **Fecha:** 2026-07-25
- **Referencia ejecutiva:** `GO_NO_GO_PRE_PILOTO_V1.md`
- **Referencia operativa:** `OV1_CHECKLIST_OPERATIVA_V1.md`
- **Referencia diagnostica:** `MAPA_DIAGNOSTICO_OPERATIVO_V1.md`
- **Referencia de congelacion:** `DECISION_CONGELACION_ARQUITECTONICA_PILOTO_V1.md`
- **Plan de primera jornada:** `PILOTO_PLAN_JORNADA_001_V1.md`

## 1. Proposito

Definir el procedimiento diario para ejecutar el piloto comercial controlado de Nelly sin improvisacion, manteniendo vigente el GO condicionado y protegiendo la estabilidad de RC2.

Este runbook no modifica la arquitectura ni abre nuevos dominios.

## 2. Regla principal

La jornada solo puede iniciar si el Doctor Operativo devuelve:

```text
DICTAMEN: OPERABLE
```

Si el Doctor devuelve `NO OPERABLE`, la jornada no inicia hasta diagnosticar, corregir con evidencia y emitir nuevo dictamen.

## 3. Antes de iniciar la jornada

### 3.1 Validacion tecnica

Ejecutar:

```bash
npm run doctor:operational
```

Resultado aceptable:

| Indicador | Valor esperado |
| --- | --- |
| Salud general | 100% o sin fallos bloqueantes |
| Severidad maxima | INFO o WARNING no bloqueante |
| Dictamen | OPERABLE |
| Puerto | 3001 |
| Ledger/finanzas | OK |
| C4/C5/Q1 | Visibles |

### 3.2 Validacion de participantes

Antes de operar, confirmar:

| Elemento | Confirmacion |
| --- | --- |
| Comercios activos del dia | Lista definida |
| Repartidores activos del dia | Lista definida |
| Responsable operativo | Asignado |
| Canal de soporte | Confirmado |
| Objetivo de pedidos | Definido |
| Horario de jornada | Definido |

### 3.3 Autorizacion de inicio

La jornada puede iniciar cuando:

- Doctor Operativo = `OPERABLE`;
- responsable operativo confirma participantes;
- no existen errores criticos abiertos;
- no hay necesidad de cambiar el puerto `3001`;
- el GO condicionado sigue vigente.

## 4. Durante la operacion

### 4.1 Indicadores a vigilar

| Capa | Indicador |
| --- | --- |
| Operacion | Pedidos creados, aceptados, entregados y cancelados |
| Estabilidad | Dashboard Operativo y Comercial visibles |
| Finanzas | Ledger y finanzas saludables |
| Comercial | C4 oportunidades y acciones |
| Promociones | C5 promociones sugeridas o aplicadas |
| Calidad | Q1 incidencias, causa raiz, merma y accion |
| Diagnostico | Cambios de severidad o errores del Doctor |

### 4.2 Cuando levantar una incidencia

Registrar incidencia si ocurre cualquiera de estos casos:

- pedido atorado;
- comercio no puede operar;
- repartidor no puede aceptar o completar;
- diferencia financiera;
- C4, C5 o Q1 desaparecen del snapshot;
- problema de calidad de producto, empaque, servicio o entrega;
- error repetible en panel, app o backend;
- cualquier evento que requiera soporte manual.

Usar `PILOTO_PROCEDIMIENTO_INCIDENCIAS_V1.md`.

### 4.3 Manejo de WARNING

Si aparece una advertencia no bloqueante:

1. Registrar la advertencia.
2. Identificar capa.
3. Confirmar si afecta pedidos activos.
4. Continuar solo si no afecta flujo, finanzas ni seguridad.
5. Revisar nuevamente al cierre.

### 4.4 Manejo de ERROR o CRITICAL

Si aparece `ERROR`, `CRITICAL` o `NO OPERABLE`:

1. Detener nuevas altas de pedido.
2. Identificar pedidos activos.
3. Completar o contener pedidos en curso si es seguro.
4. Ejecutar diagnostico por capas.
5. Registrar incidencia.
6. Emitir dictamen.
7. Reanudar solo con Doctor Operativo `OPERABLE`.

## 5. Al finalizar la jornada

### 5.1 Doctor posterior

Ejecutar:

```bash
npm run doctor:operational
```

Resultado esperado:

- `DICTAMEN: OPERABLE`;
- ledger/finanzas saludables;
- C4/C5/Q1 visibles;
- sin errores criticos abiertos.

### 5.2 Snapshot final

Ejecutar:

```bash
npm run validate:operational-port
```

Registrar:

- pedidos activos;
- entregas del dia;
- tiempo promedio de entrega;
- entregas puntuales;
- C4 oportunidades;
- C4 acciones;
- C5 promociones;
- Q1 incidencias;
- Q1 causas raiz;
- Q1 merma;
- Q1 acciones correctivas.

### 5.3 Checklist OV1

Completar `OV1_CHECKLIST_OPERATIVA_V1.md` con:

- operacion;
- C4;
- C5;
- Q1;
- patrones detectados;
- dictamen de corrida.

## 6. Dictamen diario

Cada jornada debe cerrar con uno de estos estados:

| Dictamen | Significado |
| --- | --- |
| Verde | Jornada estable, GO permanece vigente |
| Amarillo | Jornada operable con observaciones, requiere seguimiento |
| Rojo | Jornada no operable, GO suspendido temporalmente |

## 7. Reglas de suspension del GO

Suspender temporalmente el GO si:

- Doctor Operativo emite `NO OPERABLE`;
- existe error critico sin resolver;
- el puerto `3001` deja de ser utilizable;
- ledger o finanzas fallan;
- C4, C5 o Q1 dejan de aparecer;
- se pierde trazabilidad de OV1;
- se requiere cambiar arquitectura para operar.

La suspension se levanta solo con:

1. diagnostico documentado;
2. correccion o contencion;
3. Doctor Operativo `OPERABLE`;
4. dictamen de reanudacion.

## 8. Lo que no se debe hacer durante el piloto

Durante el piloto no se debe:

- abrir O1;
- abrir Q2;
- abrir C6;
- activar IA predictiva;
- crear nuevas fuentes de verdad;
- cambiar RC2;
- modificar el core sin incidencia reproducible;
- cambiar de puerto para evitar un fallo sin diagnostico.

Estas restricciones quedan formalizadas en `DECISION_CONGELACION_ARQUITECTONICA_PILOTO_V1.md`.

## 9. Comandos oficiales

| Momento | Comando |
| --- | --- |
| Inicio de jornada | `npm run doctor:operational` |
| Corrida controlada | `npm run ov1:rotation` |
| Snapshot puntual | `npm run validate:operational-port` |
| Cierre de jornada | `npm run doctor:operational` |

## 10. Evidencia minima por jornada

Cada jornada debe dejar:

- resultado del Doctor previo;
- lista de participantes;
- numero de pedidos;
- incidencias registradas;
- snapshot final;
- checklist OV1;
- dictamen diario;
- decision de continuidad.

## 11. Historial

- 2026-07-25: Se crea el runbook operativo del piloto como procedimiento diario bajo GO condicionado.
- 2026-07-25: Se enlaza el plan operativo de Jornada 001 como primera ejecucion del piloto comercial controlado.
- 2026-07-25: Se enlaza la decision de congelacion arquitectonica de piloto.
