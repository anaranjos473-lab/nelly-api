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

## 4. Reglas de arquitectura

- una sola SSOT;
- un dominio por responsabilidad;
- Q1 no se mezcla con CRM ni con fidelizacion;
- C4 usa evidencia de C2, C3 y Q1 para recomendar;
- C5 usa C4 para proponer acciones manuales;
- ninguna capa debe crear una verdad paralela.

## 5. Restricciones

- no abrir C6 sin revisar esta baseline;
- no introducir nuevas fuentes de datos;
- no fusionar dominios por conveniencia de implementacion;
- no modificar el core para resolver solapamientos de dominio.

## 6. Criterio de uso

Esta baseline debe consultarse antes de abrir nuevas capacidades comerciales u operativas. Si una propuesta no puede ubicarse claramente en uno de los dominios definidos, debe revisarse antes de implementarse.

## 7. Relacion con G1

`GOAL-G1-001` y sus matrices asociadas sirven como checkpoint transversal. `RC2` formaliza la arquitectura estable que resulta de ese checkpoint.

## 8. Historial

- 2026-07-25: Se crea la baseline arquitectonica RC2 como referencia estable del ecosistema.

