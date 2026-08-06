# G2 - Panel Administrativo - Evidencia de validacion

## Fecha

2026-08-06

## Objetivo

Dejar evidencia objetiva de la validacion inicial del Panel Administrativo como parte del Gate G2.

## Evidencia tecnica disponible

### Fuente oficial de comercios

La lectura de `market_v1/restaurantes` devolvio:

- total: 1
- activo: `PIZZERIA MIA`
- codigo: `PIZZERIA-MIA`
- id: `pizzeria-mia`

Esto confirma que el selector administrativo opera con un comercio real unico y activo, sin ambiguedad operativa en la fuente canonical del piloto.

### Estado del panel administrativo

La evidencia visual local muestra:

- carga correcta del dashboard administrativo;
- acceso al modulo `Soporte pedidos`;
- formulario de pedido manual visible;
- vista previa con comercio real, cliente, ubicacion, coordenadas y total;
- diferenciacion correcta entre coordenadas de cliente y tienda en la vista previa;
- ausencia de un fallback sintetico visible en la captura observada.

### Contrato del pedido

El flujo de creacion manual en `public/js/admin-dashboard.js` y `routes/admin.js` persiste:

- `comercio_id`
- `comercio_codigo`
- `comercio_nombre`
- `descripcion`
- `notas`
- `notas_ubicacion`
- `shortId`
- `folio`

### Interpretacion

Con la evidencia revisada, el Panel Administrativo queda alineado con el baseline del piloto para el caso de un comercio activo unico.

No se observo, en la revision realizada:

- comercio sintetico como sustituto;
- ruptura evidente entre la fuente de comercios y la vista previa del formulario;
- contradiccion visible entre contrato y UI para el flujo manual.

## Dictamen preliminar

**Estado del gate G2:** `PASS preliminar / evidencia suficiente para continuar la certificacion documental`

## Ejecucion funcional posterior

Se ejecuto un submit equivalente del formulario manual contra `POST /api/admin/pedidos` con el comercio activo unico real:

- `comercio_id`: `pizzeria-mia`
- `comercio_codigo`: `PIZZERIA-MIA`
- `comercio_nombre`: `PIZZERIA MIA`

Resultado:

- `status HTTP`: `201 Created`
- `pedidoId`: `PED_1786058280447`
- `shortId`: `PIZZERIA-MIA-20260806-008`
- `folio`: `PIZZERIA-MIA-20260806-008`
- contrato completo persistido en RTDB
- sin fallback sintetico
- sin ambiguedad de comercio

## Siguiente paso

Formalizar el cierre del Gate G2 en el expediente del piloto y continuar con el siguiente gate del roadmap.
