# PILOTO_001_BASELINE

## Propósito
Establecer un punto de partida oficial y no negociable para arrancar el piloto.

## Regla de oro
Todo inicio de prueba debe pasar por este baseline, sin excepciones.

- 1 conductor piloto
- 1 Motorola
- 1 restaurante
- 1 pedido por ciclo
- RTDB limpia de pedidos anteriores
- No cambiar código durante la prueba
- Registrar cada ciclo exitoso
- Documentar cada incidente reproducible

## Elementos certificados (no tocar)

- Backend `dispatch-order`, `accept-order`, `complete-order`
- RTDB como fuente de verdad: `pedidos/{id}`
- Flujo Cocina → Reparto → Entrega
- Panel de cocina ya no permite finalizar pedidos en `LISTO`
- Driver durante pedido aceptado: `YA ESTOY EN LA TIENDA`, `PEDIDO ABORDO`, `FINALIZAR`, regreso a espera

## Problemas pendientes

### Problema 1: pedidos históricos

- Hay basura histórica mezclada con pedidos reales.
- Esto contamina auditorías y diagnósticos.
- Antes del piloto debe crearse un entorno limpio.

### Problema 2: variabilidad de conductor

- No puede haber múltiples UIDs/confusiones de cuenta.
- Solo un conductor piloto debe operar: `DR-001`.
- No cambiar de cuenta durante el piloto.

## Configuración inicial del piloto

### RTDB esperada

```
pedidos
  PED_TEST_001

pedidos_para_reparto
  PED_TEST_001
```

Sin otros pedidos en `pedidos`, `pedidos_para_reparto`, `pedidos_en_camino` o `repartidores/*/pedido_activo`.

### Conductor piloto

```
repartidores/8mo8182LJsgV7vKMSpiCekFKAG23/codigo = DR-001
```

### Resultado operativo esperado

- El panel muestra `DR-001`
- El backend sigue usando `8mo8182LJsgV7vKMSpiCekFKAG23`
- El pedido LISTO debe aparecer como misión disponible en el teléfono

## Ciclo de prueba único

1. Admin crea pedido
2. Cocina pone pedido en `LISTO`
3. Motorala recibe nueva misión
4. Acepta pedido
5. Pedido pasa a `EN_CURSO`
6. Tracking se activa
7. Pedido se entrega
8. Repartidor vuelve a estado de espera

## Criterios de éxito

- Repetir el ciclo cinco veces seguidas sin intervención de código
- Si falla, abrir incidente con:
  1. descripción del síntoma
  2. evidencia en RTDB
  3. nota de qué se probó
  4. commit pequeño si el código cambia

## Reglas en caso de incidente

- No comenzar un nuevo ciclo hasta entender por qué falló el anterior.
- No mezclar pedidos históricos con el pedido de prueba.
- No agregar estados o filtros nuevos de emergencia.

## Nota de estabilización

Este baseline es la única forma autorizada de arrancar el piloto. Si alguien quiere empezar, debe hacerlo desde aquí y no desde un conjunto de condiciones diferentes.
## Checkpoint vivo - 2026-07-10 03:05 America/Mexico_City

### Regla de continuidad

- Este archivo es el punto de reentrada si se agota la sesion o entra otra persona.
- Guardar cada paso operativo aqui antes o despues de ejecutarlo.
- Si la app Android se cierra o vuelve a login, NO automatizar credenciales por ADB. Dejar que Alberto ingrese usuario y contrasena manualmente.
- No commitear `.idea/deploymentTargetSelector.xml`; es estado local de Android Studio/dispositivo.

### Cambio ya subido

- Repo Android real: `C:\Users\hp14\AndroidStudioProjects\NellyDriver`
- Rama: `master`
- Commit subido: `0bf0d0f Fix camera permission before delivery evidence`
- Motivo: evitar crash al tocar `CAPTURAR EVIDENCIA` cuando Android no habia concedido permiso `CAMERA`.
- APK debug compilada e instalada en telefono `ZY22KQKPS4`.

### Estado observado en telefono

- App al frente: `com.example.nellydriver/.MainActivity`
- Pantalla visible: mision activa.
- Textos visibles:
  - `MXN$129.00`
  - `DIRIGETE A LA TIENDA`
  - `ESPERANDO 'LUZ VERDE' DE UBICACION (CLIENTE)`
  - Boton: `YA ESTOY EN LA TIENDA`
- No hay crash reciente de `AndroidRuntime` asociado al fix de camara.
- Firebase RTDB esta conectado; logcat muestra listeners activos.

### Hipotesis actual

