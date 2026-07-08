# Evidencia: pedido faltante para repartidor

**Fecha:** 2026-07-08

## Resumen de hallazgos

- En `pedidos_para_reparto` hay `22` pedidos con estado `LISTO` / `ESPERANDO_REPARTIDOR`.
- La mayoría no tiene `repartidor_id` asignado.
- Solo un pedido en ese nodo está asignado al UID del driver investigado:
  - `test_para_reparto_asg_1781118139256`
- El driver `fE8uV6dke3XziYNhuO3kZU93xQj1` en `repartidores/{uid}` muestra:
  - `estado: disponible`
  - `activo: true`
  - `pedido_activo: PED_1783493823323`
- El pedido `PED_1783493823323` ya está en `pedidos` con `estado: EN_CURSO`, y también aparece en `pedidos_en_camino`.

## Conclusión

El pedido actual en curso NO es el pedido faltante que debería verse como nueva asignación.

El problema real parece ser un desfase de estado entre:

- el driver que está marcado como activo y con `pedido_activo`
- y la lógica del app/teléfono que debería mostrar disponibilidad o recibir el siguiente pedido
## Hallazgo adicional

- El módulo web repartidor en `public/repartidor.html` no escucha `pedidos_para_reparto`; escucha `pedidos` y filtra solo orders con `estado = LISTO` y `repartidor_id` vacío.
- Si el Android real está en un contrato diferente o usa un listener distinto, esto puede explicar la discrepancia entre RTDB y UI.
## Siguiente paso explícito

1. Verificar que el Motorola está autenticado como `UID = fE8uV6dke3XziYNhuO3kZU93xQj1`.
2. Revisar la lógica de suscripción / filtrado en la app del repartidor para `pedidos_para_reparto`.
3. Confirmar si el teléfono está recibiendo pedidos desde ese nodo o si está filtrando equivocadamente pedidos LISTO / ESPERANDO_REPARTIDOR.

> Siguiente paso: validar UID en el dispositivo y comprobar la lógica de escucha de `pedidos_para_reparto` en la app del repartidor.
