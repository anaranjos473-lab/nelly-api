# GOAL-C4-001
## Inteligencia Comercial - Nelly OS

**Estado:** Baseline abierta  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0

### 1. Objetivo

Construir una capa inicial de inteligencia comercial sobre la SSOT certificada para convertir el historial real de clientes y comercios en oportunidades, senales de atencion y acciones sugeridas, sin crear una fuente paralela de verdad ni introducir automatizacion prematura.

### 2. Alcance

Este goal comprende:

- usar la evidencia ya consolidada por `GOAL-C1-001`, `GOAL-C2-001` y `GOAL-C3-001`;
- detectar clientes inactivos, clientes recurrentes y comercios con caida de actividad;
- exponer oportunidades de seguimiento y reactivacion basadas en historial real;
- sugerir acciones simples para comercio y operacion;
- conservar consistencia con la SSOT y con las vistas ya certificadas;
- habilitar una primera capa de analitica accionable sin tocar el core operativo.

### 2.1 Datos base

La inteligencia comercial debera apoyarse unicamente en datos ya certificados, por ejemplo:

- historial de pedidos por cliente;
- ticket promedio;
- recurrencia observada;
- actividad por comercio;
- ultima compra;
- frecuencia de compra;
- alertas comerciales relevantes;
- historial derivado desde la SSOT;
- vistas de fidelizacion basica ya validadas.

### 2.2 Primera fase de uso

La primera version debe priorizar lectura y senales utiles antes que automatizacion:

- identificar clientes con riesgo de inactividad;
- identificar clientes con alta probabilidad de recompra;
- detectar comercios con caida de actividad;
- preparar listas de oportunidades de seguimiento;
- exponer acciones sugeridas para operacion o comercio.

### 2.3 Fase de accion

La primera version de inteligencia comercial debera servir para:

- registrar oportunidades de recompra o reactivacion;
- priorizar seguimientos manuales;
- asociar acciones simples a clientes y comercios;
- preparar una base util para promociones y segmentacion ligera;
- mantener trazabilidad sobre por que una oportunidad fue sugerida.

### 3. No alcance

Este goal no incluye:

- campanas automaticas complejas;
- motores de segmentacion avanzados;
- scoring predictivo;
- IA comercial completa;
- WhatsApp, SMS o correo automatizado;
- nuevas fuentes de datos;
- cambios al core operativo, al CRM basico o a la fidelizacion basica.

### 4. Riesgos

- duplicar datos ya existentes en otras capas;
- convertir la capa comercial en una nueva fuente de verdad;
- introducir reglas opacas o dificiles de auditar;
- mezclar analitica comercial con logica de negocio central;
- sobrecargar la primera version con automatizaciones prematuras.

### 5. Criterios de aceptacion

El goal se considerara listo para ejecucion cuando:

- exista una definicion clara de las oportunidades y acciones sugeridas;
- los datos provengan exclusivamente de la SSOT certificada;
- la lectura de cliente y comercio sea consistente;
- la capa no requiera modificar el core para operar;
- exista continuidad con la evidencia de `GOAL-C1-001`, `GOAL-C2-001` y `GOAL-C3-001`.

### 5.1 Criterio de salida

GOAL-C4-001 se considerara exitoso cuando:

- el sistema permita identificar oportunidades utiles de seguimiento;
- la inactividad y la recurrencia sean visibles en una vista simple;
- las sugerencias coincidan con la operacion real;
- no existan fuentes paralelas de datos;
- el modelo quede listo para extenderse hacia analitica ligera o promociones.

### 5.2 Estado de apertura

GOAL-C4-001 permanece como baseline abierta y siguiente frente de desarrollo. No debe interpretarse como capacidad cerrada hasta que exista evidencia de ejecucion funcional sobre la SSOT certificada.

### 6. Evidencias

- vistas o consultas de oportunidades comerciales;
- lectura de recurrencia, inactividad y sugerencias;
- referencias en indice maestro y biblioteca de goals;
- commits y validaciones de la capa comercial;
- evidencia de consumo desde la SSOT.

### 7. Metricas iniciales

Se deberan medir, como minimo:

- clientes recurrentes;
- clientes inactivos;
- frecuencia de compra;
- ticket promedio;
- comercios con actividad alta o baja;
- oportunidades de seguimiento util;
- acciones sugeridas mostradas en la vista comercial.

### 8. Relacion con C3

Este goal depende de la evidencia y de las lecturas derivadas en `GOAL-C3-001 - Fidelizacion Basica`. La capa de inteligencia comercial no debe construir una nueva verdad; debe organizar y actuar sobre la evidencia ya disponible.

### 9. Historial

- 2026-07-24: Version inicial del goal para formalizar la inteligencia comercial como siguiente capacidad sobre la SSOT certificada.
- 2026-07-24: Se define como paso posterior a C3, con foco en oportunidades, riesgo de abandono y acciones sugeridas.
