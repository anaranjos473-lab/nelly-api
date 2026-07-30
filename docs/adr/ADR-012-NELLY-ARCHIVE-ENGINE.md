# ADR-012: Nelly Archive Engine como bus interno de datos

## Estado
Adoptado como decision arquitectonica del ecosistema.

La certificacion E2E sigue pendiente.

## Contexto
Nelly necesitaba resolver un problema de crecimiento y consistencia entre varios centros de trabajo:

- Cocina debia ver pedidos vivos.
- Logistica debia ver el estado del dia.
- Centro Comercial debia leer la operacion diaria sin tocar historial.
- Historial, Finanzas, Analytics y Auditoria necesitaban informacion derivada, no colecciones operativas.

Antes del NAE, varios modulos consultaban o derivaban informacion desde colecciones distintas y, en algunos casos, con reglas locales. Eso aumentaba el riesgo de:

- duplicidad de calculos;
- consultas a la fuente incorrecta;
- mezcla entre operacion viva e informacion historica;
- fallos de rendimiento al crecer el volumen de pedidos;
- dificultad para certificar el flujo completo.

## Problema
Se necesitaba una capa unica de lectura que:

- separara la operacion viva del historico;
- permitiera migrar consumidores por fases;
- redujera el costo de consultar grandes volumentes de pedidos;
- mantuviera una version estable del contrato;
- soportara certificacion operacional y auditoria posterior.

## Decision
Se adopta `Nelly Archive Engine (NAE)` como bus interno de datos de lectura del ecosistema.

NAE expone un contrato unico de consulta:

- `getActiveOrders()`
- `getTodayOrders()`
- `getHistoricalOrders()`
- `getMonthlySummary()`
- `getAnnualSummary()`
- `getAuditIndex()`

La capa publica equivalente es:

`GET /api/data-architecture/data-access`

### Fuente de verdad operativa
La verdad operativa continua viviendo en el backend y en la base operativa certificada. NAE no reemplaza el backend escritor.

NAE solo organiza y expone derivaciones de lectura:

- pedidos vivos;
- pedidos del dia;
- pedidos historicos;
- resúmenes mensuales y anuales;
- indices de auditoria.

### Separacion por consumidor

| Centro | Contrato de lectura |
| --- | --- |
| Cocina | `active_orders` |
| Logistica | `today_orders` |
| Centro Comercial | `today_orders` |
| Historial | `historical_orders`, `monthly_summary`, `annual_summary`, `audit_index` |
| Finanzas | `monthly_summary`, `annual_summary` |
| Analytics | `historical_orders`, `history_index` |
| Auditoria | `audit_index` |

## Alcance
NAE clasifica el ciclo de vida del pedido en:

- pedidos activos;
- pedidos del dia;
- historico;
- resúmenes agregados;
- indices de auditoria.

NAE tambien publica un scheduler de archivado diario para mantener la operacion ligera.

## No alcance
NAE no sustituye:

- el backend escritor;
- el contrato de `complete-order`;
- la logica de asignacion de repartidores;
- la logica de pago o deuda;
- la UI operativa certificada;
- los flujos de mutacion ya validados.

## Consecuencias

### Positivas
- Reduce la lectura directa a colecciones operativas.
- Permite migraciones incrementales por centro.
- Mejora el rendimiento de pantallas de lectura.
- Simplifica auditoria, finanzas y analytics.
- Hace el contrato de lectura versionable.

### Riesgos
- Mientras exista coexistencia, pueden sobrevivir fallbacks temporales.
- Un error en el scheduler puede afectar el archivo diario si no se certifica bien.
- Un consumidor que ignore el contrato podria leer la fuente equivocada.

## Reglas

1. NAE v1 es un contrato de lectura, no un escritor.
2. Ningun centro debe consultar directamente una coleccion operativa si existe contrato equivalente.
3. Los cambios incompatibles requeriran `v2`.
4. La eliminacion de fallbacks solo procede despues de certificacion E2E.
5. La certificacion debe cubrir flujo feliz y casos negativos.

## Criterios de certificacion
NAE se considerara certificado para operacion cuando exista evidencia reproducible de:

- creacion de pedido;
- flujo por Cocina;
- flujo por Logistica;
- archivado correcto;
- resumen mensual consistente;
- resumen anual consistente;
- analitica coherente;
- auditoria consistente;
- ausencia de duplicados;
- consumo exclusivo del contrato por cada centro.

## Relacion con otros documentos

- `docs/contracts/DATA_ACCESS_CONTRACT_v1.md`
- `docs/certificaciones/NAE_FASE2.md`
- `docs/certificaciones/NAE_FASE2_OPERACIONAL.md`
- `docs/adr/ADR-011-ESTRATEGIA-SSOT-FIRESTORE-RTDB.md`

## Historial de cambios

- 2026-07-30: decision inicial documentada.
