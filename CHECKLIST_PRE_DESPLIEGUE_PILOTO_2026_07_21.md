# Checklist Pre-Despliegue - Piloto

## Objetivo

Confirmar que backend, aplicaciones y monitoreo estan listos antes de abrir el piloto controlado.

## 1. Versiones

- [ ] Backend desplegado corresponde a la version certificada.
- [ ] APK Admin corresponde a la version certificada.
- [ ] APK Driver corresponde a la version certificada.
- [ ] No existen cambios locales pendientes fuera de documentacion.

## 2. Conectividad

- [ ] Firebase responde correctamente.
- [ ] El backend alcanza RTDB sin errores.
- [ ] El panel Admin carga sin fallos criticos.
- [ ] El Driver inicia sesion correctamente.

## 3. Google Maps Platform

- [ ] API keys restringidas por paquete, SHA-1 o IP segun corresponda.
- [ ] Presupuesto mensual configurado.
- [ ] Alertas activas.
- [ ] Solo las APIs necesarias estan habilitadas.
- [ ] No hay consumo inesperado de Maps en pruebas previas.

## 4. Flujo Operativo

- [ ] Crear pedido desde Admin funciona.
- [ ] Publicacion del pedido esta disponible.
- [ ] El Radar muestra pedidos en tiempo real.
- [ ] Un conductor puede aceptar.
- [ ] La entrega cierra en `ENTREGADO`.
- [ ] Finanzas actualiza correctamente.

## 5. Monitoreo

- [ ] Logs del backend disponibles.
- [ ] Registro de errores activo.
- [ ] Trazabilidad de pedido y conductor preparada.
- [ ] Capturas o evidencia listas para guardar incidencias.

## 6. Go / No-Go

Go solo si todo lo anterior esta verificado.

No-Go si existe cualquiera de estos casos:

- backend desactualizado
- APKs desalineadas
- Firebase inestable
- credenciales o restricciones incompletas
- uso inesperado de Google Maps
- errores criticos en el flujo operativo
