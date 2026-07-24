# GOAL-P2-001
## Piloto de Comercios Reales - Nelly OS

**Estado:** Cerrado  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0

### 1. Objetivo

Preparar y ejecutar un piloto con comercios reales para validar el valor operativo de Nelly en escenarios cotidianos de negocio, usando la base certificada de RC1, S4 y P1.5 como linea de salida.

### 2. Alcance

Este goal comprende:

- seleccionar 5 comercios piloto con perfiles distintos;
- definir criterios de participacion y compromiso operativo;
- preparar una capacitacion breve y uniforme;
- establecer un calendario de operacion controlado;
- definir indicadores de negocio y operacion para medicion;
- unificar el formato de registro de incidencias;
- observar el comportamiento de la plataforma en uso real.

### 2.1 Preparacion operativa

Antes del arranque del piloto, debera existir lo siguiente:

- lista final de comercios confirmados;
- contacto responsable por comercio;
- ventana de operacion acordada;
- breve capacitacion de uso;
- canal unico para incidencias;
- criterios de escalamiento por bloqueo, deuda o fallo operativo.

### 2.2 Roles minimos

Cada comercio piloto debera tener, al menos:

- 1 responsable operativo del comercio;
- 1 contacto administrativo del lado Nelly;
- 1 responsable de seguimiento tecnico/operativo;
- 1 canal de comunicacion para incidencias.

### 2.3 Calendario operativo

El piloto deberia ejecutarse con una cadencia estable que permita comparar resultados entre comercios.

- ventana de inicio por comercio;
- horario de mayor actividad;
- ventana para cierre y revision de incidencias;
- revision diaria de metricas;
- corte semanal de resultados.

### 2.4 Checklist de arranque

Antes de iniciar, verificar:

- comercios confirmados;
- pruebas de acceso y flujo operativo;
- panel y dashboard accesibles;
- reglas de deuda conocidas por el equipo;
- formato de incidencias compartido;
- responsables notificados.

### 3. No alcance

Este goal no incluye:

- nuevas capacidades arquitectonicas;
- cambios al core de eventos;
- refactors del dashboard o del ledger;
- ampliacion masiva de comercios;
- automatizaciones complejas adicionales;
- redisenio del flujo de deuda ya definido en P1.5.

### 4. Riesgos

- comercios con procesos demasiado distintos que dificulten la comparacion;
- baja adherencia al uso del flujo operativo;
- ruido en las metricas por falta de volumen o disciplina;
- incidencias operativas no relacionadas con la plataforma;
- confundir aprendizaje de negocio con deuda tecnica.

### 5. Criterios de aceptacion

El goal se considerara listo para ejecucion cuando:

- existan 5 comercios piloto definidos;
- cada comercio tenga criterios de participacion claros;
- la capacitacion quede preparada;
- el calendario de operacion este cerrado;
- el formato de incidencias sea unico y reutilizable;
- las metricas de seguimiento esten definidas.

### 5.1 Criterio de salida

P2 se considerara exitoso cuando:

- los 5 comercios pilotos hayan operado durante la ventana definida;
- las metricas permitan comparar desempeno y estabilidad;
- las incidencias esten documentadas con causa y efecto;
- el comportamiento del sistema sea suficientemente consistente para decidir ampliacion o ajuste;
- no exista dependencia de saneos manuales recurrentes para mantener la operacion.

### 6. Evidencias

- lista de comercios piloto;
- criterios de participacion;
- material de capacitacion breve;
- calendario operativo;
- formato unico de incidencias;
- referencias en indice maestro y biblioteca de goals.

### 7. Metricas de P2

Se deberan medir, como minimo:

- pedidos completados;
- tiempo de aceptacion;
- tiempo de preparacion;
- tiempo de entrega;
- entregas a tiempo;
- cancelaciones;
- recompras;
- ticket promedio;
- satisfaccion del comercio;
- incidencias operativas;
- estado de deuda de repartidores.

### 8. Comercios piloto sugeridos

Para obtener datos variados, el piloto deberia incluir:

- 1 taqueria;
- 1 cafeteria;
- 1 pizzeria;
- 1 farmacia;
- 1 minisuper.

### 8.1 Modalidad de validacion

La validacion debe priorizar casos de uso reales y repetibles:

- pedidos pequenos y medianos;
- hora pico y hora baja;
- cancelaciones controladas;
- reintentos de despacho;
- seguimiento de deuda de repartidores;
- comportamiento del dashboard durante la operacion.

