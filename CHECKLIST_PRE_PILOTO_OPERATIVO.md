# CHECKLIST PRE-PILOTO_CAMPO_001: Estado Actual (2026-06-20)

## Status General

Proyecto: listo para prueba operativa real.

Bloqueadores tecnicos cerrados:
- Backend Render estable.
- Smoke test de endpoints criticos OK.
- Endpoint `/api/delivery/driver-offline` corregido y desplegado.
- APK Release compilado, firmado, instalado y abierto en telefono fisico.

Gate pendiente:
- Flujo comercial real: Admin crea pedido -> Driver lo ve -> Driver acepta -> GPS -> Entrega -> Finanzas.

---

## Estado de Componentes

### Backend / Render

Estado: OK

Verificado:
- Render responde en produccion.
- Commit desplegado incluye `53b007c FIX: Add delivery driver-offline endpoint`.
- `/api/health` respondio 200 durante 10 checks consecutivos, 1 por minuto.
- Uptime subio de forma continua, sin reinicio visible.
- Smoke final:
  - `POST /api/delivery/accept-order` -> 401 Token requerido.
  - `POST /api/delivery/update-location` -> 401 Token requerido.
  - `POST /api/delivery/driver-offline` -> 401 Token requerido.

Interpretacion:
- Las rutas existen en produccion.
- Estan protegidas correctamente.
- No hay 404, 500, 502 ni 503 en endpoints criticos.

### Android App / NellyDriver

Estado: OK

Proyecto:
`C:\Users\hp14\AndroidStudioProjects\NellyDriver`

APK Release:
`C:\Users\hp14\AndroidStudioProjects\NellyDriver\app\build\outputs\apk\release\app-release.apk`

Verificado:
- `assembleRelease` completo sin error.
- APK generado: `app-release.apk`.
- APK instalado en telefono fisico.
- App abierta correctamente.
- Version instalada:
  - `versionCode=4`
  - `versionName=4.0.0-PRO`

Nota:
- Se desinstalo la app anterior porque tenia firma distinta.
- La instalacion Release nueva fue exitosa.

### Panel Admin

Estado: listo para prueba real.

URL:
`https://nelly-delivery.web.app/admin`

Pendiente de campo:
- Login admin.
- Crear pedido real de prueba.
- Confirmar escritura en RTDB.
- Confirmar que el Driver lo ve en menos de 10 segundos.

### Firebase / RTDB

Estado: listo para observacion en piloto.

Pendiente de campo:
- Confirmar que el pedido aparece en el nodo que escucha Driver.
- Confirmar transicion a `EN_CAMINO` al aceptar.
- Confirmar updates GPS.
- Confirmar entrega y registro financiero.

### Google Maps Platform / Costos

Estado: validar antes del piloto.

Confirmaciones recomendadas:
- Presupuesto mensual configurado en Google Cloud con alertas activas.
- API keys restringidas:
  - Android por paquete y SHA-1.
  - Backend por IP o por servicio.
- Solo APIs necesarias habilitadas.
- Sin geocodificacion, rutas o autocomplete repetitivos si no aportan valor operativo.
- El uso de Google Maps se limita a lo que realmente necesita la app del conductor.
- El backend sigue siendo la fuente de verdad; Android solo refleja estado.

---

## GO / NO-GO

| Requisito | Estado |
|---|---|
| Render estable | OK |
| Smoke test endpoints | OK |
| APK Release compilado | OK |
| APK instalado en device | OK |
| App abre en telefono | OK |
| Pedido visible en Driver | Pendiente campo |
| Driver puede aceptar | Pendiente campo |
| GPS visible durante pedido | Pendiente campo |
| Entrega y finanzas | Pendiente campo |

Decision actual:

PILOTO_CAMPO_001 = GO para prueba controlada de una orden.

No mas auditorias teoricas del flujo operativo antes del piloto.
Solo queda la verificacion rapida de costos y restricciones de Google Maps Platform.

---

## PILOTO_CAMPO_001: Secuencia Operativa

1. Abrir app NellyDriver en el telefono.
2. Login con conductor real/test autorizado.
3. Verificar estado disponible.
4. Abrir Admin Panel.
5. Crear pedido de prueba.
6. Medir tiempo hasta que aparece en Driver.
7. Aceptar pedido.
8. Confirmar estado `EN_CAMINO` en RTDB/panel.
9. Verificar GPS activo.
10. Completar entrega.
11. Confirmar registro financiero.

Metricas a capturar:
- Hora de creacion del pedido.
- Hora de aparicion en Driver.
- Tiempo de aparicion en segundos.
- Hora de aceptacion.
- Estado despues de aceptar.
- Coordenadas GPS recibidas.
- Estado final de entrega.
- Registro financiero generado.

---

## Criterio Final

GO definitivo si:
- El pedido aparece en Driver en menos de 10 segundos.
- Driver puede aceptar.
- Backend cambia el pedido a `EN_CAMINO`.
- GPS se actualiza durante el pedido.
- La entrega finaliza sin error.
- Finanzas registra el cierre.

NO-GO si:
- Pedido no aparece en Driver.
- Aceptar pedido falla.
- Estado queda atorado.
- GPS no reporta.
- Entrega o finanzas no cierran.

Siguiente paso unico:

Ejecutar una orden completa real desde Admin hasta finanzas.
