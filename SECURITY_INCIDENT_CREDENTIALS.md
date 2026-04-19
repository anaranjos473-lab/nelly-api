# Runbook de Incidente: Filtracion de Credenciales

Objetivo: contener y erradicar una fuga de claves en el menor tiempo posible.

## 1. Contencion inmediata
- Revocar o rotar la clave expuesta en el proveedor afectado (Render, Firebase, OpenAI, etc.).
- Actualizar el valor en GitHub Secrets del repositorio.
- Forzar redeploy si la clave se usa en runtime.

## 2. Verificacion de alcance
- Identificar el commit, branch y PR donde aparecio la clave.
- Revisar forks y logs de CI para confirmar si hubo exposicion adicional.
- Registrar ventana de exposicion y sistemas potencialmente impactados.

## 3. Limpieza de historial Git
Opcion A (recomendada): git filter-repo
- Instalar git-filter-repo.
- Preparar archivo de reemplazo (replacements.txt) con patrones de secretos.
- Ejecutar limpieza del historial y forzar push del repositorio reescrito.

Opcion B: BFG Repo-Cleaner
- Ejecutar limpieza de strings sensibles con BFG.
- Ejecutar gc y forzar push del historial limpio.

Nota: ambos metodos reescriben historial. Coordinar con el equipo antes de forzar push.

## 4. Post-incidente
- Invalidar cualquier token/cookie derivado.
- Confirmar que los workflows usan Secrets y no valores hardcodeados.
- Ejecutar pruebas de humo y pipeline estricto para validar operacion.

## 5. Checklist de cierre
- Clave rotada en proveedor.
- Secret actualizado en GitHub.
- Historial saneado.
- Pipeline en verde.
- Evidencia documentada en acta interna.

## 6. Secrets criticos de Nelly CI/CD
- ORDER_INGEST_API_KEY
- RENDER_URL
- FIREBASE_DATABASE_URL
- FIREBASE_ADMIN_JSON
- FIREBASE_TOKEN
- WEBHOOK_URL
