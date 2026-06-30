# Handoff operativo - Driver 5.0.0-PRO

Fecha: 2026-06-30

## Estado certificado

El Driver correcto es el APK generado desde este workspace:

- Proyecto: `C:\Users\hp14\OneDrive\Desktop\nelly`
- APK: `app/build/outputs/apk/debug/app-debug.apk`
- Package: `com.example.nellydriver`
- `versionCode`: `5`
- `versionName`: `5.0.0-PRO`
- Device real validado: Motorola `ZY22KQKPS4`
- Launcher correcto: `com.nelly.driver.ui.pedidos.PedidosDisponiblesActivity`

Validacion ADB realizada:

```text
adb -s ZY22KQKPS4 shell cmd package resolve-activity --brief com.example.nellydriver
com.example.nellydriver/com.nelly.driver.ui.pedidos.PedidosDisponiblesActivity

adb -s ZY22KQKPS4 shell dumpsys package com.example.nellydriver
versionCode=5
versionName=5.0.0-PRO
```

La pantalla correcta es `PedidosDisponiblesActivity`. En esta pantalla existen varios botones `btnAceptar` visibles/clicables para pedidos `LISTO`.

## Punto critico para no confundirse

Si el dispositivo abre:

```text
com.example.nellydriver/com.example.nellydriver.MainActivity
```

entonces NO esta corriendo la APK correcta de este workspace, o esta viendo una pantalla vieja/operacion activa. En esa pantalla puede aparecer un pedido de `MXN$129.00` sin boton `ACEPTAR`; eso no certifica la lista de pedidos disponibles.

La APK correcta debe resolver el launcher a:

```text
com.example.nellydriver/com.nelly.driver.ui.pedidos.PedidosDisponiblesActivity
```

## Fix aplicado

Commit base:

```text
1231b16 Fix Android pedido cliente mapper
```

Incluye:

- Mapper Android tolerante para `cliente` como string.
- Mapper Android tolerante para `cliente` como objeto (`cliente.nombre`, `cliente.nombreCompleto`, `cliente.name`).
- `versionCode 5` y `versionName "5.0.0-PRO"`.
- Tema Android requerido para arrancar la pantalla nativa.

Este cambio elimina el error:

```text
Failed to convert value of type java.util.HashMap to String
```

## Como retomar desde cualquier sesion

1. Confirmar dispositivo:

```powershell
C:\Users\hp14\AppData\Local\Android\Sdk\platform-tools\adb.exe devices
```

Debe aparecer:

```text
ZY22KQKPS4    device
```

Si hay emulador conectado, usar siempre `-s ZY22KQKPS4`.

2. Compilar APK si hace falta:

```powershell
C:\Users\hp14\.gradle\wrapper\dists\gradle-8.10-bin\deqhafrv1ntovfmgh0nh3npr9\gradle-8.10\bin\gradle.bat assembleDebug
```

3. Instalar en Motorola real:

```powershell
C:\Users\hp14\AppData\Local\Android\Sdk\platform-tools\adb.exe -s ZY22KQKPS4 install -r app\build\outputs\apk\debug\app-debug.apk
```

4. Verificar que el launcher sea el correcto:

```powershell
C:\Users\hp14\AppData\Local\Android\Sdk\platform-tools\adb.exe -s ZY22KQKPS4 shell cmd package resolve-activity --brief com.example.nellydriver
```

Resultado esperado:

```text
com.example.nellydriver/com.nelly.driver.ui.pedidos.PedidosDisponiblesActivity
```

5. Abrir app:

```powershell
C:\Users\hp14\AppData\Local\Android\Sdk\platform-tools\adb.exe -s ZY22KQKPS4 shell monkey -p com.example.nellydriver -c android.intent.category.LAUNCHER 1
```

6. Confirmar pantalla activa:

```powershell
C:\Users\hp14\AppData\Local\Android\Sdk\platform-tools\adb.exe -s ZY22KQKPS4 shell dumpsys window | Select-String -Pattern "mCurrentFocus|PedidosDisponiblesActivity|MainActivity"
```

Debe verse:

```text
com.nelly.driver.ui.pedidos.PedidosDisponiblesActivity
```

7. Confirmar boton `ACEPTAR`:

```powershell
C:\Users\hp14\AppData\Local\Android\Sdk\platform-tools\adb.exe -s ZY22KQKPS4 shell dumpsys activity top | Select-String -Pattern "btnAceptar|Pedido #|LISTO|txtMonto|txtCliente"
```

Debe aparecer:

```text
app:id/btnAceptar
```

## Nota sobre permisos RTDB

Puede seguir apareciendo `Permission denied` en rutas auxiliares como `repartidores_activos/...`. Eso no fue el bloqueo del render de pedidos. El flujo principal validado es:

```text
Backend -> RTDB -> Driver listener -> mapper Android -> PedidosDisponiblesActivity -> boton ACEPTAR
```

Las reglas RTDB auxiliares se deben revisar despues, sin mezclarlo con el fix del mapper.

## Archivos locales no versionados

Pueden quedar evidencias locales sin commit:

- `screen_*.png`
- `window_*.xml`
- `app/build/`

No son requeridos para retomar. La fuente de verdad es este handoff, el commit `1231b16`, y la verificacion ADB del launcher correcto.
