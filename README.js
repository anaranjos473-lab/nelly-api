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
