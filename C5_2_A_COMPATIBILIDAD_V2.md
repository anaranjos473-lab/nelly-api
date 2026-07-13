# C5.2-A - Auditoría de compatibilidad V2

Estado: **AUDITORÍA ESTÁTICA COMPLETA; COMPATIBILIDAD EN FAIL**

Fecha: 2026-07-13

## Alcance

C5.2-A revisa consumidores uno por uno sin modificar código, Firebase ni datos. Responde tres preguntas:

1. ¿Puede completar su responsabilidad usando solamente el Contrato Canónico V2?
2. ¿Tolera y preserva campos nuevos sin fallar ni sobrescribir estructuras V2?
3. ¿Necesita adaptación antes de aceptar tráfico V2?

Un consumidor no obtiene PASS por ignorar propiedades desconocidas. Debe interpretar correctamente rutas, unidades, estados, fases y eventos que necesita para operar.

## Resultado ejecutivo

| Consumidor | ¿Lee V2 completo para su función? | ¿Ignora/preserva campos nuevos? | ¿Necesita adaptación? | Estado |
|---|---|---|---|---|
| Driver Android | No | Parcial | Sí, crítica | 🔴 FAIL |
| Panel Cocina | No | Parcial | Sí, crítica | 🔴 FAIL |
| Admin Dashboard/métricas | Parcial | Sí en lectura | Sí | 🔴 FAIL |
| Backend Delivery | No | Parcial | Sí, crítica | 🔴 FAIL |
| Backend Tracking | No | Sí en actualizaciones parciales | Sí, crítica | 🔴 FAIL |
| Cloud Functions | No | Sí en actualización parcial | Sí | 🔴 FAIL |
| Repartidor Web | No | Sí en lectura | Sí | 🔴 FAIL |
| Agentes backend | No | Parcial | Sí, crítica | 🔴 FAIL |
| Scripts, auditorías y reportes | No de forma uniforme | Variable | Sí | 🔴 FAIL |

Compatibilidad integral comprobada: **0 de 9 grupos**. No se habilita ningún productor V2 en producción.

## Evidencia por consumidor

### 1. Driver Android

Lee correctamente algunos elementos V2:

- llave RTDB como `id`;
- `estado` superior;
- `cliente.nombre`.

Brechas:

- busca ubicación en `cliente/coords` y `tienda/coords`, no en `cliente/ubicacion` y `tienda/ubicacion`;
- busca direcciones/nombres de tienda en campos planos;
- busca importe en `monto`, `total` o `monto_total`, no en `pago.total_centavos`;
- busca asignación en `idConductor`/`conductorId`, no en `logistica.repartidor_uid`;
- no usa `logistica.fase_operativa` para el flujo;
- escribe `LLEGUE_A_TIENDA`, `PEDIDO_ABORDO` y `LLEGUE_A_CLIENTE` como `estado`, `estado_pedido` y `logistica.estado`;
- finaliza escribiendo evidencia y estados planos, sin evento/historial V2.

Tolerancia: el mapeador manual evita que muchos campos desconocidos detengan la lectura y las actualizaciones parciales preservan otros nodos. Sin embargo, una estructura anidada donde antes se esperaba string puede forzar el fallback del mapper y generar pérdida semántica. Requiere adaptador V2 y comandos de eventos antes de cualquier pedido V2 real.

### 2. Panel Cocina

Lee `estado` superior y conserva objetos con spread en varias rutas, pero:

- presenta `cliente` como si fuera string y no usa consistentemente `cliente.nombre`;
- calcula importes desde `monto`/`total`, no desde centavos;
- no lee `cliente.ubicacion` ni `tienda.ubicacion`;
- normaliza `COCINA` como `PENDIENTE`, perdiendo la separación oficial;
- deriva fase de panel desde estado comercial;
- al despachar reconstruye `logistica` con `estado` y `repartidor_id`, pudiendo sustituir la forma V2;
- publica aliases y estados V1.

Tolerancia: parcial. El spread preserva muchos campos, pero la reconstrucción de objetos anidados puede sobrescribir información canónica.

### 3. Admin Dashboard y métricas

El frontend de métricas consume agregados y tolera propiedades adicionales. El backend de métricas puede leer:

- `estado` superior;
- `fecha_creacion`;
- algunos timestamps/aliases históricos.

Brechas:

- tiempos de asignación y entrega se buscan en campos planos, no en `historial`;
- alertas de fraude se buscan en campos planos no definidos todavía en V2;
- importes y rentabilidad no están adaptados uniformemente a centavos;
- creación Admin sigue siendo productora V1, asunto de una ola posterior.

Resultado: lectura parcial útil, insuficiente para métricas V2 completas.

### 4. Backend Delivery

