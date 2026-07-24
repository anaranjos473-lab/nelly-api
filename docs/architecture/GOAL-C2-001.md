# GOAL-C2-001
## CRM Basico - Nelly OS

**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0

### 1. Objetivo

Construir un CRM basico sobre la SSOT ya certificada para registrar, consultar y seguir la evidencia real de clientes y comercios sin introducir una fuente paralela de verdad.

### 2. Alcance

Este goal comprende:

- usar la evidencia comercial ya validada por `GOAL-C1-001`;
- registrar historial de pedidos por cliente;
- registrar historial de actividad por comercio;
- exponer recurrencia y patrones basicos de compra;
- conservar consistencia con la operacion y con la base certificada;
- habilitar una vista simple para seguimiento y fidelizacion.

### 2.1 Datos base

El CRM debera apoyarse unicamente en datos ya certificados, por ejemplo:

- pedidos entregados;
- ticket promedio;
- recurrencia observada;
- actividad por comercio;
- tiempos de operacion;
- alertas comerciales relevantes;
- historial derivado desde la SSOT.

### 2.1.1 Inventario inicial de campos

El primer paso de ejecucion es revisar el mapa de campos del CRM para asegurar que cada dato tenga una fuente SSOT y una regla de derivacion clara.

- [`C2_MAPEO_CAMPOS_CRM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/C2_MAPEO_CAMPOS_CRM_V1.md)

### 2.2 Fase de consulta

La primera version debe priorizar lectura antes que automatizacion:

- buscar cliente y ver su historial;
- buscar comercio y ver su actividad;
- revisar frecuencia y tendencia de compra;
- consultar notas u observaciones utiles para seguimiento;
- vincular el historial con la operacion ya existente.

### 2.3 Fase de uso operativo

El CRM basico debera servir para:

- entender que clientes compran mas de una vez;
- identificar comercios con mayor actividad;
- detectar patrones simples de recurrencia;
- apoyar seguimiento manual de relaciones comerciales;
- preparar una base util para futuras promociones o segmentacion.

### 2.4 Plan tecnico de ejecucion

#### Etapa 1 - Inventario y normalizacion

Objetivo:

- unificar la informacion existente sin crear una nueva fuente de verdad;
- mapear los campos que ya existen en la SSOT;
- definir que dato se consume, que dato se deriva y que dato se normaliza.

Campos de referencia:

- historial de pedidos -> `pedidos`;
- comercio -> `market_v1`;
- ticket promedio -> `GOAL-C1-001`;
- frecuencia de compra -> derivada de `pedidos`;
- ultimo pedido -> timestamp + estado;
- total gastado -> `total` / `monto` / `monto_total`;
- productos favoritos -> `items` / `normalizedItems`;
- zona de entrega -> direccion / coordenadas;
- observaciones -> notas del pedido;
- cliente -> `cliente_nombre` y campos relacionados.

Entregable:

- mapa de campos CRM con fuente SSOT, regla de derivacion y responsable del dato.

#### Etapa 2 - Ficha de Cliente

Objetivo:

- construir la primera vista util del CRM sobre la evidencia ya existente.

Campos basicos:

- nombre;
- telefono, si existe;
- fecha del primer pedido;
- fecha del ultimo pedido;
- pedidos realizados;
- pedidos entregados;
- ticket promedio;
- total gastado;
- frecuencia de compra;
- comercios mas utilizados;
- productos mas comprados;
- horarios frecuentes;
- cancelaciones;
- observaciones;
- ultima incidencia, si aplica.

Regla:

- todo debe salir de la SSOT, sin persistencia adicional ni fuente paralela.

#### Etapa 3 - Ficha de Comercio

Objetivo:

- consolidar una vista por comercio para seguimiento operativo y comercial.

Indicadores:

- clientes activos;
- clientes nuevos;
- clientes recurrentes;
- ticket promedio;
- productos mas vendidos;
- horas pico;
- ventas del dia;
- ventas del mes;
- tiempo promedio de preparacion;
- tiempo promedio de entrega;
- cancelaciones;
- estado operativo.

Regla:

- esta vista complementa el Dashboard Comercial sin duplicarlo.

#### Etapa 4 - Normalizacion incremental

Objetivo:

- consolidar solo aquello que el uso demuestre necesario.

Prioridades:

- identidad unica del cliente;
- catalogo consistente de productos;
- clasificacion de zonas;
- campo canonico de observaciones.

Regla:

- no tocar otros modelos hasta que exista evidencia suficiente de necesidad real.

### 3. No alcance

Este goal no incluye:

- campañas automaticas;
- motores de segmentacion avanzados;
- automatizaciones de marketing;
- scoring predictivo;
- IA comercial completa;
- nuevas fuentes de datos;
- cambios al core o al dashboard comercial.

### 4. Riesgos

- duplicar datos ya existentes en otras capas;
- convertir el CRM en una nueva fuente de verdad;
- introducir historiales inconsistentes con la operacion;
- mezclar seguimiento comercial con logica de negocio central;
- sobrecargar la primera version con funciones de fidelizacion prematuras.

### 5. Criterios de aceptacion

El goal se considerara listo para ejecucion cuando:

- exista una definicion clara de las vistas o consultas basicas;
- los datos provengan exclusivamente de la SSOT certificada;
- la lectura de cliente y comercio sea consistente;
- el CRM no requiera modificar el core para operar;
- exista continuidad con la evidencia de `GOAL-C1-001`.

### 5.1 Criterio de salida

GOAL-C2-001 se considerara exitoso cuando:

- el CRM basico permita consultar historial por cliente y comercio;
- la recurrencia y el seguimiento sean visibles;
- la informacion coincida con la operacion real;
- no existan fuentes paralelas de datos;
- el modelo quede listo para extenderse hacia fidelizacion y analitica ligera.

### 6. Evidencias

- consultas o vistas de historial por cliente;
- consultas o vistas de actividad por comercio;
- lectura de recurrencia y ticket promedio;
- referencias en indice maestro y biblioteca de goals;
- commits y validaciones del CRM basico.

### 7. Metricas iniciales

Se deberan medir, como minimo:

- pedidos por cliente;
- frecuencia de compra;
- ticket promedio por cliente;
- recurrencia por comercio;
- actividad de comercio en el tiempo;
- observaciones utiles para seguimiento.

### 8. Relacion con C1

Este goal depende de la evidencia y de las lecturas derivadas en `GOAL-C1-001 - Dashboard Comercial`. El CRM no debe construir una nueva verdad; debe organizar y consultar la evidencia ya disponible.

### 9. Historial

- 2026-07-24: Version inicial del goal para formalizar el CRM basico como siguiente capacidad sobre la SSOT certificada.
- 2026-07-24: Se define como paso posterior al Dashboard Comercial, con foco en historial, recurrencia y seguimiento de clientes y comercios.
- 2026-07-24: Se agrega el plan tecnico de ejecucion en cuatro etapas: inventario y normalizacion, ficha de cliente, ficha de comercio y normalizacion incremental.
- 2026-07-24: Se agrega el mapeo de campos inicial como primer entregable de la Etapa 1.
- 2026-07-24: Se aplica una normalizacion minima adicional para observaciones, zonas y origen comercial como consolidacion RC1.1.
