# Seguridad y protección de inteligencia Nelly

## Cambios recientes (2026-05-07)
- La inicialización de Firebase en el panel ahora se realiza vía endpoint seguro `/api/public/firebase-config`.
- No se expone ningún secreto ni apiKey sensible en el cliente.
- La lógica de inteligencia, listeners y sincronización de estados permanece intacta y protegida.

## Nota para desarrolladores
- Si necesitas acceder a la configuración de Firebase, usa el endpoint seguro y nunca hardcodees valores en el cliente.
- La inteligencia de Nelly (listeners, debouncing, sincronía de estados) sigue siendo el núcleo y no se elimina ni debilita con este refactor.
# Consejo Nelly-Ops: Checklist de Onboarding Rápido

1. No tocar NellyCalculator ni la comisión del 18%.
2. Nunca exponer ORDER_INGEST_API_KEY, FIREBASE_ADMIN_JSON ni URLs sensibles.
3. Usar process.env para todos los secretos.
4. Mantener sincronía de estados: pendiente, en_reparto, entregado.
5. Optimizar Firebase (listeners granulares, consultas acotadas) y entregar solo diagnóstico, código y justificación breve.

Este checklist es obligatorio para todo colaborador y agente IA en el ecosistema Nelly Delivery.

# Checklist obligatorio de integridad y seguridad Nelly

**Estas reglas deben cumplirse siempre para evitar errores, fugas o regresiones:**

1. Sincronía de claves y variables sensibles
   - [ ] ORDER_INGEST_API_KEY y otras claves deben ser idénticas en local.properties, Render y GitHub Actions.
   - [ ] Si se actualiza una clave, replicar el cambio en todos los entornos.

2. Seguridad y confidencialidad
   - [ ] Nunca exponer claves ni secrets en archivos públicos (public/, panel, JS del frontend).
   - [ ] No modificar la lógica de NellyCalculator ni la comisión del 18%.
   - [ ] Archivos sensibles y de entorno deben estar en .gitignore.

3. Despliegue y validación
   - [ ] Revisar logs del backend tras cada despliegue (Render dashboard > Logs).
   - [ ] Probar endpoints de diagnóstico: /api/diagnostico/conductores y /api/diagnostico/pedidos.
   - [ ] Validar que no existan errores 401 ni fugas de información.

4. Listeners y sincronización de estados
   - [ ] Listeners de Firebase deben ser granulares (ej. solo pedidos 'pendiente').
   - [ ] Limpiar/desuscribir listeners al cerrar procesos o recargar páginas.
   - [ ] Validar que los estados de pedidos se reflejen en tiempo real en panel y app.

5. Buenas prácticas de desarrollo
   - [ ] No dejar código de debugging ni logs de claves en producción.
   - [ ] Mantener actualizado este checklist y revisarlo antes de cada merge o despliegue.

---
**Cualquier incumplimiento puede causar errores críticos, fugas de datos o bloqueos en producción.**

# Sincronización de ORDER_INGEST_API_KEY

1. **Render (Producción):**
   - Ve a tu dashboard de Render.
   - Entra a tu servicio backend.
   - En Environment > Add Environment Variable:
     - Key: `ORDER_INGEST_API_KEY`
     - Value: (copia el valor exacto de local.properties)
   - Guarda y reinicia el servicio.

2. **GitHub Actions (CI/CD):**
   - Ve a tu repositorio en GitHub.
   - Settings > Secrets and variables > Actions.
   - Agrega o edita el secret:
     - Name: `ORDER_INGEST_API_KEY`
     - Value: (mismo valor que en Render y local.properties)

3. **Verificación:**
   - El valor debe ser idéntico en los tres lugares.
   - Si hay error 401, revisa los logs generados por el middleware de headers.

# Troubleshooting Error 401 (API Key)

- Verifica que el header `x-api-key` se envía correctamente desde el cliente/test.
- Usa los logs de headers para comparar el valor recibido vs el esperado.
- Si el valor no coincide, revisa variables de entorno y secrets.
- Si el valor está vacío, revisa la carga de local.properties y configuración de entorno.
- Si todo está correcto y persiste el error, reinicia el backend y vuelve a probar.
