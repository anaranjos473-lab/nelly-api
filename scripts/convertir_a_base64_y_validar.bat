echo Archivo convertido a base64: %ARCHIVO_SALIDA%
echo Todos los tests pasaron correctamente.
@echo off
REM Script por Nelly-Ops: Convierte archivo a base64 y valida tests
REM Uso: convertir_a_base64_y_validar.bat archivo_entrada.ext archivo_salida.txt

if "%~2"=="" (
  echo Uso: convertir_a_base64_y_validar.bat archivo_entrada archivo_salida
  exit /b 1
)

setlocal enabledelayedexpansion
set "ARCHIVO_ENTRADA=%~1"
set "ARCHIVO_SALIDA=%~2"


REM Leer el archivo y detectar si ya es base64 (solo caracteres base64 y longitud múltiplo de 4)
set "IS_BASE64=0"
for /f "usebackq delims=" %%A in ("%ARCHIVO_ENTRADA%") do (
  echo %%A | findstr /R /C:"^[A-Za-z0-9+/=]*$" >nul
  if !errorlevel! equ 0 (
    set /a "LEN=0"
    set "LINE=%%A"
    for /l %%i in (12,1,4096) do if not "!LINE:~%%i,1!"=="" set /a LEN=%%i+1
    set /a "LEN=!LEN!+1"
    set /a "MOD=!LEN! %% 4"
    if !MOD! equ 0 set "IS_BASE64=1"
  )
)

if !IS_BASE64! equ 1 (
  copy /y "%ARCHIVO_ENTRADA%" "%ARCHIVO_SALIDA%" >nul
  echo ℹ️ El archivo ya está en base64, no se recodifica.
  REM Validar que sea JSON válido
  powershell -Command "try { [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String((Get-Content -Raw '%ARCHIVO_SALIDA%'))) | ConvertFrom-Json | Out-Null; exit 0 } catch { exit 2 }"
  if errorlevel 2 (
    echo ❌ El archivo parece base64 pero no es un JSON válido.
    exit /b 2
  )
) else (
  powershell -Command "try { Get-Content -Raw '%ARCHIVO_ENTRADA%' | ConvertFrom-Json | Out-Null; exit 0 } catch { exit 2 }"
  if errorlevel 2 (
    echo ❌ El archivo de entrada no es JSON válido.
    exit /b 2
  )
  powershell -Command "[Convert]::ToBase64String([IO.File]::ReadAllBytes('%ARCHIVO_ENTRADA%'))" > "%ARCHIVO_SALIDA%"
  if errorlevel 1 (
    echo Error en la conversión a base64
    exit /b 2
  )
  echo Archivo convertido a base64: %ARCHIVO_SALIDA%
)

REM Validar vigencia de la credencial (solo advertencia)
powershell -Command "try { $json = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String((Get-Content -Raw '%ARCHIVO_SALIDA%'))) | ConvertFrom-Json; if ($json.client_email) { Write-Host 'client_email detectado:' $json.client_email }; if ($json.created_at) { $fecha = Get-Date $json.created_at; $dias = (New-TimeSpan -Start $fecha -End (Get-Date)).Days; if ($dias -gt 365) { Write-Warning 'La credencial tiene más de 1 año, podría estar expirada.' } } } catch {}"

REM Ejecutar tests con FIREBASE_ADMIN_JSON del archivo generado
set /p BASE64GENERADO=<%ARCHIVO_SALIDA%
set "FIREBASE_ADMIN_JSON=%BASE64GENERADO%"
cmd /c "set FIREBASE_ADMIN_JSON=%FIREBASE_ADMIN_JSON% && npm test"
if errorlevel 1 (
  echo Al menos un test falló.
  exit /b 3
)
echo Todos los tests pasaron correctamente.
