# Estructura de Base de Datos y Respaldo Semanal

## Alcance
Este documento resume la estructura activa de datos usada por Nelly Delivery y un proceso semanal de respaldo.

## 1) Realtime Database (RTDB)

### Nodos principales
- pedidos/
  - Flujo legacy de pedidos entrantes por restaurante y/o folio.
- pedidos_para_reparto/{pedidoId}
  - Cola de pedidos disponibles para la app de repartidores.
  - Campos habituales: id, id_pedido, estado, cliente, cliente.coords, logistica.
- pedidos_en_camino/{pedidoId}
  - Pedido tomado por un repartidor y en seguimiento.
  - Campos habituales:
    - driverLocation: { lat, lng, driverUid, updatedAt }
    - eta: { durationText, durationValue, distanceText, distanceValue, origin, destination, updatedAt }
    - estado: en_camino
- repartidores/{uid}
  - currentLocation: { lat, lng, updatedAt }
  - fcm_token (segun dispositivo)
- pagos_confirmados/{paymentId}
  - monto, email, fecha, status

### Reglas esperadas
- Lectura/escritura restringida a usuarios autenticados.
- No habilitar reglas globales abiertas.

## 2) Firestore

### Colecciones principales
- pedidos
  - Panel cocina consume estado pendiente y actualiza estado listo_para_reparto.
- pedidos_para_reparto
  - Reflejo de compatibilidad cuando cocina despacha a flotilla.
- metricas/ganancias_hoy
  - total acumulado mostrado en panel.

## 3) Flujo operativo de datos
1. Cocina recibe pedidos pendientes.
2. Cocina envia a pedidos_para_reparto.
3. Repartidor acepta y mueve a pedidos_en_camino.
4. App de repartidor publica currentLocation y driverLocation.
5. Backend calcula ETA logistica y la guarda en pedidos_en_camino/{pedidoId}/eta.
6. Panel muestra ETA, distancia, folio dorado y alerta sonora de proximidad.

## 4) Respaldo semanal recomendado

### A. RTDB (obligatorio)
- Exportar JSON completo desde Firebase Console o con Admin SDK.
- Guardar archivo con formato:
  - rtdb-backup-YYYY-MM-DD.json
- Retencion sugerida:
  - 8 semanas locales
  - copia externa cifrada (Drive empresarial o bucket privado)

### B. Firestore (obligatorio)
- Export de colecciones criticas:
  - pedidos
  - pedidos_para_reparto
  - metricas
- Guardar con version semanal y checksum.

### C. Secretos y configuracion (obligatorio)
- Verificar que existen y no expiran:
  - FIREBASE_ADMIN_JSON
  - GOOGLE_DISTANCE_MATRIX_API_KEY o MAPS_API_KEY
  - FIREBASE_DATABASE_URL
- No guardar secretos en el repositorio.

## 5) Checklist semanal de respaldo
1. Confirmar sistema ONLINE en panel.
2. Exportar RTDB.
3. Exportar Firestore.
4. Validar integridad del backup (tamano > 0, checksum, apertura de muestra).
5. Registrar fecha, responsable y ubicacion del backup.
6. Probar restauracion parcial en entorno de prueba (al menos 1 vez al mes).

## 6) Restauracion rapida (resumen)
1. Crear entorno de prueba temporal.
2. Importar snapshot RTDB y colecciones Firestore.
3. Verificar nodos clave:
- pedidos_para_reparto
- pedidos_en_camino
- repartidores
- metricas/ganancias_hoy
4. Validar que panel renderiza pedidos y mapa sin errores.

## 7) Riesgos frecuentes y prevencion
- Riesgo: backup incompleto por permisos.
  - Mitigacion: ejecutar con cuenta admin y revisar logs.
- Riesgo: restaurar datos viejos en produccion.
  - Mitigacion: restaurar primero en staging y validar.
- Riesgo: exponer secretos en archivos de respaldo.
  - Mitigacion: separar respaldo de datos y configuracion.
