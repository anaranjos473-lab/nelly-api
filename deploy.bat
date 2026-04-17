@echo off
setlocal enabledelayedexpansion
cd /d "c:\Users\hp14\OneDrive\Desktop\nelly"

echo ============================================================
echo  NELLY v1.0 - Despliegue Total a Firebase
echo  Firestore Rules + RTDB Rules + Hosting
echo ============================================================
echo.

:: Verificar firebase CLI
where firebase >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [!] firebase CLI no encontrado en PATH.
    echo     Intentando con npx...
    set FIREBASE_CMD=npx firebase
) else (
    set FIREBASE_CMD=firebase
)

:: Verificar sesion activa
echo [1/3] Verificando sesion Firebase...
%FIREBASE_CMD% projects:list --non-interactive >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo     No hay sesion activa. Ejecutando login...
    %FIREBASE_CMD% login
)
echo     OK
echo.

:: Validar agentes antes de desplegar
echo [2/3] Validando agentes antes del deploy...
node tests/agents/auditor-runner.mjs
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Los agentes fallaron. Corrige los errores antes de desplegar.
    pause & exit /b 1
)
echo     OK
echo.

:: Despliegue total
echo [3/3] Desplegando a Firebase (nelly-delivery)...
echo.
%FIREBASE_CMD% deploy --only firestore:rules,database:rules,hosting --project nelly-delivery

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: El despliegue fallo. Revisa los mensajes de arriba.
    pause & exit /b 1
)

echo.
echo ============================================================
echo  DESPLIEGUE EXITOSO
echo ============================================================
echo.
echo  Verifica en:
echo  - Panel:     https://nelly-delivery.web.app
echo  - Firebase:  https://console.firebase.google.com/project/nelly-delivery
echo  - Render:    https://dashboard.render.com  (logs)
echo.
echo  Busca en logs de Render:
echo    OK [AUTH] Token generado exitosamente
echo    OK ETA actualizado
echo.
pause
