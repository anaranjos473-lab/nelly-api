# Indice Maestro de Casos ICV

Este indice centraliza las investigaciones de ciclo de vida de Nelly OS.

Cada ICV representa una investigacion, no un pedido individual. Si varios pedidos comparten la misma causa potencial, permanecen en un mismo caso.

## Resumen General

- **Total de casos ICV:** 1
- **Casos abiertos:** 0
- **Casos cerrados:** 1
- **Cerrados por resolucion:** 0
- **Cerrados por limite de evidencia:** 1
- **Pendientes de evidencia externa:** 1

## Tabla de Casos

| ID | Titulo | Estado | Clasificacion | Flujo | Evidencia primaria | Resultado |
| --- | --- | --- | --- | --- | --- | --- |
| `ICV-01` | Pedidos oficiales con evidencia historica insuficiente | Cerrado por limite de evidencia | `CICP-R6 / CICP-R7` | `FINALIZAR ENTREGA / cierre de pedidos operativos` | No disponible en el workspace | Normalizacion pendiente de decision operativa |

## Trazabilidad Cruzada

### ICV-01

- **Documento:** [ICV-01 - Pedidos oficiales con evidencia historica insuficiente](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/ICV-01_Pedidos_oficiales_con_evidencia_historica_insuficiente.md)
- **CICP relacionada:** [CICP - Certificacion de Integridad y Consistencia de Persistencia](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/CICP_Certificacion_Integridad_y_Consistencia_de_Persistencia.md)
- **Plantilla usada:** [Plantilla de Caso ICV - Investigacion de Ciclo de Vida](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/Plantilla_Caso_ICV_Investigacion_de_Ciclo_de_Vida.md)

### Referencias Relacionadas

- **ADR:** decisiones arquitectonicas asociadas, cuando aplique.
- **CICP:** certificacion donde se detecto el caso.
- **CERTIFICACION_Pxx:** correcciones implementadas como consecuencia.
- **Commits:** cambios de codigo derivados, cuando existan.
- **Incidencias relacionadas:** otros ICV vinculados.

## Regla De Numeracion

- Un ICV debe representar una investigacion.
- No se crea un nuevo ICV por cada pedido si la causa potencial es la misma.
- Solo se abre un ICV nuevo cuando aparece una anomalia distinta o una hipotesis independiente.

## Criterio De Mantenimiento

Actualizar este indice cuando:

- se abra un nuevo caso ICV
- cambie el estado de un caso existente
- se agregue una referencia cruzada relevante
- se emita una decision administrativa posterior

## Clasificacion Del Conocimiento

Cada caso ICV debe separar explicitamente:

- **Hechos demostrados**
- **Inferencias**
- **Preguntas abiertas**

Esto evita que una hipotesis termine leida como si fuera un hecho.

