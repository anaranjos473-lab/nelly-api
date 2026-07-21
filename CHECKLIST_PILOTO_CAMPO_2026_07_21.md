# Checklist Piloto de Campo

## Antes de salir

- Confirmar backend desplegado.
- Confirmar checklist prepiloto completo.
- Confirmar API keys de Google Maps restringidas.
- Confirmar que no hay cambios locales pendientes fuera de documentacion.
- Confirmar conductor, dispositivo y cuenta de prueba listos.

## Flujo a validar

1. Crear pedido desde Admin.
2. Confirmar aparicion en Radar o vista operativa.
3. Aceptar pedido desde el conductor.
4. Verificar tracking en tiempo real.
5. Completar entrega.
6. Confirmar cierre en `ENTREGADO`.
7. Confirmar actualizacion correcta de finanzas.

## Criterio de Pase

- El pedido aparece correctamente.
- La aceptacion funciona sin residuos de estado.
- El tracking se mantiene estable.
- La entrega cierra en `ENTREGADO`.
- Las finanzas reflejan el cierre.
- No hay errores visibles del backend.
- El consumo de Google Maps se mantiene bajo control.

## Criterio de No Pase

- El pedido no aparece.
- La aceptacion falla.
- El estado se queda atorado.
- El tracking se corta.
- La entrega no cierra.
- Las finanzas no se actualizan.
- Aparece uso inesperado de Google Maps.

## Durante el piloto

- Registrar hora de cada paso.
- Guardar capturas si hay divergencias.
- Anotar pedido, conductor y estado exacto.
- No cambiar codigo durante la corrida salvo bloqueo critico confirmado.

## Cierre

- Si pasa: registrar resultado y congelar la linea operativa.
- Si falla: documentar evidencia y abrir una investigacion puntual.
