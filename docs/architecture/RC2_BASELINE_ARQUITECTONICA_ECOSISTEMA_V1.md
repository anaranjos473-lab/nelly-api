# RC2 BASELINE ARQUITECTONICA ECOSISTEMA V1

**Estado:** Baseline arquitectonica activa  
**Ambito:** Plataforma Nelly OS  
**Referencia:** `CHECKPOINT_G1_ECOSISTEMA_COMERCIAL_V1.md`

## 1. Proposito

Declarar oficialmente la arquitectura estabilizada del ecosistema Nelly antes de abrir nuevas capacidades, dejando separadas las responsabilidades entre operacion, CRM, fidelizacion, inteligencia comercial, promociones ligeras y calidad operativa.

## 2. Alcance

Esta baseline cubre:

- la SSOT certificada como fuente unica de verdad;
- la separacion entre dominios funcionales;
- la coherencia entre C2, C3, C4, C5 y Q1;
- el Gate G1 como control transversal;
- la trazabilidad documental en el indice maestro y la biblioteca de goals.

## 3. Mapa de dominios

| Dominio | Responsabilidad | Consume | Produce |
| --- | --- | --- | --- |
| Operacion | Gestion de pedidos, estados y ejecucion | SSOT | Eventos operativos |
| CRM | Conocer clientes y comercios | SSOT | Perfiles e historial |
| Fidelizacion | Mantener la relacion | CRM | Segmentos basicos y seguimiento |
| Inteligencia Comercial | Recomendar decisiones comerciales | CRM + Q1 | Oportunidades y acciones sugeridas |
| Promociones Ligeras | Proponer acciones comerciales manuales | C4 | Sugerencias de promocion |
| Calidad Operativa | Capturar incidencias y causa raiz | SSOT | Indicadores de calidad y recomendaciones |

## 3.1 Matriz oficial de dominios

| Dominio | Proposito | Consume | Produce | Responsable |
| --- | --- | --- | --- | --- |
| Operacion | Ejecutar pedidos y entregas | SSOT | Eventos operativos | Operacion |
| CRM | Gestionar clientes y comercios | SSOT | Perfiles e historial | Comercial |
| Fidelizacion | Mantener la relacion con clientes | CRM | Segmentos y seguimiento | Comercial |
| Inteligencia Comercial | Analizar oportunidades | CRM + Q1 | Recomendaciones | Comercial |
| Promociones Ligeras | Proponer acciones comerciales | C4 | Propuestas de promocion | Comercial |
| Calidad Operativa | Medir calidad y mejora continua | SSOT | Incidencias, causa raiz e indicadores | Operacion |

## 4. Reglas de arquitectura

- una sola SSOT;
- un dominio por responsabilidad;
- Q1 no se mezcla con CRM ni con fidelizacion;
- C4 usa evidencia de C2, C3 y Q1 para recomendar;
- C5 usa C4 para proponer acciones manuales;
- ninguna capa debe crear una verdad paralela.

## 4.1 Principios de RC2

- la SSOT es la unica fuente de verdad;
- ningun dominio puede duplicar datos de otro;
- cada dominio tiene una unica responsabilidad;
- las recomendaciones deben ser explicables y basadas en reglas verificables;
- las nuevas capacidades deben integrarse a un dominio existente o justificar la creacion de uno nuevo;
- ningun desarrollo puede romper G1 sin una nueva revision de consistencia.

## 5. Restricciones

- no abrir C6 sin revisar esta baseline;
- no introducir nuevas fuentes de datos;
- no fusionar dominios por conveniencia de implementacion;
- no modificar el core para resolver solapamientos de dominio.

## 6. Criterio de uso

Esta baseline debe consultarse antes de abrir nuevas capacidades comerciales u operativas. Si una propuesta no puede ubicarse claramente en uno de los dominios definidos, debe revisarse antes de implementarse.

## 7. Relacion con G1

`GOAL-G1-001` y sus matrices asociadas sirven como checkpoint transversal. `RC2` formaliza la arquitectura estable que resulta de ese checkpoint.

## 7.1 Relacion con el mapa final de estado

`ESTADO_FINAL_ECOSISTEMA_V1.md` resume que C2 queda cerrado funcionalmente, C4 queda cerrado con salvedad operativa, C5 permanece como baseline abierta, Q1 permanece como dominio transversal en apertura y G1 sigue como gate activo.

## 7.2 Relacion con el cierre C3 C4

`CIERRE_C3_C4_ECOSISTEMA_V1.md` deja constancia del cierre funcional de `GOAL-C3-001` y del cierre con salvedad operativa de `GOAL-C4-001`. Esta referencia consolida la linea base comercial antes de abrir cualquier nueva capacidad.

## 7.3 Relacion con la matriz final del ecosistema

`MATRIZ_FINAL_ECOSISTEMA_COMERCIAL_V1.md` fija la lectura consolidada de Operacion, C2, C3, C4, C5, Q1, G1 y RC2 para evitar ambiguedades antes de cualquier ampliacion futura.

## 7.4 Relacion con O1 - Observabilidad Operativa

`O1 - Observabilidad Operativa` queda identificado como dominio candidato posterior al piloto, no como dominio activo de RC2.

La arquitectura actual ya cuenta con piezas fundacionales para ese futuro dominio:

- health checks;
- `npm run validate:operational-port`;
- `npm run doctor:operational`;
- snapshot operativo;
- Q1;
- OV1;
- codigos accionables de diagnostico.

Sin embargo, RC2 mantiene la restriccion de no abrir nuevos dominios antes de demostrar valor operativo con datos reales.

O1 solo debera abrirse si el piloto demuestra que Nelly necesita convertir el diagnostico actual en una capacidad formal de autodiagnostico, severidad, impacto, aprendizaje operativo y mejora continua.

## 8. Historial

- 2026-07-25: Se crea la baseline arquitectonica RC2 como referencia estable del ecosistema.
- 2026-07-25: Se agrega la matriz oficial de dominios y los principios de RC2 como contrato de evolucion del ecosistema.
- 2026-07-25: Se registra O1 como dominio candidato post-piloto, manteniendo RC2 sin nuevos dominios activos.
