# MANIFIESTO NELLY DELIVERY

## Fase C5 - Auditoría integral del contrato de datos

Fecha de apertura: 2026-07-13

Estado: auditoría documental terminada; contrato operativo aún no certificado.

## Misión

Garantizar que cualquier pedido generado en el ecosistema tenga la información y la semántica necesarias para recorrer Cocina, reparto, geonavegación, entrega y cierre sin depender de campos implícitos ni alias accidentales.

## Regla de oro

Esta fase comenzó en modo de solo lectura. Antes de modificar Admin, Cocina, backend, Android, RTDB o evidencias se documentó:

1. quién produce o modifica pedidos;
2. qué forma escribe cada productor;
3. quién consume cada dato;
4. qué incompatibilidades existen.

Este documento no cambia el contrato ni autoriza una migración. C4 queda pausada en su Casilla 1 hasta que C5 defina e implemente un productor con coordenadas válidas.

## Alcance y fuente de verdad

- Entrada activa del servidor: `server.js`, que importa `app.js`.
- Fuente canónica declarada: `pedidos/{id}` en Firebase Realtime Database.
- Índices derivados: `pedidos_para_reparto/{id}` y `pedidos_en_camino/{id}`.
- Estados canónicos documentados: `PENDIENTE`, `LISTO`, `EN_CURSO`, `ENTREGADO`, `CANCELADO`.
- Se revisaron rutas activas, paneles web, agentes, Cloud Functions, Android, scripts y pruebas.
- Se hizo una lectura agregada de 84 pedidos existentes. No se imprimieron identificadores, datos personales, coordenadas ni evidencias.

## Matriz C5

| Casilla | Auditoría | Cumplimiento del producto | Conclusión |
|---|---|---|---|
| 1. Productores de pedidos | COMPLETA | FAIL | Hay dos productores API activos incompatibles y varios productores directos de prueba |
| 2. Contrato único | COMPLETA | FAIL | Existe una intención de SSOT, pero no un esquema único validado en las fronteras |
| 3. Consumidores | COMPLETA | FAIL | Cada consumidor resuelve un subconjunto y una colección distinta de alias |
| 4. Cobertura | COMPLETA | FAIL | Ningún productor activo cubre por sí solo ubicación, operación, finanzas y ciclo de vida |

Completar la auditoría no pone las casillas en verde. C5 solo podrá certificarse después de acordar el esquema, aplicarlo en las fronteras y comprobarlo de extremo a extremo.

## Casilla 1 - Productores y modificadores

### Productores activos oficiales

| Productor | Escritura | Forma observada | Resultado |
|---|---|---|---|
| Panel Admin | `POST /api/admin/pedidos` | Identidad, cliente básico, items, importes, pago, estados, conductor nulo, fechas y `origen=panel_admin` | FAIL: no tienda, referencias ni coordenadas |
| API de órdenes | `POST /api/ordenes` | `userId`, `items`, `total`, `createdAt`, `estado=Pendiente` | FAIL: omite casi todo el contrato operativo y usa otra capitalización de estado |

El Admin no es el único productor oficial. La ruta `/api/ordenes` está montada por `app.js`, requiere autenticación y escribe en la misma colección lógica de órdenes mediante su controlador.

Además, `PUT /api/ordenes/:id` entrega `req.body` directamente a la actualización. Hoy puede mutar cualquier campo sin normalización, lista permitida ni validación de invariantes.

### Productores directos de prueba y simulación

| Productor | Clasificación | Riesgo contractual |
|---|---|---|
| `scripts/generar-pedido-prueba-rtdb.js` | Prueba manual activa | Escribe directamente un pedido mínimo, sin ubicación ni contrato financiero |
| `scripts/diagnosticar-complete-order.mjs` | Diagnóstico E2E | Escribe directamente un pedido parcial antes de llamar al flujo HTTP |
| `simulacion_e2e.js` | Simulación E2E | Incluye coordenadas camelCase, pero omite cliente, tienda, items y finanzas; usa estados en varias cajas |
| `create-order-ready-complete.js` | Herramienta operativa histórica | Escribe simultáneamente en canónico y espejos; crea un pedido ya aceptado y evita transiciones normales |
| `scripts/certificar-pedido-c-campo.mjs` | Certificación de campo | Crea por Admin con datos mínimos y después añade compatibilidad Android durante despacho |
| `scripts/createPedidoViaSSOT.js` | Cliente de prueba histórico | Llama al Admin con un payload mínimo y documenta una topología Firestore/RTDB que ya no coincide con el runtime actual |
| `simularMisionPro()` y `simularMision001()` en Android | Simulación embebida | Escriben directamente solo en `pedidos_para_reparto`; una variante tiene coordenadas y otra no; no crean canónico |

