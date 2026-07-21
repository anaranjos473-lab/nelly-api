# Orden de Arranque - Piloto Controlado

## Base

- Commit documental: `0c422da`
- Backend: version certificada desplegada
- APK Admin: version certificada
- APK Driver: version certificada

## Verificacion Inicial

Responsable: Lider tecnico

- [ ] Backend desplegado coincide con la version certificada.
- [ ] APKs instaladas coinciden con la misma version.
- [ ] Firebase responde correctamente.
- [ ] Google Maps funciona y presupuesto/alertas estan configurados.

## Checklist Prepiloto

Responsable: Operaciones

- [ ] Backend operativo.
- [ ] Base de datos accesible.
- [ ] Autenticacion funcional.
- [ ] Publicacion de pedidos disponible.
- [ ] Conductores con sesion iniciada.

## Ejecucion

Responsable: Operacion

1. Crear pedido.
2. Publicar pedido.
3. Ver pedido en Radar.
4. Aceptar con un solo conductor.
5. Confirmar que desaparece para los demas.
6. Navegar al destino.
7. Completar entrega.
8. Actualizar finanzas.
9. Volver al estado base del conductor.

## Pase

- [ ] Flujo sin errores criticos.
- [ ] Sin duplicidad de asignaciones.
- [ ] Sin perdida de sincronizacion.
- [ ] Finanzas actualizadas correctamente.
- [ ] Sin cierres inesperados.

## Monitoreo

Responsable: Lider tecnico

- Errores del backend.
- Consumo de Google Maps.
- Consumo de Firebase.
- Rendimiento de la aplicacion.
- Experiencia de conductores.

## Cierre

- [ ] Consolidar incidencias.
- [ ] Clasificarlas por severidad.
- [ ] Corregir solo con evidencia.
- [ ] Autorizar o rechazar el siguiente despliegue segun resultados.
