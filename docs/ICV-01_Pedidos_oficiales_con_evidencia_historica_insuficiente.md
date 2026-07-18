# ICV-01 - Pedidos oficiales con evidencia historica insuficiente

## 1. Identificacion

- **ID:** `ICV-01`
- **Fecha de apertura:** `2026-07-18`
- **Estado:** `Cerrado por limite de evidencia`
- **Flujo afectado:** `FINALIZAR ENTREGA / cierre de pedidos operativos`
- **Responsable:** `Backend / Persistencia RTDB`

## 2. Contexto

- **Descripcion del incidente:** cinco pedidos oficiales de la cohorte B2 permanecen en `EN_CURSO` sin referencias auxiliares activas ni evidencia primaria de cierre disponible en el repositorio.
- **Alcance funcional:** cierre de pedidos, actualizacion de estados operativos, limpieza de indices auxiliares y coherencia entre `pedidos`, `pedidos_en_camino`, `pedidos_para_reparto` y `repartidores/<uid>/pedido_activo`.
- **Impacto observado:** inconsistencia persistente en la fuente de datos que puede ser reflejada por listeners o vistas como un pedido operativo aun vigente.

## 3. Evidencia

### 3.1 Evidencia primaria

- No localizada en el entorno de trabajo.
- Pendiente unicamente de logs historicos externos, Cloud Logging, respaldos de RTDB u otras bitacoras operativas.

### 3.2 Evidencia secundaria

- [C5_2_B_2_VENTANA_OBSERVACION.md](/C:/Users/hp14/OneDrive/Desktop/nelly/C5_2_B_2_VENTANA_OBSERVACION.md)
- [docs/CICP_Certificacion_Integridad_y_Consistencia_de_Persistencia.md](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/CICP_Certificacion_Integridad_y_Consistencia_de_Persistencia.md)
- [docs/Plantilla_Caso_ICV_Investigacion_de_Ciclo_de_Vida.md](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/Plantilla_Caso_ICV_Investigacion_de_Ciclo_de_Vida.md)

### 3.3 Evidencia circunstancial

- Estado actual de RTDB.
- Consistencia parcial de referencias auxiliares.
- Ausencia de `pedido_activo`, `pedidos_en_camino`, `pedidos_para_reparto`, `finalizado_at` y `entregado_en` para los cinco pedidos.

## 4. Reconstruccion Del Ciclo De Vida

| Etapa | Evidencia | Estado | Nota |
| --- | --- | --- | --- |
| Creacion | Cohortes 12 a 15 documentadas en B2 | `✅` | Creacion oficial confirmada. |
| Asignacion | `conductorId` / `repartidor_id` presentes en RTDB y en la ventana de observacion | `✅` | Asignacion operativa confirmada. |
| Inicio | Estado `EN_CURSO` en los cinco pedidos | `✅` | Inicio de reparto confirmado. |
| Llegada | No hay evidencia primaria suficiente en el workspace | `❌` | No se pudo reconstruir con certeza. |
| Cierre | No hay `finalizado_at`, `entregado_en` ni traza primaria de `complete-order` | `❌` | Cierre no demostrado. |

## 5. Clasificacion CICP

- **Regla aplicada:** `CICP-R6`
- **Justificacion:** los pedidos son oficiales y conservan estado operativo, pero carecen de evidencia suficiente para completar su ciclo de vida dentro del repositorio.
- **Nivel de confianza:** `Alta` para la insuficiencia de evidencia; `Media` para la inferencia sobre una interrupcion o falta de persistencia en el flujo.

## 6. Decision

- No archivar.
- No reutilizar.
- No modificar estados manualmente.
- Mantener en cuarentena logica hasta disponer de evidencia primaria o emitir una decision administrativa documentada.

## 7. Estado Del Conocimiento

### 7.1 Hechos Demostrados

- Los cinco pedidos existieron como cohortes oficiales de B2.
- Alcanzaron el estado `EN_CURSO`.
- Hoy carecen de `pedido_activo`, `pedidos_en_camino`, `pedidos_para_reparto`, `finalizado_at` y `entregado_en`.
- La evidencia primaria de cierre no esta disponible en el workspace.

### 7.2 Inferencias

- Hubo una interrupcion, omision o falta de persistencia en algun tramo del ciclo de vida.
- La causa exacta podria requerir logs historicos externos para ser reconstruida.

### 7.3 Preguntas Abiertas

- ¿En que transicion exacta se rompio el flujo?
- ¿El cierre ocurrio y solo se perdio la trazabilidad?
- ¿El cierre nunca se ejecuto?
- ¿Existe evidencia primaria fuera del repositorio local?

## 8. Lecciones Aprendidas

- La ausencia de evidencia no constituye evidencia de ausencia.
- La CICP evita limpiar o reinterpretar datos sin antes certificar la fuente.
- El estado del conocimiento debe separarse de forma explicita entre hechos, inferencias y preguntas abiertas.
- `CICP-R7` permite documentar el limite historico sin forzar una conclusion falsa.

## 9. Cierre

**Motivo:** cerrado por limite de evidencia.

**Nota:** este caso no resuelve el origen historico del estado. Documenta con honestidad que la evidencia disponible ya no permite reconstruir el ciclo de vida con certeza.

## Referencia Al Marco

- `CICP` certifica el estado del ecosistema.
- `ICV` reconstruye el ciclo de vida cuando hay una anomalia.
- `ADR` documenta decisiones arquitectonicas.
- `CERTIFICACION_Pxx` valida una correccion implementada.

