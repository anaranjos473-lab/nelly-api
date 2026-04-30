# Guía CI/CD y Diagnóstico Nelly Delivery

## 1. Flujo CI/CD (Integración Continua y Despliegue)

- **Pruebas automáticas:** Cada push o pull request a `main/master` ejecuta pruebas Jest sobre endpoints críticos (ej: consulta de token FCM).
- **Cobertura de código:** El pipeline exige mínimo 80% de cobertura. Si baja, el deploy se bloquea y se genera alerta.
- **Reporte HTML:** El resultado de cobertura se sube como artefacto descargable en cada ejecución de CI (Actions > workflow > Artifacts > cobertura-backend-html).
- **Despliegue automático:** Solo si las pruebas y cobertura pasan, se permite el deploy a Firebase Hosting y reglas.
- **Alertas:**
  - Slack: Si configuras el webhook, recibirás alertas automáticas ante fallos o baja cobertura.
  - Email: Listo para Mailgun/SendGrid, solo requiere dominio y secretos.

## 2. Diagnóstico y Soporte

- **Herramienta web interna:** `/soporte/verificar-token` permite consultar el token FCM de cualquier repartidor en tiempo real.
- **Script watcher:** `scripts/watch_token_change.js` monitorea y notifica en consola cada cambio de token FCM en RTDB.
- **Logging:** Cada consulta de token queda registrada en logs del backend con ID y timestamp.
- **Validación:** El backend valida formato de token y advierte si es inválido.

## 3. Visualización de Reportes

1. Ve a la pestaña "Actions" en GitHub.
2. Selecciona el workflow de CI/CD.
3. Descarga el artefacto `cobertura-backend-html`.
4. Abre `coverage/lcov-report/index.html` en tu navegador.

## 4. Activar alertas por email/Slack

- **Slack:** Agrega el webhook en Settings > Secrets > SLACK_WEBHOOK_URL.
- **Email:** Cuando tengas dominio, agrega MAILGUN_API_KEY, MAILGUN_DOMAIN y MAILGUN_TO.

## 5. Extensión y mantenimiento

- Puedes agregar más tests en `tests/` para mejorar la cobertura.
- El pipeline es extensible para nuevos diagnósticos, endpoints y alertas.

---

¿Dudas? Consulta este archivo o pide ayuda a soporte técnico Nelly.
