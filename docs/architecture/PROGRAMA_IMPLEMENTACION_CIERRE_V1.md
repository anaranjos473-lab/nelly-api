# PROGRAMA DE IMPLEMENTACION - CIERRE V1

## Fecha
2026-07-22

## Proposito
Dejar constancia de que el programa de implementacion opera como puente entre la arquitectura certificada y la adopcion real.

## Estado final del enfoque

- B quedo estabilizada.
- U1 definio el dominio universal.
- U2 materializo el nucleo universal.
- U3 consolido la migracion progresiva.
- El programa de implementacion toma el relevo operacional.

## Lo que valida este cierre

1. El proyecto ya no depende de inventar mas arquitectura.
2. El foco pasa a ser adopcion, observabilidad y validacion en campo.
3. La plataforma conserva una linea de base clara para detectar regresiones.

## Siguiente paso

Iniciar la siguiente etapa operativa con la misma disciplina de evidencia, pruebas y validacion usada en B, U1, U2 y U3.

## Siguiente etapa operativa

El foco a partir de este punto se concentra en tres capacidades de producto:

1. `P1.5` - Gestion Operativa de Deuda.
2. `GOAL-C1-001` - Dashboard Comercial.
3. CRM basico sobre evidencia real.

### Orden de ejecucion

#### 1) P1.5 - Gestion Operativa de Deuda

Objetivo:

- convertir la deuda en una capacidad oficial, visible y medible del producto;
- eliminar saneos manuales recurrentes como mecanismo normal de operacion;
- dejar trazabilidad sobre bloqueo, liquidacion, desbloqueo y alertas.

Criterios de salida:

- reglas de deuda explicitadas;
- umbral de bloqueo visible;
- flujo de liquidacion y desbloqueo auditable;
- dashboard mostrando estado de deuda sin ambiguedad;
- evidencias y metricas registradas.

#### 2) Dashboard Comercial

Objetivo:

- ofrecer una vista orientada al comercio, no solo a la operacion interna;
- mostrar valor de negocio con indicadores simples y accionables.

Indicadores iniciales:

- ventas;
- pedidos;
- ticket promedio;
- clientes recurrentes;
- horas pico;
- tiempos de entrega.

Criterios de salida:

- vista cargando informacion real;
- indicadores consistentes con el flujo operativo;
- lectura estable desde la base certificada;
- sin duplicar logica del dashboard operativo.

#### 3) CRM basico

Objetivo:

- empezar a registrar y consultar evidencia real de clientes y comercios;
- habilitar seguimiento y fidelizacion sobre datos ya producidos por la plataforma.

Alcance minimo:

- historial de pedidos por cliente;
- historial de actividad por comercio;
- marcas basicas de recurrencia;
- observaciones operativas utiles para seguimiento.

Criterios de salida:

- historial visible y consistente;
- lectura simple desde la evidencia operativa;
- sin introducir modelos paralelos de negocio;
- listo para extenderse hacia fidelizacion o analitica ligera.

## Cierre operativo de la etapa

La etapa quedara cerrada cuando:

- P1.5 este formalizado y en uso;
- el Dashboard Comercial muestre datos reales de negocio;
- el CRM basico pueda consultar evidencia real sin romper la SSOT;
- no se introduzcan cambios estructurales al core para lograrlo.

## Plan de trabajo por prioridad

### Prioridad 1

- formalizar P1.5 como capacidad oficial;
- dejar claras las reglas de deuda, liquidacion y desbloqueo;
- asegurar que el dashboard muestre el estado de deuda sin ambiguedad.

### Prioridad 2

- construir el Dashboard Comercial;
- exponer ventas, pedidos, ticket promedio, recurrencia, horas pico y tiempos de entrega;
- validar lectura estable desde la base certificada.

### Prioridad 3

- habilitar el CRM basico;
- registrar historial de cliente y comercio;
- dejar evidencia util para seguimiento y fidelizacion.

## Plan de trabajo por semanas

### Semana 1

- revisar y fijar el alcance final de P1.5;
- definir las reglas de bloqueo, liquidacion y desbloqueo;
- validar que el dashboard operativo ya refleje el estado de deuda;
- documentar evidencias y criterios de salida.

### Semana 2

- construir el Dashboard Comercial sobre la base ya certificada;
- conectar los indicadores de negocio;
- comprobar que los datos coinciden con la operacion real;
- ajustar solo si aparece una inconsistencia medible.

### Semana 3

- activar el CRM basico;
- consultar historial de pedidos por cliente y actividad por comercio;
- validar recurrencia y notas de seguimiento;
- cerrar la etapa solo cuando no exista deuda funcional pendiente.

### Regla de ejecucion

No iniciar la prioridad siguiente hasta que la anterior quede operativa, validada y documentada con evidencia real. Si aparece una incidencia, se corrige la minima parte necesaria para cerrar la capacidad afectada antes de avanzar.
