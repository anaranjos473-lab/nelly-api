# GOAL-C5-001
## Promociones Ligeras - Nelly OS

**Estado:** Baseline abierta  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0

### 1. Objetivo

Construir una primera capa de promociones ligeras sobre la SSOT certificada y las oportunidades detectadas por `GOAL-C4-001`, para sugerir acciones manuales simples sin crear automatizacion compleja ni una nueva fuente de verdad.

### 2. Alcance

Este goal comprende:

- usar la evidencia consolidada por `GOAL-C1-001`, `GOAL-C2-001`, `GOAL-C3-001` y `GOAL-C4-001`;
- sugerir promociones simples para clientes recurrentes o inactivos;
- sugerir acciones de reactivacion para comercios con caida de actividad;
- reutilizar oportunidades y prioridades ya derivadas en C4;
- mantener consistencia con la SSOT certificada y con las vistas de negocio existentes;
- preparar una capa ligera de accion comercial sin tocar el core operativo.

### 2.1 Datos base

Las promociones ligeras deberan apoyarse unicamente en datos ya certificados, por ejemplo:

- historial de pedidos por cliente;
- recurrencia observada;
- ultima compra;
- ticket promedio;
- actividad por comercio;
- oportunidades comerciales de C4;
- acciones sugeridas de C4;
- historial derivado desde la SSOT.

### 2.2 Primera fase de uso

La primera version debe priorizar sugerencias simples antes que automatizacion:

- sugerir promociones manuales por cliente;
- sugerir incentivos de reactivacion por comercio;
- priorizar oportunidades con mayor probabilidad de respuesta;
- preparar listas de accion comercial;
- conservar trazabilidad sobre por que una promocion fue sugerida.

### 2.3 Fase de accion

La primera version de promociones ligeras debera servir para:

- registrar promociones sugeridas;
- priorizar seguimientos manuales;
- asociar acciones simples a clientes y comercios;
- preparar una base util para segmentacion futura;
- mantener trazabilidad de las decisiones comerciales.

### 3. No alcance

Este goal no incluye:

- campanas automaticas complejas;
- motores de segmentacion avanzados;
- scoring predictivo;
- IA comercial completa;
- WhatsApp, SMS o correo automatizado;
- nuevas fuentes de datos;
- cambios al core operativo, al CRM basico, a la fidelizacion basica o a C4.

### 4. Riesgos

- duplicar datos ya existentes en otras capas;
- convertir la capa comercial en una nueva fuente de verdad;
- introducir reglas opacas o dificiles de auditar;
- mezclar promocion comercial con logica de negocio central;
- sobrecargar la primera version con automatizaciones prematuras.

### 5. Criterios de aceptacion

El goal se considerara listo para ejecucion cuando:

- exista una definicion clara de las promociones ligeras y sus sugerencias;
- los datos provengan exclusivamente de la SSOT certificada;
- la lectura de cliente y comercio sea consistente;
- la capa no requiera modificar el core para operar;
- exista continuidad con la evidencia de `GOAL-C1-001`, `GOAL-C2-001`, `GOAL-C3-001` y `GOAL-C4-001`.

### 5.1 Criterio de salida

GOAL-C5-001 se considerara exitoso cuando:

- el sistema permita sugerir promociones utiles de reactivacion;
- la recurrencia, la inactividad y la oportunidad comercial sean visibles;
- las sugerencias coincidan con la operacion real;
- no existan fuentes paralelas de datos;
- el modelo quede listo para extenderse hacia segmentacion ligera o promociones manuales.

### 5.2 Estado de apertura

GOAL-C5-001 permanece como baseline abierta y siguiente frente de desarrollo. No debe interpretarse como capacidad cerrada hasta que exista evidencia de ejecucion funcional sobre la SSOT certificada.

### 6. Evidencias

- vistas o consultas de promociones ligeras;
- lectura de recurrencia, inactividad y sugerencias;
- referencias en indice maestro y biblioteca de goals;
- commits y validaciones de la capa comercial;
- evidencia de consumo desde la SSOT;
- continuidad con C4.

### 7. Metricas iniciales

Se deberan medir, como minimo:

- promociones sugeridas;
- clientes recurrentes;
- clientes inactivos;
- oportunidades de reactivacion;
- comercios con actividad alta o baja;
- acciones sugeridas mostradas en la vista comercial.

### 8. Relacion con C4

Este goal depende de la evidencia y de las lecturas derivadas en `GOAL-C4-001 - Inteligencia Comercial`. La capa de promociones ligeras no debe construir una nueva verdad; debe organizar y actuar sobre la evidencia ya disponible.

### 9. Historial

- 2026-07-24: Version inicial del goal para formalizar promociones ligeras como siguiente capacidad sobre la SSOT certificada.
- 2026-07-24: Se define como paso posterior a C4, con foco en sugerencias manuales y reactivacion ligera.
- 2026-07-25: Se integra la primera version visual de promociones ligeras en el Dashboard Comercial como evidencia estructural inicial.
