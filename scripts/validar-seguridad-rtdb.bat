@echo off
setlocal

cd /d %~dp0\..
echo [1/4] Verificando Java...
java -version > security_test_run.log 2>&1
if errorlevel 1 (
  set "JAVA_EXE="
  for /f "delims=" %%F in ('where /r "C:\Program Files" java.exe 2^>nul') do (
    if not defined JAVA_EXE set "JAVA_EXE=%%F"
  )
  for /f "delims=" %%F in ('where /r "C:\Program Files (x86)" java.exe 2^>nul') do (
    if not defined JAVA_EXE set "JAVA_EXE=%%F"
  )
  if defined JAVA_EXE (
    for %%D in ("%JAVA_EXE%") do set "JAVA_HOME=%%~dpD.."
    set "PATH=%JAVA_HOME%\bin;%PATH%"
    java -version >> security_test_run.log 2>&1
  )
)

java -version >nul 2>&1
if errorlevel 1 (
  echo ERROR: Java no esta disponible en PATH.
  echo Instala OpenJDK 17 y reintenta.
  type security_test_run.log
  exit /b 1
)

echo [2/4] Limpiando logs previos de validacion...
del /q logs_pruebas\security_validation_*.json 2>nul

echo [3/4] Ejecutando prueba DENY (bloqueado_por_deuda=true)...
echo ==== START_DENY ==== >> security_test_run.log
call .\node_modules\.bin\firebase.cmd emulators:exec --project demo-nelly-security --only database "node tests/security/rtdb-deuda-permission.integration.js" >> security_test_run.log 2>&1
set DENY_EXIT=%ERRORLEVEL%
echo ==== END_DENY EXITCODE=%DENY_EXIT% ==== >> security_test_run.log

echo [3b] Ejecutando prueba ALLOW (bloqueado_por_deuda=false)...
echo ==== START_ALLOW ==== >> security_test_run.log
call .\node_modules\.bin\firebase.cmd emulators:exec --project demo-nelly-security --only database "node tests/security/rtdb-deuda-allow.integration.js" >> security_test_run.log 2>&1
set ALLOW_EXIT=%ERRORLEVEL%
echo ==== END_ALLOW EXITCODE=%ALLOW_EXIT% ==== >> security_test_run.log

echo [4/4] Mostrando evidencia...
if exist logs_pruebas\security_validation_*.json (
  dir /b /o:-d logs_pruebas\security_validation_*.json
  for /f "delims=" %%F in ('dir /b /o:-d logs_pruebas\security_validation_*.json') do (
    echo ===== CONTENIDO DE %%F =====
    type logs_pruebas\%%F
    goto :done
  )
) else (
  echo No se genero log security_validation_*.json
  echo ===== OUTPUT TECNICO =====
  type security_test_run.log
  exit /b 1
)

:done
echo ===== OUTPUT TECNICO =====
type security_test_run.log
exit /b 0
