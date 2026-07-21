# Estado del Piloto - Nelly Delivery

**Fecha:** July 21, 2026
**Estado general:** Piloto controlado - Validacion avanzada

## 1. Componentes Certificados

| Componente | Estado | Evidencia |
|---|---|---|
| Flujo operativo principal (Panel -> Backend -> Android -> Entrega) | OK | Validado en dispositivo durante una entrega completa. |
| Panel administrativo | OK | Nueva UX del mapa, subtotal automatico y flujo de creacion de pedidos validados. |
| Backend | OK | Contrato de datos conservado y flujo operativo funcional. |
| Android (flujo principal) | OK | Recepcion, navegacion y cierre de mision validados en el escenario probado. |
| Cierre de mision | OK | El pedido finaliza y el flujo regresa al estado esperado en la prueba realizada. |

## 2. Componentes Pendientes

| Componente | Estado | Accion pendiente |
|---|---|---|
| Evidencia fotografica | Pendiente | Ejecutar una entrega completa y confirmar que la fotografia se almacena correctamente en Firebase Storage. |
| HTTP 409 (concurrencia) | Pendiente | Simular dos repartidores aceptando el mismo pedido y verificar que el segundo cliente se recupera correctamente. |

## 3. Firebase Storage

- El bucket de Storage fue creado correctamente.
- En el repositorio existe `storage.rules` preparado para el flujo de evidencias fotograficas.
- Verificar que esas reglas hayan sido publicadas en Firebase.
- Si la consola aun muestra `allow read, write: if false;`, confirmar que no sean las reglas activas antes del piloto.

## 4. Criterio Para Inicio Del Piloto

El piloto puede ejecutarse cuando:

- El flujo principal permanezca estable.
- No existan regresiones entre Panel, Backend, Cocina y Android.
- Firebase Storage permita la carga de evidencias segun las reglas previstas.
- El caso HTTP 409 quede planificado como prueba especifica si aun no se ejecuta.

## 5. Proximo Hito

Certificacion final del piloto mediante:

1. Validacion de subida de evidencia fotografica.
2. Prueba controlada de concurrencia (`HTTP 409`).
3. Emision del acta de cierre del piloto.

## Regla

Este documento separa claramente lo certificado de lo pendiente, evita confusiones durante las siguientes sesiones y sirve como referencia oficial para decidir cuando el piloto puede pasar a la siguiente etapa.
