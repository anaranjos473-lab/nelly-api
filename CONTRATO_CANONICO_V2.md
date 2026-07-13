# Nelly Delivery - Contrato Canónico V2

Estado: **BORRADOR PARA APROBACIÓN**

Fase: C5.1

Fecha: 2026-07-13

Este documento será vinculante para Admin, Cocina, Backend, Driver Android, Web Driver, Cloud Functions, scripts y futuros productores únicamente cuando la matriz de aprobación de C5.1 quede completa. Mientras siga en borrador no autoriza cambios funcionales ni migraciones.

## Principio de Contrato Único

Todo pedido que ingrese al ecosistema Nelly Delivery debe cumplir exactamente el mismo contrato canónico, sin importar quién lo produzca.

Corolarios:

1. Ningún productor define su propio formato.
2. Ningún consumidor depende de campos exclusivos de un productor.
3. `pedidos/{id}` es la única fuente de verdad del pedido.
4. Los índices derivados no aceptan escrituras funcionales independientes.
5. Todo campo persistido tiene nombre, tipo, semántica y etapa de obligatoriedad definidos.
6. Los alias heredados se aceptan solo en adaptadores de migración; nunca se vuelven a persistir como V2.

## Convenciones

- Nombres canónicos en `snake_case`.
- Fechas como milisegundos UTC Unix generados o confirmados por servidor.
- Importes como enteros en centavos para evitar errores de punto flotante.
- Moneda explícita, inicialmente `MXN`.
- Coordenadas WGS84: latitud `[-90, 90]`, longitud `[-180, 180]`; el par `(0,0)` no es operativo.
- Cadenas obligatorias: recortadas y no vacías.
- Los campos desconocidos se rechazan. Extensiones futuras deben ir versionadas o en un espacio de nombres aprobado.
- El `id` del documento debe coincidir con la llave `{id}` de RTDB.

## Estructura canónica

```json
{
  "id": "pedido_...",
  "short_id": "NLY-123456",
  "origen": "PANEL_ADMIN",
  "version_contrato": 2,
  "fecha_creacion": 1783970000000,
  "cliente": {
    "nombre": "Nombre",
    "telefono": "9610000000",
    "direccion": "Dirección legible",
    "referencias": "Indicaciones adicionales",
    "ubicacion": { "lat": 16.75, "lng": -93.11 }
  },
  "tienda": {
    "id": "tienda_...",
    "nombre": "Restaurante",
    "direccion": "Dirección legible",
    "ubicacion": { "lat": 16.76, "lng": -93.12 }
  },
  "items": [
    {
      "nombre": "Producto",
      "cantidad": 1,
      "precio_unitario_centavos": 12900,
      "extras": []
    }
  ],
  "pago": {
    "moneda": "MXN",
    "subtotal_centavos": 12900,
    "envio_centavos": 2000,
    "propina_centavos": 0,
    "total_centavos": 14900,
    "metodo": "EFECTIVO",
    "estado": "PENDIENTE"
  },
  "estado": "PENDIENTE",
  "logistica": {
    "fase_operativa": null,
    "repartidor_uid": null,
    "asignacion_activa": false
  },
  "evidencia": {
    "tipo": null,
    "url": null,
    "fallback": false,
    "mime": null,
    "timestamp": null
  },
  "eventos": {}
}
```

## Diccionario de campos

### Identidad

| Campo | Tipo | Regla |
|---|---|---|
| `id` | string | Obligatorio, único, inmutable e igual a la llave RTDB |
| `short_id` | string | Obligatorio, único para operación humana e inmutable |
| `origen` | enum | Obligatorio; productor registrado, no texto libre |
| `version_contrato` | integer | Obligatorio; valor exacto `2` |
| `fecha_creacion` | integer | Obligatorio, asignado por servidor e inmutable |

Valores iniciales propuestos para `origen`: `PANEL_ADMIN`, `API_ORDENES`, `INTEGRACION_RESTAURANTE`, `SCRIPT_CERTIFICACION`. Incorporar otro origen exige registrarlo en el contrato.

### Cliente y tienda

