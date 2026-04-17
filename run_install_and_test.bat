@echo off
setlocal enabledelayedexpansion
cd /d "c:\Users\hp14\OneDrive\Desktop\nelly"

echo ============================================
echo  NELLY v1.0 - Suite de Validacion Final
echo ============================================
echo.

:: 1. Dependencias
echo [1/5] Instalando dependencias (npm install)...
call npm install --silent
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install fallo
    pause & exit /b 1
)
echo     OK
echo.

:: 2. Agente: Arquitectura
echo [2/5] Agente: Linter de Arquitectura...
node tests/agents/lint/architecture-lint.mjs
if %ERRORLEVEL% NEQ 0 ( set FAILED=1 ) else ( echo     OK )
echo.

:: 3. Agente: Comisiones
echo [3/5] Agente: Caja Negra Comisiones...
node tests/agents/business/commission-blackbox.test.mjs
if %ERRORLEVEL% NEQ 0 ( set FAILED=1 ) else ( echo     OK )
echo.

:: 4. Agente: Hosting / Deploy
echo [4/5] Agente: Checklist de Despliegue...
node tests/agents/hosting/deploy-checklist.mjs
if %ERRORLEVEL% NEQ 0 ( set FAILED=1 ) else ( echo     OK )
echo.

:: 5. Runner completo
echo [5/5] Runner completo (auditor-runner)...
node tests/agents/auditor-runner.mjs
if %ERRORLEVEL% NEQ 0 ( set FAILED=1 ) else ( echo     OK )
echo.

:: 6. Limpieza de duplicados
echo [+] Limpiando archivos duplicados en raiz...
if exist panel.html (
    del /f panel.html
    echo     Eliminado: panel.html (obsoleto - raiz)
)
if exist firebase.js (
    del /f firebase.js
    echo     Eliminado: firebase.js (obsoleto - raiz)
)
echo.

:: Resultado final
echo ============================================
if defined FAILED (
    echo  RESULTADO: FALLOS DETECTADOS - Revisar arriba
    echo ============================================
    pause
    exit /b 1
) else (
    echo  RESULTADO: TODAS LAS PRUEBAS PASARON OK
    echo ============================================
    echo.
    echo Siguiente paso: git push (ya realizado por Copilot)
    echo El primer repartidor puede encender la moto.
)
echo.
pause
