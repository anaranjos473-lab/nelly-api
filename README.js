## Mantenimiento y Operaciones

Para ajustar la política de escalamiento de alertas CI/CD, consulta la guía oficial:

- [Guía de Escalado de Alertas](./RUNBOOK_AJUSTE_POLITICA_ESCALAMIENTO.md)

Esta sección te permite modificar la frecuencia de escalamiento sin editar código, siguiendo las mejores prácticas de operación.

### Signed APK en GitHub Actions

Workflow: [Android Signed APK](./.github/workflows/android-signed-apk.yml)

Secrets requeridos:
- ANDROID_KEYSTORE_BASE64
- ANDROID_KEYSTORE_PASSWORD
- ANDROID_KEY_ALIAS
- ANDROID_KEY_PASSWORD

Ejecucion:
1. Ir a GitHub Actions.
2. Ejecutar manualmente el workflow Android Signed APK.
3. Descargar el artefacto signed-apk al finalizar.

Nota:
- Si el repo no tiene gradlew y archivos Gradle del modulo app, el workflow se detiene con mensaje claro.

### Signed AAB en GitHub Actions (Play Console)

Workflow: [Android Signed AAB](./.github/workflows/android-signed-aab.yml)

Secrets requeridos:
- ANDROID_KEYSTORE_BASE64
- ANDROID_KEYSTORE_PASSWORD
- ANDROID_KEY_ALIAS
- ANDROID_KEY_PASSWORD

Ejecucion:
1. Ir a GitHub Actions.
2. Ejecutar manualmente el workflow Android Signed AAB.
3. Descargar el artefacto signed-aab al finalizar para publicacion en Play Console.

Nota:
- Si el repo no tiene gradlew y archivos Gradle del modulo app, el workflow se detiene con mensaje claro.

# nelly-api

## Firebase Admin seguro (sin subir JSON al repositorio)

Para que el proyecto funcione en la nube sin versionar credenciales:

1. Abre tu archivo de service account JSON en VS Code o Bloc de notas.
2. Selecciona y copia todo el contenido del JSON.
3. En GitHub ve a Settings > Secrets and variables > Actions.
4. Crea un secreto nuevo con:
	- Name: FIREBASE_ADMIN_JSON
	- Secret: pega el contenido completo del JSON
5. Despliega nuevamente.

### Limpieza de seguridad obligatoria

Después de guardar el secret en GitHub:

1. Elimina el archivo JSON de Descargas y de cualquier carpeta temporal local.
2. Verifica que no esté versionado con `git status`.
3. Si alguna vez se subió, rota la clave en Firebase y vuelve a generar credencial.

### Nota de ejecución

El backend ya soporta `FIREBASE_ADMIN_JSON` como variable de entorno para inicializar Firebase Admin.