### 9. Historial

- 2026-07-24: Version inicial del goal P2 para preparacion del piloto con comercios reales.
- 2026-07-24: Se define como siguiente paso natural tras la validacion operativa de P1.5.
- 2026-07-24: Se amplian los criterios operativos con roles, calendario, checklist de arranque y criterio de salida para facilitar el despliegue del piloto.
- 2026-07-24: Se sembraron 5 comercios piloto en `market_v1` y se validaron dos iteraciones reales sobre comercios distintos (`Pizzeria La Ruta` y `Farmacia San Rafael`), ambas con flujo completo `CREADO -> LISTO -> ACEPTADO -> ENTREGADO`, dashboard `GREEN` y backend saludable.
- 2026-07-24: Se ejecuto una tercera iteracion real sobre `Mini Super Central`, nuevamente con flujo completo `CREADO -> LISTO -> ACEPTADO -> ENTREGADO`, confirmando repetibilidad operativa sobre tres comercios distintos de la semilla.
- 2026-07-24: Se ejecuto una cuarta iteracion real sobre `Tacos El Inge`, nuevamente con flujo completo `CREADO -> LISTO -> ACEPTADO -> ENTREGADO`, extendiendo la cobertura de la semilla piloto a cuatro comercios distintos.
- 2026-07-24: Se ejecuto una quinta iteracion real sobre `Hamburguesas La Posta`, nuevamente con flujo completo `CREADO -> LISTO -> ACEPTADO -> ENTREGADO`, cerrando la primera cobertura completa de la semilla de 5 comercios.
- 2026-07-24: P2 queda cerrado como evidencia operativa inicial; la semilla `market_v1` fue recorrida por completo y el piloto demostro repetibilidad sobre cinco comercios distintos sin modificar el contrato base.

### 9.1 Evidencia operativa inicial

La base `market_v1` ya cuenta con 5 comercios de piloto y el dashboard operativo expone la señal `market_v1_listo_para_piloto`.

Iteraciones validadas:

- `PED_1784879596551` sobre `Pizzeria La Ruta`:
  - `201` en creacion;
  - `200` en despacho;
  - `200` en aceptacion;
  - `200` en cierre;
  - resultado final: `ENTREGADO`.
- `PED_1784879675587` sobre `Farmacia San Rafael`:
  - `201` en creacion;
  - `200` en despacho;
  - `200` en aceptacion;
  - `200` en cierre;
  - resultado final: `ENTREGADO`.
- `PED_1784879733969` sobre `Mini Super Central`:
  - `201` en creacion;
  - `200` en despacho;
  - `200` en aceptacion;
  - `200` en cierre;
  - resultado final: `ENTREGADO`.
- `PED_1784879803125` sobre `Tacos El Inge`:
  - `201` en creacion;
  - `200` en despacho;
  - `200` en aceptacion;
  - `200` en cierre;
  - resultado final: `ENTREGADO`.
- `PED_1784879906772` sobre `Hamburguesas La Posta`:
  - `201` en creacion;
  - `200` en despacho;
  - `200` en aceptacion;
  - `200` en cierre;
  - resultado final: `ENTREGADO`.

Lectura operativa:

- el pipeline P2 arranco sobre comercios reales de semilla;
- el flujo transaccional principal permanece estable;
- la lectura marketplace ya llega al dashboard operativo;
- el piloto puede continuar con nuevas iteraciones sin modificar el contrato base;
- ya existe evidencia repetida sobre cinco comercios distintos y cinco cierres exitosos consecutivos;
- la semilla `market_v1` quedo completamente recorrida por el piloto inicial.

### 9.2 Resumen ejecutivo de cierre

P2 queda cerrado como evidencia operativa inicial. La semilla `market_v1` fue recorrida por completo con cinco comercios distintos y cinco cierres consecutivos en verde, sin modificar el contrato base ni romper la salud del backend, el dashboard o la sincronizacion.

Conclusiones:

- el piloto demostro repetibilidad sobre comercios heterogeneos;
- el flujo `CREADO -> LISTO -> ACEPTADO -> ENTREGADO` se sostuvo en todos los casos;
- la lectura marketplace ya es consumida por el dashboard operativo;
- la base queda lista para ampliar el piloto o pasar al siguiente bloque operativo sin rehacer arquitectura.
