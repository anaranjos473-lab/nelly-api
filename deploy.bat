@echo off
setlocal
cd /d "c:\Users\hp14\OneDrive\Desktop\nelly"

echo ============================================================
echo  NELLY v1.0 - Despliegue Total Firebase
echo ============================================================
echo.

echo [1/3] npm install...
call npm install --silent
echo.

echo [2/3] Validando agentes...
node tests/agents/auditor-runner.mjs
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Agentes fallaron. Deploy cancelado.
    pause & exit /b 1
)
echo.

echo [3/3] Desplegando a Firebase...
npx firebase deploy --only firestore:rules,database:rules,hosting --project nelly-delivery

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Si falla con "not logged in", ejecuta primero:
    echo   npx firebase login
    echo Luego vuelve a correr este bat.
    pause & exit /b 1
)

echo.
echo ============================================================
echo  DEPLOY EXITOSO
echo ============================================================
echo  Panel:   https://nelly-delivery.web.app
echo  Render:  https://dashboard.render.com  (revisar logs)
echo.
echo  En logs de Render busca:
echo    [AUTH] Token generado exitosamente
echo    ETA actualizado
echo ============================================================
pause
