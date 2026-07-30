# NAE Cleanup

## Estado

PLANNED

## Objetivo

Cerrar la etapa de coexistencia temporal del Nelly Archive Engine despues de la certificacion E2E.

## Alcance

- Retirar fallbacks temporales de los consumidores ya certificados.
- Confirmar que Cocina, Logistica, Centro Comercial, Historial, Finanzas, Analytics y Auditoria consumen el contrato formal sin rutas alternativas.
- Eliminar accesos directos a colecciones operativas cuando exista contrato equivalente.
- Congelar `DataAccessService v1` como contrato oficial de lectura.
- Actualizar la documentacion arquitectonica y de certificacion para reflejar el estado cerrado.

## Tareas

1. Identificar todos los fallbacks temporales vigentes.
2. Verificar que cada consumidor ya tenga cobertura E2E suficiente.
3. Eliminar la rama de fallback donde aplique.
4. Confirmar que el contrato sigue respondiendo con la misma forma.
5. Validar que no existen accesos directos residuales a la fuente operativa.
6. Registrar evidencia de cierre.
7. Eliminar archivos temporales de depuracion que ya no aporten evidencia.
8. Reejecutar pruebas unitarias y validaciones de lectura.

## Criterios de cierre

El sprint solo puede considerarse completo cuando exista evidencia reproducible de:

- ausencia de fallbacks temporales en consumidores certificados;
- consumo exclusivo del contrato de lectura;
- ausencia de accesos directos a colecciones operativas;
- contrato `v1` estable y congelado;
- documentacion actualizada.

## Verificacion sugerida

Antes de cerrar el sprint, validar:

- que `orders_active`, `orders_today` y `orders_history` no tengan consumidores directos fuera del contrato;
- que los fallbacks ya no sean necesarios para los centros certificados;
- que los archivos temporales de trabajo hayan sido retirados si ya no sirven para depuracion;
- que la matriz E2E permanezca consistente despues del cleanup.

## Auditoria preliminar

Estado de la revision realizada sobre el repositorio al 2026-07-30:

- No se identifico codigo muerto critico con evidencia suficiente para eliminarse sin afectar compatibilidad certificada.
- Los fallbacks residuales observados corresponden a mecanismos de resiliencia documentados o a coexistencia temporal aprobada.
- Los archivos temporales de depuracion que ya no aportaban valor fueron retirados.
- No se altero el contrato `v1`, el scheduler ni el flujo de archivado.

Conclusión preliminar:

- El cleanup debe ser conservador y solo actuar sobre duplicidades o restos con evidencia objetiva de no uso.

## No alcance

- No se agregan capacidades nuevas.
- No se crea `v2`.
- No se altera la semantica del contrato.
- No se cambia la UI por motivos esteticos.

## Relacion

- [`DATA_ACCESS_CONTRACT_v1.md`](./../contracts/DATA_ACCESS_CONTRACT_v1.md)
- [`NAE_E2E_CERTIFICATION.md`](./NAE_E2E_CERTIFICATION.md)
- [`../adr/ADR-012-NELLY-ARCHIVE-ENGINE.md`](./../adr/ADR-012-NELLY-ARCHIVE-ENGINE.md)

## Historial de cambios

- 2026-07-30: sprint de cleanup creado para el cierre post-certificacion.
