# Orden de Arranque - Piloto Controlado

## Version base

- Commit documental: `0c422da`
- Backend desplegado: version certificada
- APK Admin: version certificada
- APK Driver: version certificada

## 1. Verificacion inicial

Responsable: Lider tecnico

- [ ] Confirmar que el backend desplegado corresponde a la version certificada.
- [ ] Confirmar que las APK instaladas corresponden a la misma version.
- [ ] Confirmar conectividad con Firebase.
- [ ] Confirmar funcionamiento de Google Maps y revisar presupuesto y alertas.

## 2. Checklist prepiloto

Responsable: Operaciones

- [ ] Backend operativo.
- [ ] Base de datos accesible.
- [ ] Autenticacion funcional.
- [ ] Publicacion de pedidos disponible.
- [ ] Conductores con sesion iniciada.

## 3. Ejecucion del piloto

Responsable: Operacion

Validar el flujo completo:

1. Crear pedido.
2. Publicar pedido.
3. Visualizar pedido en Radar.
4. Aceptar pedido desde un solo conductor.
5. Verificar desaparicion del pedido para los demas conductores.
6. Navegacion al destino.
7. Entrega completada.
8. Actualizacion de finanzas.
9. Regreso al estado base del conductor.

## 4. Criterios de pase

- [ ] Flujo completo sin errores criticos.
- [ ] Sin duplicidad de asignaciones.
- [ ] Sin perdida de sincronizacion.
- [ ] Actualizacion correcta de finanzas.
- [ ] Sin cierres inesperados de la aplicacion.

## 5. Monitoreo durante el piloto

Responsable: Lider tecnico

Registrar unicamente incidencias reales relacionadas con:

- Errores del backend.
- Consumo de Google Maps.
- Consumo de Firebase.
- Rendimiento de la aplicacion.
- Experiencia de los conductores.

## 6. Cierre del piloto

- [ ] Consolidar incidencias.
- [ ] Clasificarlas por severidad.
- [ ] Definir acciones correctivas solo si existe evidencia.
- [ ] Autorizar o rechazar el siguiente despliegue con base en los resultados.

## Resultado esperado

Con este documento quedan cubiertos cuatro niveles de operacion: handoff documental, handoff operativo, checklist de campo y orden de arranque, desde la transferencia del proyecto hasta la ejecucion practica del piloto.
