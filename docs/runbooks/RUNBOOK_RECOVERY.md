# RUNBOOK_RECOVERY.md

## Objetivo

Recuperar un entorno roto sin reconstruir el sistema desde cero.

## Recuperación Backend

1. Revisar logs del proceso.
2. Confirmar variables de entorno.
3. Validar Firebase Admin y reglas.
4. Ejecutar validaciones.
5. Reiniciar servicio.
6. Verificar endpoints críticos.

## Recuperación Android

1. Confirmar APK correcto.
2. Validar sesión Firebase.
3. Revisar permisos.
4. Confirmar que el UID de prueba sea el esperado.
5. Ejecutar una corrida corta de verificación.

## Recuperación Firebase

1. Validar `firebase.json`.
2. Validar `security_rules.json` y `database.rules.json`.
3. Verificar que las rutas canónicas sigan intactas.
4. Revisar si el problema es de lectura, escritura o reglas.

## Recuperación Panel

1. Confirmar que el panel apunta al backend correcto.
2. Revisar autenticación del usuario administrador.
3. Confirmar que el endpoint esperado existe.
4. Verificar si el fallo es de contrato o de despliegue.

## Recuperación de Datos

1. Revisar `DATA_MODEL.md`.
2. Validar qué rama es canónica.
3. Evitar escribir en ramas legadas si el canon ya existe.
4. Restaurar solo la entidad afectada.

## Regla

Recuperar el mínimo necesario para volver a un estado verificable. No expandir el alcance durante la restauración.

