# Checklist QA Android – Nelly Delivery (Sincronización Omega)

## 1. Seguridad y Autorización
- [ ] La app muestra estado "Degradado" si recibe 403/Permission Denied de Firebase o backend.
- [ ] No hay fugas de credenciales ni exposición de tokens en logs o UI.
- [ ] Se renuevan tokens correctamente al expirar.

## 2. Sincronización de Estados
- [ ] El flujo de estados de pedidos es: pendiente → en_reparto → entregado.
- [ ] Los cambios de estado se reflejan en tiempo real en la app y el panel.
- [ ] Si hay desincronización, la app muestra advertencia y permite reintentar.

## 3. Listeners y Memoria
- [ ] Todos los listeners de Firebase se limpian en onCleared() y cambios de pantalla.
- [ ] No hay fugas de memoria tras navegación intensiva.
- [ ] El ViewModel solo expone flujos activos y limpios.

## 4. Cabeceras y Tokens
- [ ] Cada request incluye Authorization, x-firebase-token y x-admin-token.
- [ ] El backend acepta y valida correctamente las cabeceras.

## 5. Pruebas de Estrés
- [ ] La app soporta 30+ unidades/pedidos sin caídas ni ANRs.
- [ ] El radar y la UI se mantienen fluidos bajo carga.
- [ ] No hay bloqueos ni ANRs tras pruebas prolongadas.

## 6. UX en Estado Degradado
- [ ] El usuario ve mensajes claros cuando el sistema está degradado.
- [ ] Se permite reintentar operaciones fallidas tras recuperar conexión.

## 7. Métricas y Logs
- [ ] Se registran métricas de errores 403 y sincronización.
- [ ] Los logs no exponen datos sensibles.

---

**Confirmar cada punto antes de liberar versión.**
