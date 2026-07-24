# GOAL-C3-001
## Fidelizacion Basica - Nelly OS

**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0

### 1. Objetivo

Construir una primera capa de fidelizacion basica sobre la SSOT certificada para convertir el historial real de clientes y comercios en acciones simples de recompra, seguimiento y retencion, sin crear una fuente paralela de verdad.

### 2. Alcance

Este goal comprende:

- usar la evidencia ya consolidada por `GOAL-C1-001` y `GOAL-C2-001`;
- detectar recurrencia, inactividad y frecuencia de compra;
- identificar clientes y comercios con patron util para seguimiento;
- preparar reglas simples de fidelizacion basadas en historial real;
- conservar consistencia con la operacion y con el CRM basico;
- habilitar una primera capa de accion sin tocar el core operativo.

### 2.1 Datos base

La fidelizacion debera apoyarse unicamente en datos ya certificados, por ejemplo:

- historial de pedidos por cliente;
- ticket promedio;
- recurrencia observada;
- actividad por comercio;
- ultima compra;
- frecuencia de compra;
- alertas comerciales relevantes;
- historial derivado desde la SSOT.

### 2.2 Primera fase de uso

La primera version debe priorizar reglas simples antes que automatizacion compleja:

- identificar clientes inactivos;
- identificar clientes recurrentes;
- detectar comercios con alta actividad;
- preparar listas de seguimiento manual;
- exponer condiciones simples para recompra o recordatorio.

### 2.3 Fase de accion

La primera version de fidelizacion debera servir para:

- registrar oportunidades de recompra;
- priorizar seguimientos manuales;
- asociar acciones simples a clientes y comercios;
- preparar una base util para promociones futuras o segmentacion ligera.

### 3. No alcance

Este goal no incluye:

- campanas automaticas complejas;
- motores de segmentacion avanzados;
- scoring predictivo;
- IA comercial completa;
- WhatsApp, SMS o correo automatizado;
- nuevas fuentes de datos;
- cambios al core operativo o al CRM basico.

### 4. Riesgos

- duplicar datos ya existentes en otras capas;
- convertir la fidelizacion en una nueva fuente de verdad;
- introducir reglas opacas o difíciles de auditar;
- mezclar seguimiento comercial con logica de negocio central;
- sobrecargar la primera version con automatizaciones prematuras.

### 5. Criterios de aceptacion

El goal se considerara listo para ejecucion cuando:

- exista una definicion clara de las acciones de fidelizacion basica;
- los datos provengan exclusivamente de la SSOT certificada;
- la lectura de cliente y comercio sea consistente;
- la capa de fidelizacion no requiera modificar el core para operar;
- exista continuidad con la evidencia de `GOAL-C1-001` y `GOAL-C2-001`.

### 5.1 Criterio de salida

GOAL-C3-001 se considerara exitoso cuando:

- el sistema permita identificar oportunidades simples de recompra;
- la recurrencia y la inactividad sean visibles;
- la informacion coincida con la operacion real;
- no existan fuentes paralelas de datos;
- el modelo quede listo para extenderse hacia promociones o analitica ligera.

### 6. Evidencias

- vistas o consultas de fidelizacion basica;
- lectura de recurrencia y seguimiento;
- referencias en indice maestro y biblioteca de goals;
- commits y validaciones del bloque C3.

### 7. Metricas iniciales

Se deberan medir, como minimo:

- clientes recurrentes;
- clientes inactivos;
- frecuencia de compra;
- ticket promedio;
- comercios con actividad alta;
- oportunidades de seguimiento util.

### 8. Relacion con C2

Este goal depende de la evidencia y de las lecturas derivadas en `GOAL-C2-001 - CRM Basico`. La fidelizacion no debe construir una nueva verdad; debe organizar y actuar sobre la evidencia ya disponible.

### 9. Historial

- 2026-07-24: Version inicial del goal para formalizar la fidelizacion basica como siguiente capacidad sobre la SSOT certificada.
- 2026-07-24: Se define como paso posterior al CRM basico, con foco en recompra, seguimiento y retencion.
