# CICP - Certificacion de Integridad y Consistencia de Persistencia

## Proposito

La CICP certifica que, al finalizar una operacion critica de Nelly OS, el ecosistema alcanza un estado consistente, verificable y libre de referencias operativas invalidas.

Este procedimiento aplica a flujos como:

- `FINALIZAR ENTREGA`
- cancelaciones operativas
- cierres de turno
- confirmaciones de pago
- cualquier transicion que deba dejar el sistema en estado terminal

## Principio Rector

### Fuente Antes del Reflejo

Cuando un comportamiento pueda originarse tanto en la fuente de datos como en el cliente, la fuente debera certificarse antes de modificar el cliente.

## Alcance

La CICP debe revisar, como minimo, estas fuentes de verdad:

- `pedidos`
- `pedidos_en_camino`
- `pedidos_para_reparto`
- `pedidos_activos`
- `repartidores/<uid>/pedido_activo`
- cualquier indice auxiliar consultado por listeners o vistas

## Fase A - Integridad

Objetivo: responder si existe algo que ya no deberia existir.

Buscar especificamente:

- pedidos residuales
- referencias huérfanas
- estados contradictorios
- indices desincronizados

Verificaciones tipicas:

- `pedidos/<id>` debe reflejar el estado final correcto
- `pedidos_en_camino/<id>` no debe permanecer para un pedido cerrado
- `pedidos_para_reparto/<id>` no debe permanecer para un pedido cerrado
- `pedidos_activos/<id>` no debe permanecer para un pedido cerrado
- `repartidores/<uid>/pedido_activo` debe quedar en `null`

## Fase B - Consistencia

Objetivo: responder si existe todo lo que si deberia existir.

Verificar:

- pedido principal en `ENTREGADO`
- conductor en `DISPONIBLE`
- `pedido_activo = null`
- referencias auxiliares eliminadas
- finanzas actualizadas cuando aplique
- evidencia registrada cuando aplique
- listeners sin pedidos operativos para ese conductor

## Formato Del Informe

| Coleccion | Esperado | Encontrado | Estado | Responsable | Accion requerida |
| --- | --- | --- | --- | --- | --- |
| `pedidos` | Pedido finalizado en `ENTREGADO` |  |  | Backend |  |
| `pedidos_en_camino` | Sin referencia operativa del pedido cerrado |  |  | Backend |  |
| `pedidos_para_reparto` | Sin referencia operativa del pedido cerrado |  |  | Backend |  |
| `pedidos_activos` | Sin referencia operativa del pedido cerrado |  |  | Backend |  |
| `repartidores/<uid>` | `pedido_activo = null`, `estado = DISPONIBLE` |  |  | Backend |  |

## Preguntas Obligatorias Por Anomalia

Para cada residuo o inconsistencia encontrada, el informe debe responder:

1. ¿Quien la creo?
2. ¿Quien debia eliminarla?
3. ¿Por que permanecio?
4. ¿Puede volver a ocurrir?
5. ¿Que cambio permanente evitara que vuelva a ocurrir?

## Criterio De Aprobacion

La CICP solo se considera aprobada cuando:

- todas las verificaciones de integridad son satisfactorias
- todas las verificaciones de consistencia son satisfactorias
- no fue necesario ocultar inconsistencias mediante filtros en el cliente
- existe evidencia suficiente para reproducir y validar el resultado

Solo despues de aprobar la CICP se autoriza cualquier cambio adicional en Android o se declara la incidencia como cerrada.

## Responsable Por Capa

- `Backend`: escritura y limpieza de nodos operativos
- `Cliente Android`: consumo y presentacion de estado
- `Persistencia RTDB`: fuente de verdad operativa
- `Scripts de mantenimiento`: auditoria y limpieza controlada de residuos historicos

## Regla Operativa Complementaria

La CICP debe usarse como criterio previo a cualquier cambio en el cliente cuando exista una duda razonable sobre la fuente de datos.

Esto evita el error comun de ocultar un problema de persistencia con un filtro de interfaz.

## Regla R7 - Evidencia Histórica Insuficiente

### Definicion

