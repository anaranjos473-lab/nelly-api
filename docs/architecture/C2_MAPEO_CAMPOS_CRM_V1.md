# C2_MAPEO_CAMPOS_CRM_V1
## Mapeo de Campos - CRM Basico

**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0

### 1. Proposito

Documentar el inventario inicial de campos del CRM basico y su procedencia dentro de la SSOT certificada para evitar duplicidad de datos y definir una ruta de normalizacion minima.

### 2. Principio rector

El CRM no crea una nueva fuente de verdad. Consume la SSOT existente y, cuando un dato no existe de forma canonica, lo deriva a partir de la evidencia operativa ya validada.

### 3. Mapeo de campos

| Campo CRM | Fuente SSOT | Estado | Regla |
| --- | --- | --- | --- |
| Historial de pedidos | `pedidos` | Disponible | Consumir directamente los pedidos del cliente. |
| Cliente | `cliente_nombre` y campos relacionados | Disponible / parcial | Normalizar identidad usando los datos ya presentes en pedidos. |
| Comercio | `market_v1` | Disponible | Consumir la entidad de comercio y su catalogo. |
| Ticket promedio | `GOAL-C1-001` | Disponible | Reutilizar el KPI comercial ya certificado. |
| Frecuencia de compra | Derivada de `pedidos` | Disponible | Calcular por conteo de pedidos entregados por cliente. |
| Ultimo pedido | Timestamps + estado | Disponible | Tomar la ultima orden entregada o finalizada. |
| Total gastado | `total` / `monto` / `monto_total` | Disponible | Normalizar el valor monetario de cada pedido. |
| Productos favoritos | `items` / `normalizedItems` | Parcial | Estandarizar lectura de productos mas repetidos. |
| Zona de entrega | Direccion / coordenadas | Parcial | Clasificar por direccion operativa o zona derivada. |
| Observaciones | Notas del pedido | Parcial | Definir un campo canonico a partir de notas existentes. |
| Clientes recurrentes | Derivado de `pedidos` | Disponible | Considerar recurrente si el cliente tiene mas de un pedido entregado. |
| Horarios frecuentes | Timestamps de pedidos | Parcial | Derivar franjas de uso desde la serie temporal de pedidos. |
| Cancelaciones | `pedidos` | Disponible | Contar pedidos cancelados por cliente o comercio. |
| Ultima incidencia | Eventos / notas / estado del pedido | Parcial | Tomar la incidencia mas reciente visible en la operacion. |

### 4. Fuentes de verdad por dominio

- `pedidos`: historia operativa del cliente.
- `market_v1`: identidad y catalogo del comercio.
- `GOAL-C1-001`: indicadores comerciales derivados.
- `finanzas`: impactos monetarios y conciliacion.
- `historial_ventas`: trazabilidad historica de entregas y cierres.

### 5. Reglas de derivacion

- Si un dato ya existe en la SSOT, se consume directamente.
- Si un dato puede derivarse sin ambiguedad, se calcula en lectura.
- Si un dato no existe con consistencia suficiente, se documenta como pendiente de normalizacion.
- No se persisten copias paralelas si la lectura derivada es suficiente.

### 6. Campos a normalizar despues del primer uso

Prioridad de normalizacion incremental:

1. Identidad unica del cliente.
2. Catalogo consistente de productos.
3. Clasificacion de zonas.
4. Campo canonico de observaciones.

### 7. Criterio de uso

Este mapa debe ser la referencia inicial para construir la ficha de cliente y la ficha de comercio. Si un campo no figura aqui, no debe asumirse como disponible sin una validacion previa.

### 8. Historial

- 2026-07-24: Version inicial del mapa de campos del CRM basico a partir de la auditoria de SSOT.
- 2026-07-24: Se registra el uso directo de `pedidos`, `market_v1`, `GOAL-C1-001`, `finanzas` e `historial_ventas` como fuentes de referencia.
