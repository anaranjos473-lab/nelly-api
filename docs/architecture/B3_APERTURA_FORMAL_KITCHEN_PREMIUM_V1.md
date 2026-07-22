# APERTURA FORMAL DE B3 - KITCHEN PREMIUM V1

## Fecha
2026-07-22

## Proposito
Registrar la apertura formal de B3 sobre una linea base funcional ya certificada, antes de iniciar la extraccion de la logica de pedidos.

## Referencias
- [`docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/ACTA_VALIDACION_E2E_PRE_B3_KITCHEN_PREMIUM_V1.md)
- [`docs/architecture/B3_PLAN_FORMAL_KITCHEN_PREMIUM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/B3_PLAN_FORMAL_KITCHEN_PREMIUM_V1.md)
- [`docs/architecture/INDEX_KITCHEN_PREMIUM_B2_B3.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/INDEX_KITCHEN_PREMIUM_B2_B3.md)

## Baseline congelado

- Commit de referencia: `776b316`
- Validacion E2E: aprobada
- Estado B1: certificado
- Estado B2: certificado
- Estado de B3 previo a la apertura: pendiente

## Decision

Se autoriza el inicio de `B3.1 - OrdersManager` bajo estas restricciones:

- no cambiar contratos certificados,
- no alterar el comportamiento funcional validado,
- no introducir dependencias inversas desde render hacia estado o Firebase,
- no mezclar refactorizacion con cambios de negocio.

## Instruccion operativa

1. Crear `orders-manager.js`.
2. Mantener el comportamiento actual.
3. Extraer solo coordinacion y helpers iniciales.
4. Verificar que la corrida funcional permanece equivalente al baseline.

## Estado

- Apertura B3: aprobada
- Inicio de B3.1: autorizado

