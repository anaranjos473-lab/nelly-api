# GOAL-C1-001
## Dashboard Comercial - Nelly OS

**Estado:** Certificado  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0

### 1. Objetivo

Transformar los datos operativos ya certificados en informacion util para que cada comercio tome mejores decisiones sobre ventas, operacion, clientes y finanzas.

### 2. Alcance

Este goal comprende:

- consumir unicamente la SSOT certificada como fuente de verdad;
- exponer indicadores de negocio ya derivados de la operacion real;
- presentar el estado comercial sin tocar el core operativo;
- mostrar alertas accionables para comercio y administracion;
- mantener consistencia entre dashboard, backend y evidencia operacional.

### 2.1 Fase de indicadores esenciales

Los indicadores iniciales deberan cubrir, como minimo:

- ventas del dia, la semana y el mes;
- pedidos recibidos, entregados, cancelados y en proceso;
- clientes nuevos, recurrentes, ticket promedio y frecuencia de compra;
- tiempo promedio de aceptacion, preparacion y entrega;
- porcentaje de entregas puntuales;
- ingresos del comercio, comisiones, ganancia estimada y estado de liquidaciones.

### 2.2 Fase de visualizacion

La primera version debe priorizar claridad y utilidad:

- tarjetas con KPIs esenciales;
- estado operativo simple y legible;
- tendencias basicas cuando exista historico suficiente;
- comparativas solo si no introducen ruido o ambiguedad.

### 2.3 Fase de alertas

El dashboard debera señalar situaciones que requieran atencion, por ejemplo:

- aumento de cancelaciones;
- retrasos sostenidos en preparacion o entrega;
- repartidores bloqueados por deuda;
- pedidos por encima del objetivo de tiempo;
- desalineacion entre operacion real y lectura comercial.

### 3. No alcance

Este goal no incluye:

- nuevas fuentes de datos;
- cambios al core operativo;
- refactors de eventos o del ledger;
- nuevas reglas de negocio;
- automatizaciones comerciales complejas;
- CRM completo o campañas automaticas.

### 4. Riesgos

- acoplar la vista comercial al flujo de negocio en lugar de consumir SSOT;
- introducir metricas inconsistentes con la operacion real;
- duplicar logica ya resuelta en otras capas;
- sobrecargar la primera version con demasiados graficos;
- confundir visualizacion de negocio con fuente de verdad.

### 5. Criterios de aceptacion

El goal se considerara listo para ejecucion cuando:

- los indicadores esenciales esten definidos;
- la fuente de datos sea exclusivamente la SSOT certificada;
- la vista muestre informacion real y consistente;
- el dashboard no requiera modificar el core para obtener datos;
- exista una base clara para alertas comerciales.

### 5.1 Criterio de salida

GOAL-C1-001 se considerara exitoso cuando:

- el Dashboard Comercial muestre KPIs utiles y consistentes;
- la lectura coincida con la operacion real;
- las alertas reflejen situaciones accionables;
- no exista dependencia de fuentes paralelas o duplicadas;
- la base quede lista para extenderse hacia CRM basico.

### 6. Evidencias

- definicion de KPIs iniciales;
- vista comercial operativa;
- pruebas de lectura desde la SSOT;
- alertas basicas o estados de atencion;
- referencias en indice maestro y biblioteca de goals;
- commits y validaciones del dashboard comercial.

### 7. Metricas iniciales

Se deberan medir, como minimo:

- ventas del dia;
- ventas semanales y mensuales;
- pedidos por estado;
- clientes recurrentes;
- ticket promedio;
- tiempos de operacion;
- entregas puntuales;
- estado de liquidaciones;
- alertas de riesgo comercial.

### 8. Relacion con el CRM

Este goal prepara la base para `GOAL-C2-001 - CRM Basico`, ya que la evidencia comercial obtenida aqui alimentara historial, recurrencia y seguimiento de clientes y comercios.

### 9. Historial

- 2026-07-24: Version inicial del goal para formalizar el Dashboard Comercial como capacidad oficial.
- 2026-07-24: Se define como siguiente objetivo operativo tras P1.5 y P2, consumiendo solo SSOT certificada.
- 2026-07-24: Se certifica con evidencia operativa real; el snapshot comercial responde en verde, consume la SSOT y expone ventas, pedidos, clientes, liquidez, marketplace y alertas consistentes con la operacion viva.
