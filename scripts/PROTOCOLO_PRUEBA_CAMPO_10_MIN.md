# Protocolo de Prueba en Campo (10 minutos)

Objetivo: validar que Nelly Driver release funciona de punta a punta en una orden real con sincronizacion correcta en panel y backend.

## Preparacion (min 0-1)
- Dispositivo del repartidor con APK release instalado y sesion iniciada.
- Panel abierto en pantalla de monitoreo con mapa de Tuxtla.
- Conexion a internet estable en telefono y panel.

## Paso 1. Inicio de turno (min 1-2)
- En la app, tocar Iniciar turno.
- Confirmar que el saldo y estado operativo cargan sin errores.

Resultado esperado:
- La app no se cierra.
- El repartidor queda disponible para recibir pedido.

## Paso 2. Asignacion y aceptacion de pedido (min 2-4)
- Generar o tomar un pedido real de prueba.
- Repartidor acepta el pedido en la app.

Resultado esperado:
- El pedido aparece en estado aceptado en la app.
- No hay mensajes de error de autorizacion.

## Paso 3. Validacion de rastreo en panel (min 4-6)
- Revisar en panel la orden recien aceptada.
- Confirmar que aparece el icono de la moto y la posicion se actualiza.

Resultado esperado:
- El pedido se refleja en panel con identificador valido.
- La geolocalizacion del repartidor es visible en el mapa.

## Paso 4. Finalizacion de pedido (min 6-8)
- Marcar entrega completada desde la app.
- Confirmar transicion al estado Finalizado.

Resultado esperado:
- Estado final sincronizado entre app y panel.
- No quedan estados intermedios atorados.

## Paso 5. Verificacion financiera y tecnica (min 8-10)
- Confirmar que el desglose de comision de 18% coincide con el total esperado.
- Confirmar que la orden llego al backend sin rechazos de autorizacion.

Resultado esperado:
- Calculo del 18% correcto.
- Sin errores 401 o 403 en el flujo.

## Evidencia minima (obligatoria)
- 1 captura de la app en aceptacion o finalizacion.
- 1 captura del panel con pedido y posicion.
- ID del pedido probado.
- Hora de inicio y hora de cierre de la prueba.

## Criterio Go/No-Go
Go:
- Flujo completo exitoso de aceptar a Finalizado.
- Geolocalizacion visible en panel.
- Comision de 18% correcta.
- Sin errores de autorizacion.

No-Go:
- Pedido no aparece en panel.
- Estado no llega a Finalizado.
- Comision incorrecta.
- Errores de autenticacion o caidas de app.

## Escalamiento rapido si falla
- Recolectar capturas y ID del pedido.
- Registrar hora exacta del fallo y paso donde ocurrio.
- Notificar a soporte tecnico con evidencia para revision de app, panel y backend.
