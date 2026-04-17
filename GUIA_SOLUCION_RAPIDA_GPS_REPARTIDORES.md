# Guia de Solucion Rapida GPS para Repartidores

## Objetivo
Resolver rapido cuando la ubicacion del repartidor no se refleja en el sistema.

## Sintoma principal
- El panel no muestra movimiento de la moto.
- El pedido aparece EN_CAMINO pero sin actualizacion de posicion.

## Verificacion express (menos de 2 minutos)
1. Confirmar que el telefono tiene GPS y datos moviles encendidos.
2. Verificar que la app de repartidor tiene permiso de ubicacion en "Permitir siempre" o "Permitir mientras se usa".
3. Confirmar que el repartidor sigue autenticado en la app (sin sesion vencida).
4. Pedir al repartidor moverse al menos 100 metros y esperar 30 a 60 segundos.

## Checklist tecnico en telefono Android
1. Abrir Ajustes > Ubicacion > activar "Alta precision".
2. Revisar bateria:
- Quitar ahorro de energia para la app.
- Permitir actividad en segundo plano.
3. Revisar permisos de la app:
- Ubicacion precisa activada.
- Internet permitido.
4. Forzar refresco de sesion:
- Cerrar sesion y volver a iniciar.

## Checklist tecnico en backend/panel
1. Revisar en Render si hay errores de autenticacion de driver:
- AUTH ERROR Driver
2. Revisar en Render errores de escritura:
- DB ERROR Location
3. Revisar en Render errores de ETA:
- ETA ERROR
4. Confirmar en RTDB:
- repartidores/{uid}/currentLocation debe tener lat, lng, updatedAt.
- pedidos_en_camino/{pedidoId}/driverLocation debe tener lat, lng, driverUid, updatedAt.

## Causas frecuentes y accion inmediata
1. Sin permiso de ubicacion:
- Accion: habilitar permiso y reabrir app.
2. Token desactualizado (403):
- Accion: cerrar sesion / iniciar sesion para refrescar claims.
3. GPS congelado por ahorro de bateria:
- Accion: excluir app de optimizacion de bateria.
4. Datos moviles inestables:
- Accion: cambiar entre Wi-Fi y datos; reintentar envio.

## Prueba de campo recomendada (Tuxtla)
1. Iniciar pedido EN_CAMINO real o de prueba.
2. Recorrer al menos 1 km.
3. Verificar en panel:
- El marcador se mueve.
- ETA se actualiza.
- Folio se vuelve dorado cerca de 500 m.
- Suena doble pitido de proximidad a menos de 3 minutos.

## Cuando escalar a soporte tecnico
Escalar si, despues de 10 minutos y siguiendo la guia:
- No se actualiza currentLocation en RTDB.
- Hay errores repetitivos en Render de auth o DB.
- El dispositivo reporta GPS activo pero sin cambios de coordenadas.

## Informacion minima para soporte
- UID del repartidor
- PedidoId
- Hora aproximada del incidente
- Captura de pantalla de permisos de ubicacion
- Operador de red movil
