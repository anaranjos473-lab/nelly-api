# POST-NAE-001-K4: Desacoplamiento RTDB residual

## Estado

Certificado

## Proposito

Eliminar unicamente las dependencias residuales de RTDB que ya no son necesarias en Cocina, preservando el comportamiento certificado en K3.

## Alcance

- Revisar cada listener RTDB que permanezca activo en Cocina.
- Clasificar cada dependencia con evidencia.
- Mantener lo que siga siendo util y retirar lo demostrado como residual.
- No tocar el render certificado de K3.

## No alcance

- No modificar NAE.
- No modificar `DataAccessService`.
- No modificar el contrato de lectura.
- No introducir mejoras visuales.
- No hacer refactors masivos.
- No mezclar saneamiento de datos con este frente.

## Aplicacion del Manifiesto de las 4 Casillas

### Casilla 1 - Comprender

Antes de retirar cualquier listener:

- identificar su responsabilidad;
- confirmar si sigue siendo usado;
- verificar si tiene equivalente en el ecosistema actual;
- validar si esta fuera del alcance de Cocina.

### Casilla 2 - Evidencia

Cada dependencia debe quedar clasificada con evidencia de:

- llamadas;
- consumidores;
- flujo;
- impacto.

### Casilla 3 - No romper

K4 no debe modificar:

- NAE;
- `DataAccessService`;
- contrato;
- render certificado;
- flujo operativo.

### Casilla 4 - Cambio minimo

Cada commit debe retirar una sola dependencia o un grupo claramente relacionado.

## Inventario inicial

| Dependencia | Estado inicial | Accion propuesta |
|---|---|---|
| `ref(db, 'pedidos')` | Activa | Posponer |
| `ref(rtdb, '.info/connected')` | Activa | Mantener si sigue siendo util |
| `ref(rtdb, 'pedidos')` (legacy snapshot) | Eliminado en K3 | Certificado |
| `ref(rtdb, 'pedidos')` (filtrarVentas / historial) | Activa | Posponer |
| `ref(rtdb, 'metricas/ganancias_hoy')` | Activa | Revisar |
| `ref(rtdb, 'pedidos_completados')` | Activa | Revisar |
| `ref(rtdb, 'liquidaciones_auditoria')` | Activa | Revisar |
| `ref(rtdb, 'repartidores_activos')` | Activa | Revisar |

## Clasificacion esperada

Cada dependencia debe terminar en una sola categoria:

- Mantener.
- Migrar.
- Retirar.
- Posponer.

## Gate de salida

K4 se considera cerrado cuando:

- no existan listeners RTDB innecesarios en Cocina;
- cada listener restante tenga una justificacion documentada;
- el render certificado de K3 siga funcionando;
- no existan regresiones funcionales.

## K4.1 - Inventario residual

Antes de retirar cualquier listener, el objetivo de K4.1 es responder para cada dependencia RTDB:

- donde esta definida;
- quien la consume;
- que datos observa;
- si sigue siendo necesaria;
- si ya existe un equivalente mediante `DataAccessService`;
- que impacto tendria eliminarla.

### Matriz de clasificacion

| Listener RTDB | Archivo | Consumidor | Funcion | Equivalente | Clasificacion | Evidencia |
|---|---|---|---|---|---|---|
| `ref(db, 'pedidos')` | `public/panel.html` | `lista-pedidos` / cola heredada del primer bloque | Lista operativa legacy de pedidos entrantes | Parcial | Posponer | `public/panel.html:34-62` |
| `ref(rtdb, '.info/connected')` | `public/panel.html` | `conexion` / badge online | Estado de conexion RTDB para UI auxiliar | No critico para la cola | Mantener | `public/panel.html:2376` |
| `ref(rtdb, 'pedidos')` | `public/panel.html` | `sincronizarPedidosOperativosDesdeSnapshot` | Cola heredada eliminada del flujo principal en K3 | Sustituido por `DataAccessService` | Retirar | `public/panel.html:4173` y `public/panel.html:4187` |
| `ref(rtdb, 'pedidos')` | `public/panel.html` | `filtrarVentas` | Filtro de historial de ventas / cortes | Parcial | Posponer | `public/panel.html:3947-3959` |
| `ref(rtdb, 'metricas/ganancias_hoy')` | `public/panel.html` | KPI de ganancias | Indicador operativo auxiliar | Parcial | Mantener | `public/panel.html:5185` |
| `ref(rtdb, 'pedidos_completados')` | `public/panel.html` | `pedidosEntregados` | Historico visual de entregados | Parcial | Mantener | `public/panel.html:5186-5215` |
| `ref(rtdb, 'liquidaciones_auditoria')` | `public/panel.html` | Toasts de auditoria | Avisos operativos de liquidaciones | No directo | Posponer | `public/panel.html:5237` |
| `ref(rtdb, 'repartidores_activos')` | `public/js/mapa-logistica.js` | Mapa logistico | Marcadores de repartidores activos | No directo a Cocina | Posponer | `public/js/mapa-logistica.js:26-27` |