Un pedido oficial cuya secuencia de vida no puede reconstruirse porque la evidencia primaria historica ya no esta disponible debe clasificarse como `CICP-R7`.

### Alcance

Esta regla aplica cuando:

- el pedido fue oficial y pertenece a una cohorte valida
- existe estado operativo en la fuente actual
- no hay evidencia primaria suficiente para demostrar entrega, cancelacion o cierre
- la investigacion agoto los niveles secundarios y circunstanciales sin resolver la causa raiz

### Efecto

Un elemento clasificado como `CICP-R7`:

- no se asume como entregado
- no se asume como residuo de prueba
- no se archiva de forma destructiva sin decision operativa posterior
- queda documentado como registro historico con evidencia insuficiente

### Uso Operativo

Cuando `CICP-R7` aplique, la decision posterior debe ser administrativa y trazable:

- normalizacion documental
- conservacion historica
- auditoria externa si aparece evidencia adicional

### Nota Metodologica

`CICP-R7` no resuelve el ciclo de vida. Solo reconoce que la evidencia historica disponible ya no permite reconstruirlo con certeza.

## ICV-01 - Pedidos oficiales con evidencia historica insuficiente

### Estado

Abierto. La investigacion quedo concluida hasta el limite de la evidencia disponible en el repositorio y en los artefactos locales inspeccionados.

### Contexto

Durante la ejecucion de la CICP se identificaron cinco pedidos pertenecientes a la cohorte oficial B2 con este comportamiento comun:

- creacion oficial confirmada
- estado `EN_CURSO`
- sin `pedido_activo`
- sin `pedidos_en_camino`
- sin `pedidos_para_reparto`
- sin `finalizado_at`
- sin `entregado_en`
- sin evidencia primaria de cierre disponible en el repositorio

### Evidencia Disponible

#### Primaria

- no localizada en el entorno de trabajo
- pendiente unicamente de logs historicos externos, Cloud Logging, respaldos de RTDB u otras bitacoras operativas

#### Secundaria

- documentacion de B2
- ventana de observacion
- certificaciones existentes

#### Circunstancial

- estado actual de RTDB
- consistencia parcial de referencias auxiliares

### Clasificacion

- `CICP-R6` - estado indeterminado durante la investigacion
- `CICP-R7` - evidencia historica insuficiente

### Decision

- no archivar
- no reutilizar
- no modificar estados manualmente
- mantener en cuarentena logica hasta disponer de evidencia primaria o emitir una decision administrativa documentada

### Leccion Aprendida

La ausencia de evidencia no constituye evidencia de ausencia.

Por lo tanto:

- no puede asumirse que el pedido fue entregado
- no puede asumirse que el pedido es un residuo
- la decision debe basarse unicamente en evidencia verificable

### Resultado Para Nelly OS

Este caso valida tres principios del sistema:

- `Fuente Antes del Reflejo`
- la CICP precede a cualquier modificacion del cliente
- cuando la evidencia primaria no existe, la investigacion debe documentar ese limite en lugar de inventar una causa raiz

### Estado Del Conocimiento

#### Lo que sabemos

- los cinco pedidos existieron como cohortes oficiales de B2
- alcanzaron un estado operativo `EN_CURSO`
- hoy carecen de `pedido_activo`, `pedidos_en_camino`, `pedidos_para_reparto`, `finalizado_at` y `entregado_en`
- la evidencia primaria de cierre no esta disponible en el workspace

#### Lo que inferimos

- hubo una interrupcion, omision o falta de persistencia en algun tramo del ciclo de vida
- la causa exacta podria requerir logs historicos externos para ser reconstruida

#### Lo que desconocemos

- en que transicion exacta se rompio el flujo
- si el cierre ocurrio y solo se perdio la trazabilidad
- si el cierre nunca se ejecuto
- si existe evidencia primaria fuera del repositorio local

### Nota De Cierre

ICV-01 no resuelve el origen historico del estado. Documenta con honestidad el limite de la evidencia disponible y deja el caso preparado para una investigacion externa si aparece nueva informacion.

## Resultado Esperado

Al aprobar la CICP, el ecosistema debe quedar en un estado certificable y consistente, de modo que cualquier listener o vista refleje la misma realidad operativa.