Estos productores no son interfaces comerciales, pero sí pueden contaminar ambientes compartidos y generar evidencia falsa sobre el contrato. Deben migrarse al constructor canónico o quedar aislados del ambiente operativo.

### Entradas alternativas no activas por defecto

`app_fixed.js`, `app_test.js` y `run_server.js` contienen rutas o productores alternativos. No son la entrada declarada en `package.json`, pero pueden ejecutarse manualmente y representan riesgo de reactivar esquemas antiguos.

### Modificadores y replicadores

| Módulo | Operación | Hallazgo |
|---|---|---|
| Cocina (`public/panel.html`) | Construye el payload de despacho | Conserva el pedido y normaliza ids/estados; copia coordenadas del cliente si ya existen, pero no crea coordenadas de tienda ni corrige una fuente incompleta |
| Delivery backend | Dispatch, accept, GPS y complete | Preserva muchos alias y replica a índices; opera con estados, conductor e importes, pero no exige coordenadas ni contrato completo |
| Web de evidencia (`public/subirEvidencia.js`) | Actualiza evidencia y cierre | Escribe en Firestore `pedidos` con `fotoEvidencia`, `evidenciaFallback`, `fechaEntrega` y `estado=Entregado`; diverge de la SSOT RTDB y de los nombres canónicos actuales |
| Agente de despacho | Asignación automática | Espera `latTienda/lngTienda`; los pedidos Admin actuales no los proporcionan |
| Agentes antifraude | Validación geográfica | El agente de servidor tolera más alias que la Cloud Function, que solo busca camelCase de cliente y tienda |
| Agente de soporte | Incidentes y bonos | Espera `timestampCreacion`; Admin crea `fecha_creacion`, `createdAt` y `timestamp` |

## Casilla 2 - Contrato único propuesto para decisión

La siguiente forma es el candidato canónico de C5. No está implementado todavía. Se separan datos obligatorios al crear de campos de ciclo de vida que deben nacer con un valor explícito nulo o inicial.

### Obligatorio al crear

| Grupo | Campos canónicos propuestos |
|---|---|
| Identidad | `id`, `shortId`, `origen`, `schema_version` |
| Cliente | `cliente.nombre`, `cliente.telefono`, `cliente.direccion`, `cliente.referencias`, `cliente.ubicacion.lat`, `cliente.ubicacion.lng` |
| Tienda | `tienda.id`, `tienda.nombre`, `tienda.direccion`, `tienda.ubicacion.lat`, `tienda.ubicacion.lng` |
| Items | `items[]` con `nombre`, `cantidad`, `precio`, `extras[]` |
| Pago | `pago.subtotal`, `pago.envio`, `pago.propina`, `pago.total`, `pago.metodo`, `pago.estado` |
| Logística | `logistica.estado`, `logistica.fase_panel`, `logistica.creado_en` |

### Obligatorio como estado inicial explícito

| Grupo | Campos y valor inicial |
|---|---|
| Repartidor | `logistica.repartidor_id=null`, `logistica.pedido_activo=false` |
| Evidencia | `evidencia.url=null`, `evidencia.tipo=null`, `evidencia.fallback=false`, `evidencia.capturada_en=null` |
| Ciclo de vida | Marcas de aceptación, llegadas y entrega en `null` hasta que ocurra cada evento |

No es correcto exigir una URL de evidencia ni un repartidor real al nacer. Sí es correcto exigir que su ausencia tenga una representación y semántica únicas.

### Decisiones pendientes antes de implementar

1. Elegir forma anidada o plana como canónica. La propuesta anidada reduce colisiones; los alias planos quedarían solo en adaptadores temporales.
2. Definir una única representación de estado y eliminar diferencias de caja como `Pendiente`, `pendiente` y `PENDIENTE`.
3. Definir quién aporta coordenadas verificadas de tienda y cliente y qué ocurre si la geocodificación falla.
4. Decidir si el web de evidencia migra a RTDB o si existe un puente explícito y comprobable desde Firestore.
5. Versionar el esquema y establecer política de compatibilidad/migración para los pedidos históricos.

