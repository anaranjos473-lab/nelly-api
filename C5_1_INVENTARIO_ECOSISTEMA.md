# C5.1 - Inventario vinculante del ecosistema de pedidos

Estado: **BORRADOR PARA RATIFICACIÓN**

Fecha: 2026-07-13

## Propósito

Clasificar cada módulo por su función real y documentar qué escribe, lee y reconoce antes de C5.2. “Productor” significa que crea `pedidos/{id}`; una interfaz que llama a otro módulo o un consumidor que modifica el pedido no se clasifica automáticamente como productor.

## Productores y cadenas de producción

| Módulo | Papel real actual | Escritura/camino | Campos actuales relevantes | Omisiones o riesgo | Estados actuales |
|---|---|---|---|---|---|
| Admin Dashboard | Interfaz productora | Llama `POST /api/admin/pedidos` | Cliente, teléfono, dirección, descripción, items, importes y pago | No captura tienda, referencias ni coordenadas | Envía al backend; no debe decidir el estado V2 |
| `/api/admin/pedidos` | Productor oficial activo | Crea `pedidos/{id}` | IDs/aliases, cliente, items, importes, pago, logística inicial, fechas, `origen` | Falta contrato geográfico completo; persiste aliases V1 | `pendiente`, `PENDIENTE`, fase de panel |
| `/api/ordenes` | Segundo productor oficial activo | `ordersController.createOrder` crea `pedidos/{id}` | `userId`, `items`, `total`, `createdAt` | Omite identidad completa, cliente, tienda, coordenadas, pago y logística | `Pendiente` |
| Panel Cocina | Transformador/despachador, no productor confirmado | Lee canónico y llama delivery dispatch | Preserva pedido; normaliza algunos ids/estados; copia coordenadas del cliente si existen | No crea coordenadas ausentes ni datos de tienda | Lee múltiples aliases; publica `LISTO` mediante backend |
| Scripts internos | Productores de prueba directos | Varios escriben RTDB o llaman APIs | Formas distintas según certificación | Pueden saltarse fronteras, crear espejos o pedidos parciales | Mezcla `pendiente`, `PENDIENTE`, `EN_CAMINO`, etc. |
| Simuladores Android | Productores de índice de prueba | Escriben `pedidos_para_reparto` directamente | Una simulación tiene coordenadas; otra no | No crean pedido canónico y falsean la SSOT | `PENDIENTE` en índice |
| Cloud Functions | Consumidor/modificador; no productor primario encontrado | Triggers y validación | Lee ubicación/estado y puede generar efectos derivados | Alias geográficos más estrechos que Android | Depende de estados históricos |
| Agentes backend | Consumidores/modificadores automáticos | Escuchan y actualizan pedidos/conductores | Estado, GPS, timestamps, conductor | No crean un contrato completo; algunos esperan campos que Admin no produce | Mezcla canónico e históricos |
| Herramienta de importación | No localizada como productor activo | Pendiente de incorporación futura | Sin contrato comprobable | No podrá activarse sin `producer=api_import` y validador V2 | Ninguno aprobado |

## Contrato objetivo por productor

| Productor V2 | `producer` | Campos obligatorios de entrada | Responsabilidad del backend |
|---|---|---|---|
| Admin Dashboard | `admin_dashboard` | Cliente, tienda, dos ubicaciones, items y pago | Generar identidad/tiempo, validar, normalizar y persistir V2 |
| API de órdenes | `api_ordenes` | El mismo conjunto semántico que Admin | Autenticar productor, validar y persistir la misma forma V2 |
| Cocina, si se autoriza crear | `panel_cocina` | Exactamente el contrato de creación V2 | Usar el mismo servicio, sin ruta especial de esquema |
| Importador futuro | `api_import` | Lote de pedidos V2 individualmente válidos | Aislar fallos por pedido y no escribir parciales |
| Cloud Function futura | `cloud_function` | Contrato V2 completo y causa documentada | No crear por efecto colateral no auditado |
| Certificación | `script_interno` | Fixture V2 completo | Usar API/constructor oficial y ambiente controlado |

Ningún productor recibe permiso para escribir directamente los índices derivados.

## Consumidores

