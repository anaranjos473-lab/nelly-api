# C3 EVIDENCIA VISTA FIDELIZACION V1

**Estado:** Evidencia inicial consolidada  
**Ambito:** Plataforma Nelly OS  
**Goal asociado:** `GOAL-C3-001`

## 1. Objetivo

Dejar constancia de la primera evidencia de ejecucion de C3 sobre la SSOT certificada, con dos lecturas simples:

- fidelizacion por cliente;
- fidelizacion por comercio.

## 2. Fuente de verdad

La evidencia se construye unicamente sobre la SSOT ya certificada por:

- `GOAL-C1-001 - Dashboard Comercial`
- `GOAL-C2-001 - CRM Basico`

No se crean bases paralelas ni se modifica el core operativo.

## 3. Vista de fidelizacion por cliente

Resultado inicial observado sobre la proyeccion de CRM:

- clientes totales: `20`
- clientes recurrentes: `11`
- clientes inactivos: `1`
- candidatos de seguimiento: `12`

### 3.1 Muestra de seguimiento

| Cliente | Estado | Sugerencia |
| --- | --- | --- |
| Cliente Piloto | Inactivo | seguimiento_reactivacion |
| ALBERTO | Recurrente | posible_recompra |
| Validacion Final | Recurrente | posible_recompra |
| Diagnostico complete-order | Recurrente | posible_recompra |
| C3.1 Driver Trace | Recurrente | posible_recompra |

## 4. Vista de fidelizacion por comercio

La segunda lectura del bloque C3 se apoya en el historial de pedidos y en el marketplace certificado para identificar:

- comercios con recurrencia;
- comercios con inactividad;
- comercios con prioridad de seguimiento.

### 4.1 Campos expuestos

- pedidos totales;
- clientes totales;
- clientes recurrentes;
- ticket promedio;
- total gastado;
- dias sin movimiento;
- sugerencia;
- prioridad.

## 5. Lectura operativa

La evidencia confirma que:

- C3 ya puede mostrar una lectura util sin crear nuevas fuentes de datos;
- la fidelizacion se apoya en historial real y no en supuestos;
- las dos vistas son complementarias y no duplican el core;
- el seguimiento queda planteado como accion manual apoyada en evidencia.

## 6. Restricciones

- no automatizar campañas;
- no crear scoring predictivo;
- no introducir fuentes de datos paralelas;
- no modificar contratos certificados;
- no alterar el core operativo para obtener estas vistas.

## 7. Criterio de continuidad

Esta evidencia permite continuar C3 hacia:

- mayor normalizacion de la lectura por comercio;
- reglas simples de recompra;
- seguimiento manual de clientes y comercios;
- futura extension a promociones ligeras, si la operacion lo justifica.
