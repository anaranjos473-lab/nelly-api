@echo off
cd /d "c:\Users\hp14\OneDrive\Desktop\nelly"

echo Renombrando alerta.mp3.mpeg a alerta.mp3...
rename "public\alerta.mp3.mpeg" "alerta.mp3"

echo Verificando...
if exist "public\alerta.mp3" (
    echo OK: public\alerta.mp3 listo
) else (
    echo ERROR: No se pudo renombrar. Hazlo manualmente.
    pause & exit /b 1
)

echo.
echo Commiteando y subiendo...
git add public\alerta.mp3 .gitignore
git commit -m "fix: rename alerta.mp3.mpeg to alerta.mp3 for browser MIME compatibility

El elemento Audio() en panel.html referencia 'alerta.mp3'.
Extension doble .mp3.mpeg causa 404 en produccion.

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
git push origin main

echo.
echo LISTO. Audio corregido y desplegado.
pause
