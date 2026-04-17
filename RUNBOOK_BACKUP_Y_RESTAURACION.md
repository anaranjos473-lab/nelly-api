# Runbook de Backup y Restauracion

## Objetivo
Estandarizar la prueba de estres del workflow de respaldo y la verificacion mensual de restauracion.

## A. Prueba de estres del workflow (hoy)

1. Ir a GitHub Actions.
2. Seleccionar el workflow Admin: Respaldo Semanal de Datos.
3. Ejecutar Run workflow.

### Criterios de exito
- Se crea un archivo nuevo en backups con formato:
  - backup-rtdb-YYYY-MM-DD.json
- El workflow hace commit y push en la rama principal.
- El job termina en estado success.

### Validaciones clave
- FIREBASE_ADMIN_JSON se parsea correctamente.
- FIREBASE_DATABASE_URL apunta al proyecto correcto.
- El archivo de backup no esta vacio.

### Fallas comunes y accion inmediata
1. Error de parseo FIREBASE_ADMIN_JSON:
- Revisar que el secret sea JSON completo o base64 valido, no una ruta.
2. Error de permisos al hacer push:
- Confirmar permissions.contents: write en el workflow.
3. Sin commit generado:
- Puede ser normal si no hubo cambios o se podaron archivos sin diferencia final.

## B. Verificacion mensual de restauracion

### Frecuencia
- Primer lunes de cada mes.

### Procedimiento
1. Descargar el ultimo backup desde backups.
2. Crear o usar proyecto Firebase de Staging/Test.
3. Importar el JSON en RTDB del entorno de prueba.
4. Validar datos clave:
- pedidos
- pedidos_para_reparto
- pedidos_en_camino
- repartidores
- pagos_confirmados
5. Confirmar que panel y flujo de pedidos se visualizan correctamente en test.

### Criterio de exito mensual
- El backup se importa sin errores.
- Los nodos criticos existen y tienen estructura esperada.
- El panel de test refleja datos de forma consistente.

## C. Evidencia recomendada
- Captura del run exitoso en Actions.
- Hash o tamano del backup descargado.
- Checklist firmada con fecha y responsable.

## D. Escalamiento
Escalar a soporte tecnico si:
- No se puede ejecutar backup en dos intentos consecutivos.
- La restauracion mensual falla por integridad o formato.
- Falta cualquier nodo critico en el backup resultante.