Lee `estado` superior, pero opera con contrato V1:

- total desde `monto_total`, `monto`, `total` o `total_pedido` en pesos;
- repartidor desde aliases planos;
- lista de estados históricos que mezcla eventos con estado;
- dispatch agrega `estado_pedido`, `fase_panel` y `logistica.estado`;
- accept escribe aliases de conductor y no crea historial;
- complete no exige fase `EN_CLIENTE`, geocerca, evidencia ni evento;
- índices reciben copias completas con forma propia.

El uso de spread preserva parte del objeto V2, pero las escrituras posteriores lo vuelven semánticamente inválido.

### 5. Backend Tracking

`update-location` puede añadir ubicación del repartidor sin reemplazar todo el pedido, pero:

- acepta estado/subestado desde el cliente;
- persiste eventos geográficos como estados;
- escribe `logistica.estado` y `fase_panel`;
- no valida `logistica.repartidor_uid`, fase V2, geocerca ni historial idempotente.

Preserva campos desconocidos al actualizar rutas específicas, pero no es compatible con la máquina V2.

### 6. Cloud Functions

La función antifraude actual:

- detecta `estado=entregado`;
- exige `conductorId`;
- busca `latCliente/lngCliente` o `latTienda/lngTienda`;
- escribe alertas planas.

No reconoce `logistica.repartidor_uid`, ubicaciones anidadas, evidencia/historial ni la semántica de finalización V2. Su actualización parcial preserva campos desconocidos, pero su lógica no puede auditar correctamente un pedido V2.

### 7. Repartidor Web

Reconoce `estado` superior, pero:

- busca asignación en aliases planos o `logistica.repartidor_id`;
- muestra cliente desde campos planos;
- calcula monto en pesos desde campos planos;
- no usa ubicación, fase, evidencia ni historial V2.

JavaScript ignora campos adicionales sin fallar, pero la pantalla perdería datos esenciales y no detectaría correctamente pedidos asignados V2.

### 8. Agentes backend

Brechas principales:

- despacho escucha `estado=pendiente`, requiere `latTienda/lngTienda` y escribe `conductorId`/`en_curso`;
- antifraude usa conductor y coordenadas planas;
- soporte espera `timestampCreacion`, estados `PERCANCE/pendiente` y `conductorId`;
- tarifa dinámica reconoce solo variantes de `PENDIENTE`.

No existe una capa compartida V2; cada agente interpreta su propio subconjunto.

### 9. Scripts, auditorías y reportes

Los fixtures y herramientas revisados usan formas distintas. Algunos crean pedidos mínimos, otros copian aliases o escriben índices directamente. Las pruebas actuales de Admin y Delivery validan deliberadamente formas V1 y hasta esperan eventos geográficos persistidos como estados.

Antes de usarlos en C5.2 deben clasificarse como:

- migrados al constructor V2;
- lector histórico V1/V2;
- archivados y no ejecutables en operación.

## Matriz de campos críticos

| Consumidor | `contract_version` | `producer` | ubicaciones V2 | centavos | `repartidor_uid` | fase V2 | historial |
|---|---:|---:|---:|---:|---:|---:|---:|
| Android | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Cocina | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Admin/métricas | ❌ | ❌ | N/A | ⚠️ | N/A | N/A | ❌ |
| Delivery | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Tracking | ❌ | ❌ | N/A | N/A | ❌ | ❌ | ❌ |
| Cloud Functions | ❌ | ❌ | ❌ | N/A | ❌ | N/A | ❌ |
| Web Driver | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Agentes | ❌ | ❌ | ❌ | N/A | ❌ | ❌ | ❌ |
| Scripts/reportes | Variable | Variable | Variable | ❌ | Variable | ❌ | ❌ |

`N/A` significa que el consumidor no necesita ese campo para su responsabilidad actual; no es un PASS global.

## Conclusión y puerta siguiente

C5.2-A cumplió su objetivo al identificar brechas sin introducir cambios. La arquitectura documental está aprobada, pero la compatibilidad ejecutable sigue en rojo.

El orden seguro queda:

1. **C5.2-A:** auditoría estática de compatibilidad - completa.
2. **C5.2-B:** contrato ejecutable y validador en sombra; aún sin productores V2 en producción.
3. **C5.2-C:** adaptadores y pruebas de consumidores V1/V2.
4. **C5.2-D:** migración gradual de productores V2.
5. **C5.2-E:** consumidores V2 como camino principal y retiro posterior de compatibilidad.

Aunque el validador puede construirse antes, ningún productor V2 se habilita hasta que los consumidores críticos demuestren compatibilidad mediante pruebas. C5.2-B no queda autorizado por este documento; requiere una decisión separada.
