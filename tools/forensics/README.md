# Herramientas Forenses y Auditoría

Carpeta para scripts de investigación, validación y depuración que **NO son parte del producto**.

## Propósito

Estos scripts sirven para:
- Investigar inconsistencias en datos
- Validar estados de pedidos
- Depurar problemas de sincronización
- Auditar cambios históricos

## No usar en producción

Estos scripts NO deben ejecutarse automáticamente ni formar parte del flujo operativo.

Son herramientas de soporte técnico para diagnóstico.

## Scripts disponibles

- `audit-and-clean-pedido.js` - Audita y limpia pedidos
- `audit-driver-uid.js` - Audita UIDs de repartidores
- `check-pedido-status.js` - Verifica estado actual de pedidos
- `verify-pedido-status.js` - Verifica y valida estados
- `rtdb_audit.js` - Audita RTDB completo
- Y otros scripts de diagnóstico

## Cómo usar

```bash
node tools/forensics/<script-name>.js
```

Asegúrate de tener `nelly-admin.json` y `.env` configurados.
