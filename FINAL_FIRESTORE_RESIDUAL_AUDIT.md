# FINAL_FIRESTORE_RESIDUAL_AUDIT

## Alcance
Auditoría final de los archivos residuales revisados en esta fase:
- `src/controllers/usersController.js`
- `public/subirEvidencia.js`
- `public/test_evidencia.js`

## Clasificación
- A = Operacional
- B = Administrativo
- C = Legacy
- D = Pruebas

## Resultado de la auditoría

### 1. `src/controllers/usersController.js`
- Dependencia Firestore: sí.
- Usa: `admin.firestore().collection('users')` para login, listado, creación, actualización y eliminación.
- Montaje activo: sí, en `routes/usuarios.js` y `app.js` como `/api/usuarios`.
- Rol: administración de usuarios y autenticación.
- Impacto en flujo principal: no participa directamente en `pedido → despacho → conductor → entrega → tracking`.
- Clasificación: **B — Administrativo**.
- Estado: residual Firestore activo en backend administrativo.
- Recomendación: migrar después de la certificación operativa; mantener disponible mientras se valida la transición.

### 2. `public/subirEvidencia.js`
- Dependencia Firestore: sí.
- Usa: `updateDoc(doc(db, 'pedidos', pedidoId), { ... })` y `serverTimestamp()`.
- Dependencia importada: `db` desde `public/firebase.js`.
- Estado actual de `public/firebase.js`: no exporta `db`.
- Impacto en flujo principal: no probado como parte del proceso principal; es un helper de evidencia.
- Clasificación: **D — Pruebas**.
- Estado: residual de frontend; actualmente rota por falta de export `db`.
- Recomendación: eliminar o archivar como prueba; no migrar en esta fase.

### 3. `public/test_evidencia.js`
- Dependencia Firestore: sí.
- Usa: `getDoc(doc(db, 'pedidos', pedidoId))` para validar la URL de evidencia.
- Uso en runtime: importado desde `public/panel.html` como script de módulo, pero solo expone `window.probarSubidaEvidencia`.
- Rol: prueba automatizada / manual en consola.
- Clasificación: **D — Pruebas**.
- Estado: prueba de validación, no parte del flujo de despacho.
- Recomendación: retirar del `panel.html` o convertir en archivo de pruebas separado.

## Dependencias Firestore residuales identificadas
- `src/controllers/usersController.js`
- `public/subirEvidencia.js`
- `public/test_evidencia.js`
- `router.js` (legacy, no montado en `app.js`)

## Notas adicionales
- `public/firebase.js` ya es RTDB-only: exporta `auth`, `rtdb`, `storage`.
- El paquete de prueba `public/test_evidencia.js` sí carga Firestore, pero su dependencia a `db` está rota por la configuración actual de `public/firebase.js`.
- El riesgo operativo restante es limitado a rutas administrativas y scripts de prueba, no al flujo logístico central.

## Recomendación general
1. Mantener `usersController.js` como deuda técnica administrativa y programar su migración posterior.
2. Retirar o aislar `public/subirEvidencia.js` y `public/test_evidencia.js` del panel de producción.
3. Aceptar esta fase como certificación operativa RTDB-only con residual Firestore limitado a admin/pruebas.

## Conclusión
- Residuo Firestore actual: administrativo y pruebas.
- No hay bloqueantes Firestore dentro del flujo central de pedidos.
- La certificación operativa puede avanzar con control de campo mientras se limpia el resto de deuda técnica.
