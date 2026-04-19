# Proceso para ajustar la política de escalamiento de alertas CI/CD

## Objetivo
Permitir modificar la ventana de tiempo antes de escalar una alerta de severidad MEDIA a ALTA, sin editar el workflow YAML, usando un secret seguro en GitHub.

## Pasos para ajustar la política

1. Ir a tu repositorio en GitHub > Settings > Secrets and variables > Actions.
2. Buscar el secret llamado `ALERT_ESCALATION_HOURS`.
   - Si no existe, crear uno nuevo con ese nombre.
3. Asignar el valor deseado en horas (ejemplo: `4` para 4 horas, `8` para 8 horas).
4. Guardar los cambios.
5. El workflow `alert-escalation.yml` tomará automáticamente el nuevo valor en el siguiente ciclo.
   - Si el secret no está definido, usará el valor por defecto de 6 horas.

## Ejemplo de uso
- Si quieres que la alerta escale a ALTA después de 3 horas, pon `3` como valor del secret.
- Para desescalar rápidamente en pruebas, puedes poner `1`.

## Validación
- Verifica en la pestaña Actions que el workflow `Escalate Alert` lee el valor correcto en los logs.
- Si hay errores de lectura del secret, revisa permisos y nombre exacto del secret.

## Notas
- No es necesario editar el YAML ni hacer commit para cambiar la política.
- El cambio es inmediato para nuevos ciclos de escalamiento.

---

# Plantilla de alerta para otros canales (correo, Teams)

**Asunto:** [NELLY] Alerta de despliegue - Severidad {{SEVERIDAD}}

**Cuerpo:**
- **Proyecto:** Nelly Delivery
- **Ambiente:** {{AMBIENTE}}
- **Workflow:** {{WORKFLOW}}
- **Hora:** {{TIMESTAMP}}
- **Detalle:** {{MENSAJE}}
- **Acción sugerida:** {{ACCION}}

**Ejemplo:**

Asunto: [NELLY] Alerta de despliegue - Severidad ALTA

Cuerpo:
- Proyecto: Nelly Delivery
- Ambiente: Producción
- Workflow: firebase-deploy.yml
- Hora: 2026-04-19 12:34 UTC
- Detalle: El deploy falló 3 veces consecutivas. Se escaló a ALTA.
- Acción sugerida: Revisar logs y restaurar servicio.

---

Puedes copiar esta plantilla para integrarla en sistemas de correo, Teams, o cualquier canal adicional.
