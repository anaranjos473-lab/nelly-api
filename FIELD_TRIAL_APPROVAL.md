# FIELD_TRIAL_APPROVAL

## Propósito
Aprobar la ejecución de un field trial controlado para el ecosistema Nelly con RTDB como fuente operativa principal.

## Criterios de aprobación
- El flujo central de pedidos, despacho y tracking no depende de Firestore.
- Las dependencias Firestore restantes son administrativas o de prueba.
- La configuración de frontend principal ya no exporta el cliente Firestore (`db`).
- El backend principal se inicia sin necesidad de un puente Firestore.

## Estado actual
- Field Trial: **APROBADO**
- Producción Controlada: **APROBADA**
- Escalamiento Masivo: **PENDIENTE**

## Condiciones para el field trial
1. Ejecutar con el backend actual y `public/firebase.js` RTDB-only.
2. No poner en producción rutas adicionales de Firestore como `router.js`.
3. Retirar o deshabilitar los scripts de prueba Firestore del panel (`public/test_evidencia.js`).
4. Documentar cualquier acceso inesperado a Firestore durante el trial.

## Riesgos a monitorear
- Inyecciones de Firestore en rutas administrativas.
- Errores de importación de frontend desde scripts que aún referencian `db`.
- Activación accidental de `router.js` o de pruebas `test_evidencia.js`.

## Aprobaciones
- Equipo técnico: ✅
- QA de campo: ✅
- Operaciones: ✅

## Comentario final
La arquitectura operativa está lista para el trial; el bloqueo de escalamiento masivo es únicamente la eliminación ordenada de los residuos Firestore administrativos y de pruebas.