| Consumidor | Lee actualmente | Campos obligatorios reales | Opcionales/tolerados | Estados reconocidos y brecha |
|---|---|---|---|---|
| Driver Android | Canónico e índices; valida canónico antes de ofrecer | Id, estado, ambas ubicaciones, direcciones, cliente, tienda, importe, asignación | Tarifa, tiempos, evidencia y numerosos aliases | Reconoce estado/logística con aliases; la UI histórica mezcla fases como estados |
| Repartidor Web | Pedidos disponibles/canónicos | Id, estado, conductor, cliente, descripción, importe | Alias de total/cliente | Principalmente `LISTO`; no usa coordenadas/evidencia de forma efectiva |
| Panel Cocina | `pedidos` | Id, estado, cliente, descripción, importe, detalle de pedido | Coordenadas al construir despacho | Reconoce varios aliases; no exige contrato completo antes de `LISTO` |
| Admin Dashboard | Respuestas de métricas y creación | Para crear: cliente/items/pago; para métricas: estados, tiempos, importes | Alertas y datos de conductor | No valida ubicación; métricas absorben deriva de estados |
| Backend Delivery | Canónico y payload de dispatch | Id, estado, conductor y total para distintas operaciones | Preserva muchos campos/aliases | Opera `LISTO`, `EN_CURSO`, `ENTREGADO`; no exige geografía/items |
| Backend Tracking | Asignación y ubicación del conductor | Pedido, UID autenticado, GPS y estado operativo | Fase/aliases según ruta | Puede actualizar estado/fase sin máquina V2 centralizada |
| Agente de despacho | Pedidos y conductores activos | Estado y `latTienda/lngTienda` | Datos del conductor | Usa forma geográfica que Admin no produce y estados históricos |
| Antifraude backend | Pedido y GPS del conductor | Destino, conductor, estado final | Varios aliases de coordenadas | Más tolerante que Cloud Functions |
| Antifraude Cloud Function | Pedido y GPS | `latCliente/lngCliente` o tienda camelCase | Pocos aliases | No reconoce toda la forma anidada/aliases Android |
| Agente de soporte | Pedido/conductor | Estado, `timestampCreacion`, percance | Datos de compensación | Timestamp incompatible con Admin actual |
| Auditorías y scripts | RTDB/API según herramienta | Varia por script | Muchos aliases | Fixtures parciales pueden ocultar incumplimientos |
| Reportes/métricas | Agregados de pedidos | Estado, timestamps, importes y productor | Alertas/logística | Resultados no comparables mientras continúe la deriva |

## Campos V2 que todo consumidor debe clasificar

Durante la migración, cada consumidor tendrá una ficha o prueba que indique:

| Grupo | Decisión obligatoria |
|---|---|
| Identidad | Lee `id`, `short_id`, `producer`, `contract_version` o declara que no los necesita |
| Cliente/tienda | Declara campos usados y nunca sustituye coordenadas por texto |
| Items/pago | Declara si requiere detalle o solo total; no interpreta centavos como pesos |
| Estado | Reconoce solo los seis estados V2 |
| Fase | Reconoce solo las seis fases V2 y no las mezcla con estado |
| Asignación | Usa únicamente `logistica.repartidor_uid` |
| Evidencia | Lee la forma anidada o declara no participar |
| Historial | Usa eventos para auditoría/tiempos, no como sustituto del estado actual |

## Resultado del inventario

- Productores oficiales activos confirmados: dos (`/api/admin/pedidos` y `/api/ordenes`).
- Interfaz productora confirmada: Admin Dashboard.
- Cocina: modificador/despachador; no se encontró creación primaria en el runtime activo.
- Productores directos no oficiales: scripts y simuladores.
- Cloud Functions y agentes: consumidores/modificadores, no productores completos confirmados.
- Importador: no localizado como productor activo; queda reservado como integración futura.
- Consumidores auditados: Android, Web Driver, Cocina, Admin, delivery, tracking, agentes, Cloud Functions, auditorías y reportes.

El inventario está documentalmente completo para el código localizado, pero su ratificación sigue pendiente. Cualquier productor externo no presente debe declararse antes de aprobar C5.2.
