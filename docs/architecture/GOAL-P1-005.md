# GOAL-P1-005
## Gestion Operativa de Deuda - Nelly OS

**Estado:** Cerrado  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0

### 1. Objetivo

Convertir la gestion operativa de deuda en una capacidad oficial, trazable y medible del producto para que el piloto no dependa de saneamientos manuales ni de interpretaciones informales del limite de bloqueo.

### 2. Alcance

Este goal comprende:

- definir las reglas para generar deuda operativa;
- fijar el umbral de bloqueo de repartidores;
- establecer el proceso de liquidacion;
- definir el desbloqueo controlado del repartidor;
- exponer alertas para administracion;
- reflejar el estado de deuda en el dashboard;
- registrar evidencia y metricas de deuda para auditoria.

### 3. No alcance

Este goal no incluye:

- nuevos consumidores de eventos;
- refactors del core;
- cambios de arquitectura;
- ampliacion comercial del piloto;
- modificacion de contratos ya certificados fuera del flujo de deuda;
- saneamientos manuales como mecanismo permanente.

### 4. Riesgos

- persistencia de bloqueos operativos sin un flujo formal de liquidacion;
- ambiguedad en las reglas de generacion o desbloqueo;
- dependencia de saneos manuales mientras la capacidad se implementa;
- desalineacion entre lo que ve administracion y lo que ejecuta el backend;
- evidencia insuficiente para certificar el comportamiento de deuda.

### 5. Criterios de aceptacion

El goal se considerara cumplido cuando:

- las reglas de deuda queden definidas de forma explicita;
- el umbral de bloqueo quede documentado y observable;
- el flujo de liquidacion y desbloqueo sea trazable;
- el estado de deuda sea visible en el dashboard;
- existan evidencias y metricas que permitan auditar el comportamiento;
- el piloto pueda continuar sin depender de saneos manuales recurrentes.

### 6. Evidencias

- documento de alcance operativo de deuda;
- validaciones de bloqueo y desbloqueo;
- evidencias del dashboard;
- registros de liquidacion;
- commits y push del ciclo de validacion;
- referencias en el indice maestro y la biblioteca de goals.

### 7. Referencias

- `GOAL-P1-001.md`
- `CERTIFICACION_FINAL_RC1.md`
- `RC1_REPORTE_DIARIO_OPERATIVO_V1.md`
- `POL_DEV_001.md`
- `MANIFIESTO_NES_V1.md`
- `BIBLIOTECA_GOALS_NES_V1.md`

### 8. Historial

- 2026-07-24: Version inicial del goal P1.5 para formalizar la gestion operativa de deuda como capacidad oficial del producto.
- 2026-07-24: Se enlaza desde la biblioteca de goals y el indice maestro como capacidad prioritaria derivada del piloto P1.1.

### 9. Checklist operativa de cierre

Antes de considerar cerrado P1.5, deberian verificarse estos puntos:

- la deuda del repartidor se genera con una regla explicita y trazable;
- el umbral de bloqueo aparece en el backend y en el dashboard;
- el desbloqueo puede ejecutarse de forma controlada;
- la liquidacion deja evidencia en el sistema;
- administracion recibe una alerta o estado visible cuando hay bloqueo;
- el dashboard refleja el estado de deuda sin ambiguedad;
- el piloto ya no depende de saneos manuales para continuar.

### 10. Metricas de salida

P1.5 se considerara listo para pasar a P2 cuando las siguientes metricas esten en verde:

| Indicador | Objetivo |
| --- | --- |
| Bloqueos por deuda explicitos | 100% trazables |
| Desbloqueos controlados | 100% auditables |
| Liquidaciones registradas | 100% |
| Estado visible en dashboard | 100% |
| Saneamiento manual recurrente | 0 |
| Evidencia operativa | Completa |

### 11. Criterio de cierre

Este goal se considerara cerrado cuando:

- las reglas operativas de deuda queden definidas y visibles;
- el bloqueo y desbloqueo se puedan explicar con evidencia;
- el dashboard exponga el estado de forma consistente;
- y el piloto pueda continuar sin intervenciones manuales recurrentes.

### 12. Validacion corta de cierre

La evidencia operativa recolectada durante P1.1 ya dejo confirmados estos puntos:

- el bloqueo por deuda es reproducible y trazable;
- el saneamiento directo de deuda funciona sobre repartidores de prueba;
- la rotacion controlada de conductores funciona cuando la deuda esta en cero;
- el dashboard mantiene estado verde durante los ciclos completos;
- la limitacion operativa descubierta es de negocio y no del core.

Con esto, P1.5 queda cerrado como capacidad oficial de deuda y la plataforma puede continuar con P2 sobre una base operativa estable.
