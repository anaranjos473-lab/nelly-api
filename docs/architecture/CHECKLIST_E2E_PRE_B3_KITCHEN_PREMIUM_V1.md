# CHECKLIST E2E PRE-B3 - KITCHEN PREMIUM V1

## Objetivo
Ejecutar la validacion end-to-end previa a B3 de forma ordenada y registrable.

## Nota de uso
Este documento es una guia operativa de ejecucion rapida. El procedimiento oficial, los criterios de certificacion y el registro de evidencias se encuentran en [`ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1.md). Esta checklist debe utilizarse durante la ejecucion y complementarse con el registro en el acta.

## Instrucciones
- Completar cada punto en el orden indicado.
- Registrar evidencia en el acta principal.
- No iniciar B3 hasta que todo quede aprobado.

## Checklist de ejecucion

- [ ] Abrir la acta principal de validacion E2E.
- [ ] Registrar fecha y hora de inicio.
- [ ] Crear pedido.
- [ ] Confirmar que el pedido existe.
- [ ] Registrar evidencia de la creacion.
- [ ] Confirmar que el pedido aparece en Cocina.
- [ ] Registrar evidencia de la recepcion en Cocina.
- [ ] Marcar el pedido como `LISTO`.
- [ ] Registrar evidencia de la transicion a `LISTO`.
- [ ] Confirmar que el pedido aparece en Radar.
- [ ] Registrar evidencia de la aparicion en Radar.
- [ ] Ejecutar la aceptacion del conductor.
- [ ] Confirmar que la identidad usada es la autorizada.
- [ ] Registrar evidencia de la aceptacion.
- [ ] Confirmar seguimiento en tiempo real.
- [ ] Registrar evidencia del seguimiento.
- [ ] Ejecutar la entrega.
- [ ] Registrar evidencia de la entrega.
- [ ] Verificar la actualizacion financiera.
- [ ] Registrar evidencia de finanzas.
- [ ] Verificar la auditoria.
- [ ] Registrar evidencia de auditoria.
- [ ] Comparar el render modular con el baseline certificado.
- [ ] Registrar evidencia de la comparacion visual.
- [ ] Completar el acta con resultado, observaciones y responsable.
- [ ] Marcar la validacion como aprobada solo si todas las verificaciones pasaron.
- [ ] Autorizar el inicio de `B3.1` solo despues de la aprobacion.

## Criterio final
Si algun paso falla, detener la ejecucion y documentar la ruptura antes de continuar.

Una vez completada esta checklist, registrar los resultados definitivos en el Acta de Validacion E2E Pre-B3. Solo una validacion aprobada autoriza el inicio de `B3.1 - OrdersManager`.
