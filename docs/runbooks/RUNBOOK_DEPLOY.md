# RUNBOOK_DEPLOY.md

## Objetivo

Desplegar cambios de forma segura sin romper componentes certificados.

## Antes de desplegar

1. Leer `AGENTS.md`.
2. Revisar `SYSTEM_STATE.md`.
3. Revisar el ADR y contrato correspondiente.
4. Ejecutar validaciones:
   - `npm run validate:routes`
   - `npm run validate:data-model`
   - `npm run validate:contracts`
   - `npm run validate:firebase`
5. Ejecutar las pruebas relevantes.

## Despliegue Backend

1. Confirmar rama y commit.
2. Verificar que no haya cambios no revisados en contratos o datos canónicos.
3. Desplegar el backend.
4. Revisar logs de arranque y errores 5xx.

## Despliegue Panel

1. Confirmar que el panel consume el backend agregado.
2. Verificar que los endpoints críticos respondan:
   - `admin/repartidores`
   - `admin/pedidos/metricas`
   - `metricas/rentabilidad`
3. Revisar que no haya lecturas directas innecesarias a RTDB.

## Despliegue Android

1. Compilar `assembleDebug` o `assembleRelease`.
2. Instalar APK.
3. Validar sesión y flujo base.
4. Ejecutar una corrida instrumentada si corresponde.

## Cierre

1. Registrar evidencia.
2. Actualizar documentación si cambió un contrato.
3. Guardar el commit o tag de referencia.

