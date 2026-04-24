# Procedimiento para credenciales Firebase Admin en Nelly

## Diagnóstico
- Si la variable de entorno FIREBASE_ADMIN_JSON contiene un JSON multilinea, dotenv solo carga el primer carácter y la inicialización falla.
- El backend y scripts de test buscan primero FIREBASE_ADMIN_JSON, luego nelly-admin.json.

## Solución recomendada
1. No declares JSON multilinea en .env. Si usas base64, asegúrate que sea una sola línea.
2. Si tienes nelly-admin.json en el root (y está en .gitignore), puedes dejar FIREBASE_ADMIN_JSON vacío o sin definir.
3. El sistema usará automáticamente nelly-admin.json si la variable no existe o es inválida.

## Validación
- Ejecuta: node scripts/verificar-firebase-admin.js
- Si ves firebase_admin_ok, la configuración es válida.

## Pipeline
- El pipeline debe ejecutar este script antes de cualquier test o despliegue para evitar bloqueos por credenciales mal formateadas.

## Ejemplo de .env correcto:
FIREBASE_ADMIN_JSON=

## Ejemplo de comando de validación:
node scripts/verificar-firebase-admin.js

---

Este procedimiento asegura que la inicialización de Firebase Admin sea robusta y evita errores comunes por formato de credenciales.