| Campo | Tipo | Regla al crear |
|---|---|---|
| `cliente.nombre` | string | Obligatorio |
| `cliente.telefono` | string | Obligatorio; normalizado sin perder prefijo internacional |
| `cliente.direccion` | string | Obligatorio |
| `cliente.referencias` | string | Obligatorio; puede ser `"SIN_REFERENCIAS"`, nunca ausente |
| `cliente.ubicacion.lat/lng` | number | Ambos obligatorios y operativos |
| `tienda.id` | string | Obligatorio e inmutable |
| `tienda.nombre` | string | Obligatorio |
| `tienda.direccion` | string | Obligatorio |
| `tienda.ubicacion.lat/lng` | number | Ambos obligatorios y operativos |

Una dirección textual no reemplaza coordenadas. Si la geocodificación no produce un par verificable, la creación queda rechazada o en una bandeja externa de corrección; no nace un pedido canónico incompleto.

### Items y pago

| Campo | Tipo | Regla |
|---|---|---|
| `items` | array | Obligatorio, al menos un elemento |
| `items[].nombre` | string | Obligatorio |
| `items[].cantidad` | integer | Obligatorio, mayor o igual a 1 |
| `items[].precio_unitario_centavos` | integer | Obligatorio, mayor o igual a 0 |
| `items[].extras` | array | Obligatorio; puede estar vacío |
| `pago.moneda` | enum | Obligatorio; inicialmente `MXN` |
| `pago.subtotal_centavos` | integer | Obligatorio, no negativo |
| `pago.envio_centavos` | integer | Obligatorio, no negativo |
| `pago.propina_centavos` | integer | Obligatorio, no negativo |
| `pago.total_centavos` | integer | Obligatorio y consistente con la suma aprobada |
| `pago.metodo` | enum | `EFECTIVO`, `TARJETA`, `TRANSFERENCIA`, `OTRO` |
| `pago.estado` | enum | `PENDIENTE`, `PAGADO`, `REEMBOLSADO`, `FALLIDO` |

La fórmula inicial es `subtotal + envio + propina = total`. Descuentos, impuestos u otros conceptos requieren una ampliación versionada antes de utilizarse.

### Logística y evidencia

| Campo | Al crear | Regla posterior |
|---|---|---|
| `estado` | `PENDIENTE` | Solo valores y transiciones de `MAQUINA_ESTADOS_V2.md` |
| `logistica.fase_operativa` | `null` | Solo fases de `FASES_OPERATIVAS_V2.md` |
| `logistica.repartidor_uid` | `null` | UID único cuando se asigna; no se duplican alias |
| `logistica.asignacion_activa` | `false` | `true` únicamente mientras la asignación sea vigente |
| `evidencia.tipo` | `null` | Enum aprobado; inicialmente `FOTO_ENTREGA` |
| `evidencia.url` | `null` | URL o data URL de fallback conforme a la política vigente |
| `evidencia.fallback` | `false` | `true` solo cuando se usó contingencia |
| `evidencia.mime` | `null` | MIME real validado al capturar |
| `evidencia.timestamp` | `null` | Timestamp de servidor al persistir |
| `eventos` | `{}` | Historial append-only conforme a `EVENTOS_V2.md` |

No se inventa evidencia ni repartidor durante la creación. Su ausencia tiene una representación única y explícita.

## Obligatoriedad por transición

| Momento | Precondiciones adicionales |
|---|---|
| Crear | Contrato completo, dos ubicaciones válidas, items y pago consistentes |
| Entrar a Cocina | Pedido V2 válido y evento de aceptación de Cocina |
| Marcar LISTO | Items confirmados; tienda válida; evento `PEDIDO_LISTO` |
| Aceptar repartidor | UID autenticado y estado `LISTO`; la operación asigna `repartidor_uid`, activa la asignación y pasa a `EN_CURSO` atómicamente |
| Llegar a tienda | GPS válido, geocerca aprobada y evento `LLEGADA_TIENDA` |
| Pedido a bordo | Llegada a tienda previa y evento `PEDIDO_ABORDO` |
| Llegar al cliente | GPS válido, geocerca aprobada y evento `LLEGADA_CLIENTE` |
| Entregar | Llegada al cliente, evidencia válida, cierre financiero permitido y evento `PEDIDO_ENTREGADO` |
| Cancelar | Estado cancelable, actor autorizado, motivo y evento `PEDIDO_CANCELADO` |

