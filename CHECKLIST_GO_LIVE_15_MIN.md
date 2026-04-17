# Checklist Go-Live 15 Min

## Objetivo
Validar en 15 minutos que Nelly Delivery esta listo para operar sin riesgos criticos.

## Duracion total
- 15 minutos

## Roles sugeridos
- Operaciones: valida panel y flujo de pedidos
- Backend: valida endpoint y logs
- Movil: valida app repartidor y tracking

## Minuto 0-3: Seguridad y Acceso
1. Verificar en panel que estado sea SISTEMA ONLINE.
2. Confirmar que endpoint de token de panel responde 200.
3. Confirmar que no hay errores recientes de CORS o auth en logs de Render.
4. Confirmar que el usuario repartidor de prueba tiene claims driver true o role repartidor.

## Minuto 3-6: Flujo de Pedido
1. Crear pedido de prueba y validar que aparece en panel.
2. Marcar pedido listo para reparto.
3. Confirmar movimiento a pedidos_para_reparto.
4. Aceptar pedido desde app de repartidor y confirmar movimiento a pedidos_en_camino.

## Minuto 6-9: Tracking y ETA
1. Confirmar escritura de currentLocation en repartidores uid currentLocation.
2. Confirmar escritura de driverLocation en pedidos_en_camino pedidoId driverLocation.
3. Confirmar calculo ETA en pedidos_en_camino pedidoId eta.
4. Confirmar cache de 50m en logs cuando aplica.

## Minuto 9-12: Panel Operativo
1. Confirmar mapa con marcadores en tiempo real.
2. Confirmar filtro de flota Todos Activos Libres Offline.
3. Confirmar folio dorado cuando distancia menor o igual a 500 m.
4. Confirmar doble pitido de proximidad cuando ETA menor a 3 minutos.
5. Activar Modo Silencio y validar que bloquea audio por 5 minutos sin ocultar alertas visuales.

## Minuto 12-15: Continuidad y Respaldo
1. Ejecutar workflow Admin Respaldo Semanal de Datos en modo manual.
2. Confirmar archivo nuevo en backups con formato backup-rtdb-YYYY-MM-DD.json.
3. Confirmar poda automatica para conservar maximo 8 respaldos.
4. Registrar resultado en bitacora de turno.

## Criterio de aprobacion Go-Live
Aprobado si todos los puntos criticos se cumplen:
- Panel ONLINE
- Flujo pedido completo hasta EN_CAMINO
- Tracking y ETA visibles
- Alertas operativas correctas
- Backup ejecutable y retenido

## Si falla un punto critico
1. No abrir turno completo.
2. Activar protocolo de contingencia.
3. Escalar con evidencia minima:
- UID de prueba
- pedidoId
- hora del incidente
- captura de panel y fragmento de logs

## Bitacora rapida de cierre
- Fecha:
- Responsable:
- Resultado: Aprobado o Bloqueado
- Observaciones:
