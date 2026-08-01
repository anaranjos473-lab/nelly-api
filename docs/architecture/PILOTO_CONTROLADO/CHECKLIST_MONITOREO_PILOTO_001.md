# CHECKLIST MONITOREO PILOTO CONTROLADO 001

## Proposito

Checklist operativo para supervisar el piloto controlado sin alterar el baseline certificado.

## Antes de iniciar la jornada

- [ ] Confirmar que `main` sigue congelada.
- [ ] Confirmar que `pilot-support` es la rama activa de soporte.
- [ ] Verificar que no existan cambios no documentados en el baseline.
- [ ] Confirmar que `GO_LIVE_CERTIFICATION_001` sigue vigente.
- [ ] Confirmar que el entorno operativo responde.
- [ ] Confirmar que el conductor de prueba o conductor real elegido es elegible.
- [ ] Confirmar que el panel, la cocina y el driver cargan sin residuos historicos.

## Durante la jornada

- [ ] Registrar cada pedido nuevo con su `pedidoId`.
- [ ] Verificar que el pedido aparece una sola vez en el flujo operativo.
- [ ] Verificar que no reaparecen pedidos historicos al recargar.
- [ ] Confirmar que la aceptacion y el cierre suceden en el pedido correcto.
- [ ] Registrar cualquier `403`, `404`, `Pedido no encontrado` o error de sincronizacion.
- [ ] Si aparece un bloqueo, detener la jornada y documentar evidencia.

## Evidencia minima por incidente

- [ ] Hora exacta.
- [ ] `pedidoId`.
- [ ] Pantalla afectada.
- [ ] Respuesta HTTP o mensaje visible.
- [ ] Estado en RTDB, si aplica.
- [ ] Captura o snapshot.
- [ ] Paso siguiente recomendado.

## Criterios de corte

Detener el piloto si ocurre cualquiera de estos casos:

- [ ] reaparece informacion historica en panel, cocina o driver;
- [ ] un pedido entregado vuelve a verse como activo;
- [ ] falla la aceptacion de un pedido elegible;
- [ ] el cierre no deja el pedido en `ENTREGADO`;
- [ ] la recarga revive datos antiguos;
- [ ] aparece una regresion que afecte el flujo E2E.

## Cierre de jornada

- [ ] Ejecutar verificacion final del estado operativo.
- [ ] Registrar incidencias y resoluciones.
- [ ] Actualizar la cronologia del piloto.
- [ ] Confirmar si la siguiente jornada continua, se pausa o requiere ajuste puntual.

## Referencias

- [GO_LIVE_CERTIFICATION_001.md](./GO_LIVE_CERTIFICATION_001.md)
- [GO_NO_GO_PILOTO_CONTROLADO_001.md](./GO_NO_GO_PILOTO_CONTROLADO_001.md)
- [PLAN_JORNADA_002_V1.md](./PLAN_JORNADA_002_V1.md)
- [RUNBOOK_OPERATIVO_PILOTO_V1.md](../RUNBOOK_OPERATIVO_PILOTO_V1.md)
