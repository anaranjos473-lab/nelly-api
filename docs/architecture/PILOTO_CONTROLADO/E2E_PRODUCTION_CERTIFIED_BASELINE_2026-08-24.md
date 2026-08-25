# E2E Production Certified Baseline - 2026-08-24

## Estado

Linea base formal para retomar Nelly sin reiniciar la investigacion desde cero.

## Pedido certificado

- Pedido tecnico: `PED_1787611391259`
- Folio operativo: `PIZZERIA-MIA-260824-05`

## Flujo certificado en produccion

```text
PENDIENTE
-> LISTO
-> EN_CURSO
-> LLEGUE_A_TIENDA
-> PEDIDO_ABORDO
-> LLEGUE_A_CLIENTE
-> ENTREGADO
```

## Contrato final confirmado

```text
pedidos_para_reparto = NO
pedidos_en_camino    = NO
pedido_activo        = NO
```

## Regla para la siguiente fase

```text
UX puede mejorar la experiencia.
UX no puede cambiar el contrato certificado.
```

## Siguiente bloque

```text
POST-CERTIFICACION ANDROID / UX
```

No se debe reabrir el flujo E2E salvo evidencia nueva de regresion.