## Política formal de alias heredados

Los alias son entradas temporales del adaptador V1; no son campos V2.

| Campo V2 | Alias heredados reconocidos temporalmente |
|---|---|
| `id` | `id_pedido`, `pedido_id` |
| `short_id` | `shortId` |
| `version_contrato` | `versionContrato` |
| `fecha_creacion` | `createdAt`, `fecha_creacion`, `timestamp`, `timestampCreacion` |
| `cliente.nombre` | `cliente`, `cliente_nombre`, `nombre_cliente` |
| `cliente.telefono` | `telefono`, `cliente_telefono` |
| `cliente.direccion` | `direccion`, `cliente_direccion` |
| `cliente.referencias` | `referencias`, `cliente_referencias` |
| `cliente.ubicacion` | `lat/lng`, `latCliente/lngCliente`, `cliente_lat/cliente_lng`, `lat_cliente/lng_cliente`, `cliente.coords` |
| `tienda.nombre` | `tienda_nombre`, `restaurante_nombre`, `tienda` |
| `tienda.direccion` | `tienda_direccion`, `restaurante_direccion` |
| `tienda.ubicacion` | `latTienda/lngTienda`, `tienda_lat/tienda_lng`, `lat_tienda/lng_tienda`, `tienda.coords` |
| `pago.total_centavos` | `total`, `monto`, `monto_total` con conversión explícita de pesos a centavos |
| `estado` | `estado_pedido`, `logistica.estado` |
| `logistica.fase_operativa` | `fase_panel` solo mediante tabla explícita, nunca copia literal |
| `logistica.repartidor_uid` | `repartidor_id`, `repartidorId`, `conductorId`, `driverUid`, `uid_repartidor`, `idConductor` |
| `evidencia.url` | `evidencia_url`, `fotoEvidencia` |
| `evidencia.tipo` | `evidencia_tipo` |
| `evidencia.fallback` | `evidencia_fallback`, `evidenciaFallback` |

Reglas de migración:

1. El adaptador puede leer alias y producir un objeto V2 en memoria.
2. Si dos alias discrepan, el pedido se rechaza o se envía a revisión; no se elige silenciosamente.
3. Estados históricos ambiguos como `EN_CAMINO` o `EN_REPARTO` no se convierten sin contexto suficiente para determinar estado y fase.
4. Toda escritura nueva persiste únicamente V2.
5. Durante la ventana de compatibilidad se registran productor, alias usado y resultado.
6. Los alias se eliminan solo tras migrar todos los productores, comprobar cero uso durante el periodo acordado y obtener aprobación explícita.

## Fuente de verdad e índices derivados

`pedidos/{id}` contiene el pedido canónico completo. Son proyecciones reconstruibles, nunca fuentes de verdad:

- `pedidos_para_reparto/{id}`;
- `pedidos_en_camino/{id}`;
- `pedidos_activos/{id}` o cualquier índice futuro.

Reglas:

1. Solo el proyector autorizado escribe índices.
2. Un índice contiene como máximo identidad y datos mínimos de consulta; el consumidor vuelve a leer `pedidos/{id}` antes de actuar.
3. Una entrada huérfana o divergente se descarta frente al canónico.
4. Borrar y reconstruir un índice no cambia el pedido.
5. Toda proyección debe poder regenerarse determinísticamente desde `estado`, `logistica` y el historial canónico.
6. Ninguna transición se confirma porque un índice cambió; primero cambia el canónico de manera validada y luego se proyecta.

## Ejemplos inválidos

- Pedido con dirección textual pero sin alguno de los dos pares de coordenadas.
- Pedido con `estado="Pendiente"` o cualquier estado libre.
- Pedido con `conductorId` persistido en V2.
- Pedido `ENTREGADO` sin llegada al cliente ni evidencia válida.
- Pedido cuyo `id` difiere de la llave RTDB.
- Pedido con importes en pesos mezclados con centavos.
- Escritura directa en `pedidos_para_reparto` sin pedido canónico.

## Condición de aprobación

Este contrato pasa a APROBADO cuando se acepten expresamente su estructura, nombres, tipos, política monetaria, obligatoriedad por etapa, alias y reglas de proyección. La aprobación documental no despliega el contrato: solamente habilita el diseño de C5.2.
