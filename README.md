# Nelly Delivery

Nelly Delivery es un ecosistema operativo de pedidos con backend, panel administrativo y app Android para repartidores.

## Componentes

- `Backend`: reglas de negocio, estado de pedidos, asignación, cierre y finanzas.
- `Panel`: administración, métricas y operación interna.
- `Android`: app del repartidor para radar, aceptación, tracking y cierre.
- `RTDB`: persistencia operativa en tiempo real.

## Orden de verdad

La fuente operativa de verdad sigue este orden:

`Backend -> Firebase RTDB -> Android`

Android refleja.
Backend decide.

## Documentación base

- [`AGENTS.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/AGENTS.md): reglas operativas para agentes.
- [`DATA_MODEL.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/DATA_MODEL.md): modelo de datos canónico.
- [`SYSTEM_STATE.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/SYSTEM_STATE.md): estado operativo del proyecto.
- [`CHANGELOG.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/CHANGELOG.md): historial funcional certificado.
- [`CONTRIBUTING.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/CONTRIBUTING.md): guía para contribuir.
- [`ENGINEERING_PRINCIPLES.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/ENGINEERING_PRINCIPLES.md): principios de ingeniería.
- [`DEPENDENCY_MAP.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/DEPENDENCY_MAP.md): matriz de dependencias.
- [`RELEASE_CHECKLIST.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/RELEASE_CHECKLIST.md): checklist de liberación.
- [`RC-01.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/RC-01.md): certificación de estabilidad del flujo de entrega.
- [`docs/adr/README.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/adr/README.md): índice de decisiones arquitectónicas.
- [`docs/contracts/README.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/contracts/README.md): índice de contratos.
- [`docs/certificaciones/README.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/certificaciones/README.md): índice de certificaciones.
- [`docs/investigaciones/README.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/investigaciones/README.md): índice de investigaciones.
- [`docs/runbooks/README.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/runbooks/README.md): índice de runbooks.

## Baseline

- P17 es el baseline certificado.
- `complete-order` debe cerrar con `ENTREGADO`, limpiar `pedido_activo` y retirar nodos auxiliares.

## Flujo operativo

`Cliente -> Admin -> Cocina -> LISTO -> Radar -> Aceptar -> Entrega -> Complete Order -> ENTREGADO`

## Reglas prácticas

- No modificar componentes certificados sin evidencia nueva.
- No abrir una segunda hipótesis mientras exista una investigación activa.
- No duplicar fuentes de verdad para la misma entidad.
- No saltarse el backend para decidir estados finales.

## Inicio rápido

1. Leer `AGENTS.md`.
2. Revisar `DATA_MODEL.md`.
3. Consultar el ADR relevante.
4. Cambiar solo el componente investigado.
5. Compilar y validar una sola corrida.
6. Si el flujo está estable, ejecutar `RC-01`.
## Estado actual

- `RC-01` aprobado.
- `RC-02` aprobado.
