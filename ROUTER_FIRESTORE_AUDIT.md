# ROUTER_FIRESTORE_AUDIT

## Objetivo
Auditar `router.js` para determinar si sus endpoints restantes son operativos o solo reportes/administración.

## Archivo auditado
- `router.js`

## Endpoints definidos en `router.js`

1. **GET /reporte-financiero**
   - Tipo: Reporte financiero / analítica
   - Firestore usado:
     - `admin.firestore().collection('pedidos')`
     - filtros: `fecha >= hoy`, `estado == 'entregado'`
   - Uso:
     - calcula `ventasBrutas`, `utilidad_nelly`, `pedidos_concluidos`
   - RTDB equivalente:
     - `admin.database().ref('pedidos')`
     - filtrar por `fecha` y `estado`
     - sumar totales y contar entregados
   - Clasificación: C / Analytics / Reportes
   - Impacto operativo:
     - No para pedidos activos
     - No para despacho
     - No para tracking
     - No para cocina
     - Sí para finanzas/estadísticas
   - Consumidor probable:
     - Panel administrativo / dashboard financiero / reporting interno

2. **GET /zonas**
   - Tipo: Catálogo de zonas
   - Firestore usado:
     - `admin.firestore().collection('zonas')`
   - Uso:
     - devuelve lista de nombres de zonas
   - RTDB equivalente:
     - `admin.database().ref('zonas')`
     - extraer campo `nombre` por zona
   - Clasificación: B / Administrativo
   - Impacto operativo:
     - Potencial soporte a configuración de distribución
     - No bloquea pedidos, despacho, tracking ni cocina directamente
   - Consumidor probable:
     - Admin / configuración / panel de zonas

3. **POST /monitoreo/discord**
   - Tipo: Alertas externas / monitoring
   - Firestore usado:
     - Ninguno
   - Uso:
     - reenvía `content` a Discord mediante webhook
   - RTDB equivalente:
     - No aplica (es webhook)
   - Clasificación: C / Analytics / Reportes / Monitoreo
   - Impacto operativo:
     - No bloquea operación logística

4. **POST /monitoreo/alerta**
   - Tipo: Alertas manuales / monitoring
   - Firestore usado:
     - Ninguno
   - Uso:
     - envía alerta de texto a Discord
   - RTDB equivalente:
     - No aplica
   - Clasificación: C / Analytics / Reportes / Monitoreo
   - Impacto operativo:
     - No bloquea operación logística

## Consumo y montaje
- `router.js` **NO está importado** ni montado desde `app.js`.
- Búsqueda en el repo no encontró referencias activas a `require('./router')` ni `import ... from './router'`.
- Por tanto, `router.js` parece ser un archivo legacy no usado en el runtime principal.
- La ruta activa `GET /api/zonas` pertenece a `routes/zonas.js`, que usa RTDB (`admin.database().ref('zonas_calor')`) y no Firestore.

## Conclusión
- `router.js` no bloquea la certificación RTDB-only operacional si está efectivamente desconectado.
- Si se llegara a activar, sus dos endpoints con Firestore son:
  - `GET /reporte-financiero` → analytics/finanzas
  - `GET /zonas` → administración/configuración
- Los otros dos endpoints de monitoreo no afectan el flujo de pedidos.

## Recomendación
- Para la certificación RTDB-only operacional, no hay riesgo directo en la operación logística mientras `router.js` permanezca no montado.
- Para la certificación RTDB-only absoluta, `router.js` debe limpiarse o migrarse si se reactiva.
- Prioridad actual: auditar / migrar solo si se comprueba que `router.js` está activo en producción.

## Estado final
- `router.js` = LEGACY / ADMINISTRATIVO / REPORTES
- Bloquea RTDB-only operacional: ❌
- Bloquea RTDB-only absoluta: ✅ (si se usa)
- Puede permanecer temporalmente: ✅ (mientras no esté montado)
