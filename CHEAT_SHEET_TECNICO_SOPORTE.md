# Cheat Sheet Tecnico (Soporte y Admin)

## Diagnostico Rapido
1. Claims de repartidor:
- Ejecutar alta rapida:
  node scripts/set-driver-claims.js UID_REPARTIDOR

2. Logs en Render:
- Buscar AUTH ERROR para token expirado o claim faltante.
- Buscar DB ERROR para fallos de escritura en RTDB.
- Buscar ETA ERROR para fallos en calculo de tiempo estimado.

3. Cache ETA:
- Si ETA no cambia, revisar si el repartidor esta estatico (movimiento menor a 50 metros).

4. Backup:
- Ejecutar workflow manual de respaldo si hay sospecha de corrupcion de datos.

5. Endpoint critico de ubicacion:
- Probar POST /api/delivery/update-location con Postman para descartar problemas de red o backend.

## Comandos de Referencia
- Asignar claims:
  node scripts/set-driver-claims.js UID1 UID2
- Backup manual (Actions):
  Admin: Respaldo Semanal de Datos -> Run workflow

## Verificacion de Salud
- Panel en estado SISTEMA ONLINE.
- Escrituras en:
  - repartidores/{uid}/currentLocation
  - pedidos_en_camino/{pedidoId}/driverLocation
  - pedidos_en_camino/{pedidoId}/eta

## Hito Alcanzado
- Codigo resiliente en Android y Node.js.
- Infraestructura integrada con Firebase, Render y Google Maps.
- Gobernanza de datos con backups y poda.
- Protocolos operativos para cocina y soporte.
