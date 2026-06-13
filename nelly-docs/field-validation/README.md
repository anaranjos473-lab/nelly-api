# Field Validation - Nelly OS V1

Este directorio contiene la estructura de validación de campo para capturar evidencia real.

## Propósito

- Preservar el estado congelado de gobierno y finanzas.
- Crear trazabilidad de los primeros 30-50 casos reales.
- Garantizar que cualquier cambio posterior esté basado en evidencia, no en hipótesis.

## Estructura

- `food/` - Comida
- `errands/` - Mandaditos
- `supermarket/` - Supermercado
- `shipments/` - Envíos
- `CASE-TEMPLATE.md` - Formato estándar de captura
- `FIELD_VALIDATION_REPORT_V1.md` - Informe consolidado después de los casos

## Proceso

1. Crear un archivo de caso por pedido en la carpeta correspondiente.
2. Usar `CASE-TEMPLATE.md` para estandarizar la captura.
3. Registrar evidencias de cliente, repartidor, monto y responsabilidad.
4. No cambiar documentos rectores sin evidencia de estos casos.

## Etiqueta y rama

- `nelly-os-v1-freeze` debe seguir siendo la referencia del estado congelado original.
- Cuando la estructura de validación esté lista para pruebas, crear `nelly-os-v1-validation-ready`.