## Casilla 3 - Consumidores

| Consumidor | Datos que usa realmente | Incompatibilidad principal |
|---|---|---|
| Driver Android | Estado, conductor, cliente, tienda, direcciones, importe, coordenadas de ambos destinos, tarifa, tiempos y evidencia | Tolera muchos alias, pero exige ambos pares de coordenadas para ofrecer una misión operativa |
| Cocina | Id, estado, cliente, descripción, importe y datos del pedido; al despachar intenta copiar coordenadas del cliente | No puede completar ubicación ausente y publica lo que recibió |
| Admin | Para métricas: estados, marcas de tiempo, importes y alertas; el frontend crea datos de cliente/items/pago | No consume ni verifica la ubicación que C4 necesita |
| Delivery backend | Estado, conductor, ids, importe y payload existente | No valida items, tienda, cliente ni coordenadas como precondición de despacho |
| Web repartidor | Pedidos `LISTO`, ids, estado, conductor, cliente, descripción e importe | Actualmente no consume coordenadas ni evidencia, aunque el flujo geográfico las necesita en Android |
| Agente de despacho | Estado, conductor disponible y `latTienda/lngTienda` | Contrato más estrecho que Android y Admin no lo satisface |
| Antifraude servidor | GPS del conductor y varios alias de destino | Su lista de alias difiere de Cloud Functions |
| Antifraude Cloud Function | `latCliente/lngCliente` o `latTienda/lngTienda` | No reconoce las formas anidadas ni todos los alias Android |
| Agente de soporte | Estado, `timestampCreacion`, conductor y percance | Marca de tiempo incompatible con Admin |

### Alias geográficos observados

- Cliente: `lat/lng`, `cliente.coords`, `cliente_lat/cliente_lng`, `lat_cliente/lng_cliente`, `latCliente/lngCliente`.
- Tienda: `latTienda/lngTienda`, `tienda.coords`, `tienda_lat/tienda_lng`, `lat_tienda/lng_tienda`.

La tolerancia de Android evita algunos fallos históricos, pero no constituye un contrato. Otros consumidores reconocen subconjuntos diferentes.

## Casilla 4 - Matriz de cobertura

Leyenda: **P** produce, **C** consume, **M** modifica/preserva, **-** no participa de forma efectiva.

| Campo/grupo | Admin productor | API órdenes | Cocina | Driver | Delivery backend | Web repartidor | Agentes |
|---|---:|---:|---:|---:|---:|---:|---:|
| Identidad completa | P parcial | P parcial | M | C | C/M | C | C |
| Cliente básico | P | - | C/M | C | M | C | - |
| Referencias cliente | - | - | M | - | M | - | - |
| Tienda básica | - | - | M | C | M | - | - |
| Coordenadas tienda | - | - | M si existen | C | M | - | C |
| Coordenadas cliente | - | - | M si existen | C | M | - | C |
| Items/extras | P parcial | P parcial | C/M | - | M | - | - |
| Pago completo | P | P solo total | M | C parcial | C/M parcial | C parcial | - |
| Estado/logística | P con alias | P incompatible | C/M | C/M | C/M | C | C/M |
| Repartidor | P nulo | - | M | C/M | C/M | C | C/M |
| Evidencia | P nula parcial | - | - | P/C | C/M | - | C parcial |
| Marcas de tiempo | P con alias | P parcial | M | C parcial | M | - | C con otro alias |

## Evidencia agregada del estado persistido

Muestra de solo lectura: 84 registros bajo `pedidos` el 2026-07-13.

### Procedencia declarada

| Origen | Registros |
|---|---:|
| Sin `origen` | 57 |
| `panel_admin` | 12 |
| `panel_api` | 6 |
| Otros productores de validación/certificación | 9 |

### Cobertura global relevante

| Dato | Cobertura |
|---|---:|
| Estado | 100.0% |
| Total mediante algún alias | 94.0% |
| Nombre de cliente | 92.9% |
| Dirección de cliente | 38.1% |
| Teléfono | 28.6% |
| `origen` | 32.1% |
| `shortId` | 2.4% |
| Coordenadas de cliente | 2.4% |
| Nombre/dirección/coordenadas de tienda | 2.4% cada uno |
| Items | 1.2% |
| Referencias o extras | 0.0% |
| Método/estado de pago | 0.0% |
| `pedido_activo` en el pedido | 0.0% |
| URL de evidencia | 3.6% |
| Tipo/fallback de evidencia | 2.4% |

