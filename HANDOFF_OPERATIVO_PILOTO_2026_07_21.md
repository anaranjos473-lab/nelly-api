# Handoff Operativo - Piloto

## Objetivo

Arrancar el piloto controlado con evidencia y sin reabrir la documentacion ya cerrada.

## Estado Base

- La documentacion quedo normalizada y congelada.
- El commit de cierre documental es `0c422da`.
- El checklist prepiloto incluye la validacion de costos de Google Maps Platform.
- La fuente de verdad sigue siendo `Backend -> Firebase RTDB -> Android`.

## Antes de Empezar

1. Confirmar que el backend mas reciente esta desplegado.
2. Revisar que el checklist prepiloto este completo.
3. Verificar que las API keys de Google Maps siguen restringidas.
4. Confirmar que no hay cambios locales pendientes fuera de documentacion.
5. Preparar el entorno de prueba y los dispositivos del piloto.

## Flujo a Validar

1. Publicacion del pedido desde Admin.
2. Aparicion en Radar o vista operativa del conductor.
3. Aceptacion por un conductor.
4. Seguimiento en tiempo real.
5. Entrega completa.
6. Actualizacion correcta de finanzas.

## Criterios de Pase

- El pedido aparece en el flujo operativo esperado.
- La aceptacion funciona sin estados residuales.
- El tracking se mantiene estable durante el pedido.
- La entrega termina en `ENTREGADO`.
- Las finanzas reflejan el cierre correctamente.
- No hay errores de backend visibles en el piloto.
- El consumo de Google Maps se mantiene bajo control.

## Criterios de No Pase

- El pedido no aparece.
- La aceptacion falla.
- El estado se queda atorado.
- El tracking se corta.
- La entrega no cierra.
- Las finanzas no se actualizan.
- Aparecen cargos o uso inesperado en Google Maps.

## Durante El Piloto

- Registrar hora de cada paso.
- Guardar capturas de pantalla si hay divergencias.
- Anotar pedido, conductor y estado exacto.
- No introducir cambios de codigo durante la corrida salvo bloqueo critico confirmado.

## Cierre

Si el piloto pasa, registrar el resultado y congelar la linea operativa. Si falla, documentar la evidencia y abrir una investigacion puntual sin mezclarla con la limpieza documental ya cerrada.

## Documento de Arranque

Usar como entrada principal del piloto:

- [ORDEN_DE_ARRANQUE_PILOTO_CONTROLADO_1PAGINA_2026_07_21.md](/C:/Users/hp14/OneDrive/Desktop/nelly/ORDEN_DE_ARRANQUE_PILOTO_CONTROLADO_1PAGINA_2026_07_21.md)