- La app no esta cerrada: esta atascada en el subestado inicial de pedido.
- El boton `YA ESTOY EN LA TIENDA` llama `MainViewModel.reportarLlegadaTienda(pedidoId)`.
- Ese metodo solo escribe `pedidos/{pedidoId}/estado = LLEGUE_A_TIENDA`.
- El backend/web usa tambien `estado_pedido` y rutas auxiliares (`pedidos_en_camino`), por lo que puede quedar inconsistente o no avanzar segun el listener.

### Siguiente paso inmediato

1. Identificar el `pedidoId` activo del UID logueado en el telefono.
2. Verificar en RTDB:
   - `pedidos/{pedidoId}/estado`
   - `pedidos/{pedidoId}/estado_pedido`
   - `pedidos_en_camino/{pedidoId}`
   - `repartidores/{uid}/pedido_activo`
3. Corregir el codigo Android para que los subestados de tracking escriban campos canonicos y de compatibilidad:
   - `estado`
   - `estado_pedido`
   - `logistica/estado`
   - `timestampActualizacion`
4. Compilar, instalar, probar con ADB/UI.
5. Si el pedido actual ya quedo colgado, rescatarlo en RTDB a un estado coherente antes de seguir el piloto.

## Checkpoint vivo - 2026-07-10 03:45 America/Mexico_City

### Estado guardado antes de continuar

- Alberto ingreso manualmente de nuevo despues de reinstalar APK. No automatizar credenciales por ADB.
- Telefono: `ZY22KQKPS4`.
- App/package: `com.example.nellydriver`.
- Repo Android real: `C:\Users\hp14\AndroidStudioProjects\NellyDriver`.
- Archivo Android tocado: `app/src/main/java/com/example/nellydriver/MainViewModel.kt`.
- APK debug compilada e instalada correctamente despues del parche.
- Comando de validacion ejecutado: `.\gradlew.bat assembleDebug`.
- Resultado: `BUILD SUCCESSFUL`.
- Warning no bloqueante observado: Elvis operator siempre devuelve operando izquierdo en `MainViewModel.kt:690`.

### Cambio Android aplicado

- `reportarLlegadaTienda`, `reportarPedidoAbordo` y `reportarLlegadaCliente` ya no escriben solo `estado`.
- Ahora llaman a `actualizarEstadoPedidoOperativo(pedidoId, estado)`.
- Ese helper escribe en `pedidos/{pedidoId}`:
  - `estado`
  - `estado_pedido`
  - `logistica/estado`
  - `timestampActualizacion`
- `aceptarPedidoRTDB` y `finalizarPedido` tambien usan escritura compatible para `estado`, `estado_pedido` y `logistica/estado`.
- `pedidos_en_camino/{pedidoId}` queda como escritura best-effort via `actualizarPedidosEnCaminoBestEffort`; si RTDB responde `Permission denied`, solo registra warning y no rompe el flujo.

### Evidencia ya observada

- Pedido piloto visible: `C3_1_DRIVER_LISTO_1782816297339`.
- UID driver observado en la app: `8mo8182LJsgV7vKMSpiCekFKAG23`.
- Tras tocar `YA ESTOY EN LA TIENDA`, la UI avanzo a `COMPRA EN CURSO`.
- Tras tocar `PEDIDO ABORDO`, RTDB confirmo:
  - `pedidos/C3_1_DRIVER_LISTO_1782816297339/estado = PEDIDO_ABORDO`
  - `pedidos/C3_1_DRIVER_LISTO_1782816297339/estado_pedido = PEDIDO_ABORDO`
  - `pedidos/C3_1_DRIVER_LISTO_1782816297339/logistica/estado = PEDIDO_ABORDO`
- La UI avanzo a `ENTREGA EN TRAYECTO`.
- Boton visible siguiente: `LLEGUÉ CON EL CLIENTE`.
- `pedidos_en_camino/C3_1_DRIVER_LISTO_1782816297339` fallo con `Permission denied`, pero el pedido canonico en `pedidos/*` quedo correcto.

### Siguiente paso inmediato si se corta la sesion

1. No tocar credenciales. Si la app esta en login, esperar a que Alberto ingrese manualmente.
2. Confirmar pantalla con ADB:
   - `adb shell uiautomator dump /sdcard/window.xml`
   - buscar `LLEGUÉ CON EL CLIENTE`, `CAPTURAR EVIDENCIA` o `FINALIZAR`.
3. Si sigue visible `LLEGUÉ CON EL CLIENTE`, limpiar logs y tocar el boton:
   - `adb logcat -c`
   - `adb shell input tap 540 1939`
4. Esperar 4 segundos, revisar UI y logcat.
5. Confirmar que `pedidos/C3_1_DRIVER_LISTO_1782816297339` quede coherente:
   - `estado = LLEGUE_A_CLIENTE`
   - `estado_pedido = LLEGUE_A_CLIENTE`
   - `logistica/estado = LLEGUE_A_CLIENTE`
6. Continuar con evidencia/finalizacion solo despues de confirmar que la UI avanzo.