Los 12 registros históricos declarados como `panel_admin` sí contenían identidad, cliente básico, teléfono, dirección, total y estado, pero ninguno tenía tienda ni coordenadas. Tampoco reflejaban todos los items e importes que el código Admin actual ya intenta producir; esto demuestra deriva histórica o transformaciones posteriores, no que el endpoint actual descarte necesariamente esos campos.

### Estados encontrados

`EN_CAMINO` 5, `LISTO` 24, `ENTREGADO` 19, `EN_REPARTO` 35 y `EN_CURSO` 1. No había pedidos `PENDIENTE` en la muestra. Tres estados persistidos (`EN_CAMINO`, `EN_REPARTO` y variantes históricas observadas en código) están fuera de la lista canónica declarada.

## Hallazgos priorizados

### P0 - Bloquean el contrato y C4

1. Dos productores oficiales activos crean formas incompatibles.
2. Ningún productor oficial activo garantiza coordenadas de tienda y cliente.
3. `PUT /api/ordenes/:id` permite mutación arbitraria sin proteger invariantes.
4. El agente automático de despacho depende de `latTienda/lngTienda`, que Admin no produce, y además usa estados que no coinciden completamente con la SSOT declarada.

### P1 - Riesgo alto de divergencia

1. El flujo web de evidencia escribe en Firestore con nombres y estado distintos de la SSOT RTDB.
2. Android, agentes y Cloud Functions aceptan colecciones distintas de alias geográficos.
3. El agente de soporte espera una marca temporal que Admin no genera.
4. Los datos persistidos muestran fuerte deriva histórica y procedencia desconocida en 57 de 84 registros.

### P2 - Higiene y control de pruebas

1. Scripts directos y simuladores pueden saltarse las fronteras oficiales.
2. Entradas alternativas del servidor y documentación histórica pueden reactivar topologías antiguas.
3. Las pruebas del Admin validan items, importes y estados, pero no ubicación, tienda, referencias ni evidencia inicial.
4. Las pruebas de delivery usan fixtures mínimos y por eso no detectan incumplimiento del contrato integral.

## Orden recomendado de corrección

1. **C5.1 - Decisión del esquema:** aprobar el modelo canónico, estados, obligatoriedad por etapa y `schema_version`.
2. **C5.2 - Validador de frontera:** un único constructor/validador para todos los productores; rechazo explícito de pedidos incompletos.
3. **C5.3 - Productores:** migrar coordinadamente Admin y `/api/ordenes`; luego scripts y simuladores.
4. **C5.4 - Consumidores:** adaptar Cocina, delivery, agentes, Android y evidencia detrás de una capa temporal de compatibilidad.
5. **C5.5 - Datos históricos:** medir, respaldar y migrar solo con una política aprobada; no completar coordenadas inventadas.
6. Repetir la certificación C4 con un pedido oficial nacido bajo el contrato versionado.

## Criterio de salida de C5

C5 quedará certificada únicamente cuando:

- todos los productores activos atraviesen el mismo validador versionado;
- ningún pedido nuevo pueda nacer sin tienda y cliente georreferenciados;
- los consumidores lean la forma canónica o un adaptador explícito y probado;
- una matriz automatizada demuestre cobertura total por etapa;
- un pedido oficial recorra Admin/Cocina, Android, geonavegación, evidencia y cierre sin inyección manual de campos.

## Decisión inmediata

No corregir todavía un panel aislado. C5.1 quedó abierto como arquitectura documental mediante:

- `CONTRATO_CANONICO_V2.md`;
- `MAQUINA_ESTADOS_V2.md`;
- `FASES_OPERATIVAS_V2.md`;
- `EVENTOS_V2.md`;
- `C5_1_MATRIZ_APROBACION.md`.
- `C5_1_INVENTARIO_ECOSISTEMA.md`;
- `PLAN_MIGRACION_V2.md`.
- `C5_2_A_COMPATIBILIDAD_V2.md`.
- `C5_2_B_SHADOW_VALIDATOR.md`.
- `C5_2_B_1_VENTANA_OBSERVACION.md`.

C5.1 está validada documentalmente. C5.2-A encontró 0 de 9 grupos integralmente compatibles. C5.2-B está aprobado y apagado. C5.2-B.1 define una ventana autorizada de 72 horas mínimas/25 pedidos, aún sin activar. No se modificaron pedidos ni se habilitaron productores V2.
