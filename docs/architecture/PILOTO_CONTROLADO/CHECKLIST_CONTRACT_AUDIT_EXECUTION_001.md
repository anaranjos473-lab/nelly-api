# CONTRACT_AUDIT_EXECUTION_001 - CHECKLIST OPERATIVO

## Estado previo

Verificar antes de ejecutar:

- [ ] Repositorio en `main` y actualizado.
- [ ] Sin cambios pendientes, excepto diagnosticos locales no versionados si existen.
- [ ] Backend iniciado y respondiendo.
- [ ] Acceso valido a Firebase Admin con OAuth operativo.
- [ ] Dataset del piloto sin modificaciones durante la auditoria.
- [ ] Baseline funcional y documental congelados.

Si cualquiera de estos puntos falla, no iniciar la auditoria.

## Fase 1 - Preparacion

- [ ] Confirmar conectividad con Firebase Admin.
- [ ] Confirmar que el script compila correctamente.
- [ ] Confirmar que el comando `npm` esta disponible.

Ejecutar:

```bash
npm run contract:audit
```

## Fase 2 - Ejecucion

La auditoria debera recorrer entre 10 y 20 pedidos, incluyendo obligatoriamente:

- [ ] `PED_1785200134315`

Para cada pedido registrar:

- [ ] Estado en RTDB.
- [ ] Presencia en `active_orders`.
- [ ] Presencia en `today_orders`.
- [ ] Presencia en `historical_orders`.
- [ ] Estado observado por el Panel.
- [ ] Estado observado por el Driver.
- [ ] Diagnostico del caso.

## Fase 3 - Clasificacion

Cada inconsistencia debera clasificarse unicamente en una de estas categorias:

- [ ] `KITCHEN_SYNC_001`
- [ ] `PILOT_DATASET_001`
- [ ] `CONTRACT_AUDIT_001`
- [ ] Sin inconsistencia
- [ ] Otra, describir y abrir un nuevo frente

No aplicar correcciones durante esta fase.

## Fase 4 - Evidencia

Verificar que se generen:

- [ ] `CONTRACT_AUDIT_001_RESULTS.md`
- [ ] `CONTRACT_AUDIT_001_EVIDENCE.md`
- [ ] `contract-audit-report.json`

Cada evidencia debe contener:

- [ ] Identificador del pedido.
- [ ] Fecha y hora.
- [ ] Resultado.
- [ ] Fuente de datos comparada.
- [ ] Diagnostico.

## Fase 5 - Cierre

Evaluar el resultado global:

- [ ] Todos los pedidos consistentes.
- [ ] Existen inconsistencias clasificadas.
- [ ] Se requiere abrir un nuevo frente.
- [ ] La auditoria concluye sin defectos reproducibles.

## Criterios de PASS

La auditoria sera PASS si:

- [ ] El script completa el recorrido previsto.
- [ ] Se generan los tres artefactos.
- [ ] Todos los pedidos quedan clasificados.
- [ ] Existe trazabilidad completa entre RTDB, Archive Engine, contrato, Panel y Driver.
- [ ] No quedan inconsistencias sin clasificar.

## Criterios de FAIL

La auditoria sera FAIL si ocurre cualquiera de estos casos:

- [ ] No puede ejecutarse el script.
- [ ] Faltan artefactos de salida.
- [ ] Hay pedidos sin diagnostico.
- [ ] Se detecta una inconsistencia no clasificable.
- [ ] El entorno vuelve a impedir la autenticacion con Firebase Admin.

## Acciones posteriores

- PASS: cerrar `CONTRACT_AUDIT_EXECUTION_001` y actualizar `OPEN_INVESTIGATIONS.md`.
- FAIL por entorno: mantener `CONTRACT_AUDIT_EXECUTION_001` en estado `PENDIENTE POR ENTORNO`, sin modificar el sistema.
- FAIL funcional: abrir un frente especifico con evidencia y alcance claramente delimitados.

