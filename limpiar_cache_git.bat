@echo off
cd /d "c:\Users\hp14\OneDrive\Desktop\nelly"

echo ============================================================
echo  Limpieza de cache git + sincronizacion con .gitignore
echo ============================================================
echo.
echo [1/4] Eliminando todo del indice (SIN borrar archivos fisicos)...
git rm -r --cached .
echo.

echo [2/4] Re-agregando todo respetando .gitignore...
git add .
echo.

echo [3/4] Verificando que los duplicados quedaron fuera...
git status --short | findstr "panel.html firebase.js repartidores.json"
if %ERRORLEVEL% EQU 0 (
    echo ADVERTENCIA: Alguno de esos archivos aun aparece en el indice.
) else (
    echo OK: panel.html, firebase.js y repartidores.json NO estan en el indice.
)
echo.

echo [4/4] Creando commit de limpieza...
git commit -m "fix: sincronizar .gitignore y limpiar cache del indice

- panel.html (raiz) eliminado del rastreo
- firebase.js (raiz) eliminado del rastreo
- repartidores.json (PII) eliminado del rastreo
- Solo public/ contiene el panel canonico

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo.
echo [5/5] Subiendo a GitHub (activa deploy automatico)...
git push origin main

echo.
echo ============================================================
echo  LISTO. Ve a GitHub Actions para ver el deploy en curso.
echo  https://github.com/[tu-usuario]/nelly/actions
echo ============================================================
pause