### Criterios de clasificacion

Cada dependencia debe terminar en una sola categoria:

- Mantener: sigue siendo necesaria y no existe un reemplazo equivalente.
- Migrar: debe pasar al nuevo modelo, pero aun no en K4.
- Retirar: no tiene consumidores o quedo sustituida.
- Posponer: pertenece a otro modulo o ciclo y no debe tocarse ahora.

### Gate de K4.1

No abrir la fase de eliminacion hasta cumplir estos criterios:

- todos los listeners RTDB identificados;
- todos con consumidor documentado;
- todos clasificados;
- impacto conocido para cada uno;
- sin dudas sobre dependencias ocultas.

### Riesgos a vigilar

- Dependencias indirectas. Un listener puede parecer sin uso, pero alimentar procesos secundarios como auditoria, metricas o monitoreo.
- `.info/connected`. Puede seguir teniendo utilidad para funciones auxiliares aunque la cola principal ya haya migrado.

### Resultado esperado

Al terminar K4.1 debe existir un inventario completamente trazable. A partir de ahi, K4.2 podra retirar unicamente las dependencias clasificadas como `Retirar`, con pruebas de no regresion despues de cada cambio.

## K4.2 - Eliminacion controlada

### K4.2.1 - Objetivo inicial

Trabajar unicamente sobre `ref(rtdb, 'pedidos')` ya sustituido por K3.

### K4.2.2 - Siguiente revision

Reevaluar `ref(db, 'pedidos')` para determinar si es una dependencia funcional o codigo heredado que nunca se elimino.

### Gate de K4.2

No retirar ningun listener adicional hasta que exista evidencia especifica de que puede hacerlo sin impactar:

- auditoria;
- metricas;
- monitoreo;
- navegacion secundaria;
- estabilidad del render certificado.

### K4.2.1 - Resultado parcial

Se retiro el listener heredado de la cola principal y la validacion visual siguio estable.

Queda identificado un uso adicional de `ref(rtdb, 'pedidos')` en `filtrarVentas`, asociado a historial/cortes de ventas. Ese uso no forma parte de la cola operativa certificada y se clasifica como `Posponer` hasta una revision especifica de K4.2.2.

### Cierre de K4

K4 queda certificado con el siguiente alcance:

- la cola operativa de Cocina ya no depende de `ref(rtdb, 'pedidos')`;
- `filtrarVentas` fue migrado a `historical_orders` desde `DataAccessService`;
- `ejecutarProtocoloRescate` ya no consulta RTDB para la cola operativa;
- la validacion posterior permanecio estable;
- `window.__nellyArchiveEngineMeta.error` se mantuvo en `null`.

### Listeners retirados

- `ref(rtdb, 'pedidos')` para la cola operativa.
- `ref(rtdb, 'pedidos')` para historial de ventas.

### Listeners mantenidos

| Listener | Justificacion |
|---|---|
| `.info/connected` | Estado de conectividad |
| `metricas/ganancias_hoy` | Metricas operativas |
| `pedidos_completados` | Flujo funcional vigente |
| `liquidaciones_auditoria` | Auditoria / fuera del alcance de este frente |
| `repartidores_activos` | Mapa logistico / otro modulo |

### Observaciones de calidad

- Revisar el registro `TES ` durante un ciclo de saneamiento.
- Posibles mejoras de presentacion para la vista historica de entregados.

## Historial

- 2026-07-30: se abre K4 como frente de desacoplamiento residual RTDB.
