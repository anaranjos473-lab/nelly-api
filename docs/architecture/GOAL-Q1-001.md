# GOAL-Q1-001
## Calidad Operativa - Nelly OS

**Estado:** Baseline abierta  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0

### 1. Objetivo

Construir una primera capa de Calidad Operativa sobre la SSOT certificada para registrar incidencias, mermas, causas y recomendaciones de mejora sin mezclar esa informacion con el CRM basico ni con la fidelizacion.

### 2. Alcance

Este goal comprende:

- usar la evidencia ya consolidada por `GOAL-C1-001`, `GOAL-C2-001`, `GOAL-C3-001`, `GOAL-C4-001` y `GOAL-C5-001`;
- registrar calidad de entrega;
- registrar calidad del producto;
- registrar calidad del empaque;
- registrar calidad del servicio;
- registrar mermas e incidencias;
- derivar causas raiz simples y recomendaciones operativas;
- conservar consistencia con la SSOT certificada y con las vistas de negocio existentes.

### 2.1 Datos base

La calidad operativa debera apoyarse unicamente en datos ya certificados, por ejemplo:

- estado de entrega;
- evidencia de entrega;
- hora real;
- confirmacion del cliente;
- producto recibido correctamente o con incidencia;
- empaque roto, derrame o sellado incorrecto;
- servicio con retraso o mala atencion;
- merma observada;
- causa raiz derivada;
- recomendaciones operativas.

### 2.2 Primera fase de uso

La primera version debe priorizar registro y lectura antes que automatizacion:

- identificar incidencias por entrega;
- identificar incidencias por producto;
- identificar incidencias por empaque;
- identificar incidencias por servicio;
- identificar mermas y su impacto estimado;
- preparar listas de mejora operativa.

### 2.3 Fase de accion

La primera version de Calidad Operativa debera servir para:

- registrar recomendaciones simples;
- priorizar mejoras por comercio, producto o repartidor;
- asociar causas raiz a incidentes recurrentes;
- preparar una base util para analitica operativa futura;
- mantener trazabilidad sobre por que una recomendacion fue sugerida.

### 3. No alcance

Este goal no incluye:

- scoring predictivo;
- IA comercial completa;
- automatizaciones de marketing;
- nuevas fuentes de datos;
- cambios al CRM basico, a la fidelizacion basica, a la inteligencia comercial o a promociones ligeras.

### 4. Riesgos

- duplicar datos ya existentes en otras capas;
- convertir la capa operativa en una nueva fuente de verdad;
- introducir reglas opacas o dificiles de auditar;
- mezclar calidad operativa con logica de negocio central;
- sobrecargar la primera version con automatizaciones prematuras.

### 5. Criterios de aceptacion

El goal se considerara listo para ejecucion cuando:

- exista una definicion clara de incidencias, mermas y recomendaciones;
- los datos provengan exclusivamente de la SSOT certificada;
- la lectura de calidad operativa sea consistente;
- la capa no requiera modificar el core para operar;
- exista continuidad con la evidencia de `GOAL-C1-001`, `GOAL-C2-001`, `GOAL-C3-001`, `GOAL-C4-001` y `GOAL-C5-001`.

### 5.1 Criterio de salida

GOAL-Q1-001 se considerara exitoso cuando:

- el sistema permita identificar incidencias utiles de seguimiento;
- la calidad de entrega, producto, empaque y servicio sea visible;
- las recomendaciones coincidan con la operacion real;
- no existan fuentes paralelas de datos;
- el modelo quede listo para extenderse hacia analitica operativa ligera.

### 5.2 Estado de apertura

GOAL-Q1-001 permanece como baseline abierta y siguiente frente de desarrollo. No debe interpretarse como capacidad cerrada hasta que exista evidencia de ejecucion funcional sobre la SSOT certificada.

### 6. Evidencias

- vistas o consultas de calidad operativa;
- lectura de incidencias, causas raiz y mermas;
- referencias en indice maestro y biblioteca de goals;
- commits y validaciones de la capa operativa;
- evidencia de consumo desde la SSOT;
- continuidad con C1, C2, C3, C4 y C5.

### 7. Metricas iniciales

Se deberan medir, como minimo:

- incidencias por entrega;
- incidencias por producto;
- incidencias por empaque;
- incidencias por servicio;
- merma estimada;
- recomendaciones sugeridas.

### 8. Relacion con C4 y C5

Este goal depende de la evidencia y de las lecturas derivadas en `GOAL-C4-001 - Inteligencia Comercial` y `GOAL-C5-001 - Promociones Ligeras`. La capa de calidad operativa no debe construir una nueva verdad; debe organizar y actuar sobre la evidencia ya disponible.

### 9. Historial

- 2026-07-25: Version inicial del goal para formalizar Calidad Operativa como dominio separado sobre la SSOT certificada.
- 2026-07-25: Se define como capa transversal de incidencias, mermas, causa raiz y recomendaciones.
