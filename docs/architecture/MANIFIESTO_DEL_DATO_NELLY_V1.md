# MANIFIESTO DEL DATO NELLY V1

## Estado
Principio transversal de arquitectura para Nelly OS.

## Proposito
Evitar que Firestore y Realtime Database se conviertan en fuentes de verdad paralelas.

El Manifiesto de las 4 Casillas define donde vive cada funcion.

El Manifiesto del Dato define donde vive cada dato.

## Regla central
Cada dato tiene un unico dueno y una unica fuente oficial.

No importa cuantos paneles lo lean.

No importa cuantas proyecciones existan.

Solo un servicio puede ser propietario de ese dato.

## Preguntas obligatorias por entidad

| Pregunta | Respuesta esperada |
| --- | --- |
| Quien es dueno del dato? | Servicio backend especifico. |
| Donde vive oficialmente? | Firestore, RTDB u otra fuente, pero solo una. |
| Quien puede escribirlo? | Backend autorizado. |
| Quien puede leerlo? | Centros de Trabajo o clientes autorizados. |
| Existe copia o proyeccion? | Si existe, debe marcarse como derivada. |
| Que pasa si la proyeccion se retrasa? | La fuente oficial prevalece. |
| Afecta finanzas o pedidos? | Requiere control reforzado. |

## Separacion Firestore y RTDB

### Firestore
Base oficial persistente de negocio en la arquitectura objetivo:

- pedidos;
- restaurantes;
- clientes;
- usuarios;
- CRM;
- finanzas;
- metricas persistentes;
- configuracion;
- bitacora;
- auditoria.

### Realtime Database
Memoria operativa y estado vivo:

- conductores activos;
- GPS;
- presence;
- heartbeat;
- estado online;
- cola operativa;
- snapshots operativos;
- vistas temporales de pedido.

## Regla de proyecciones
Una proyeccion puede existir para acelerar una pantalla o sincronizar estado vivo, pero no puede decidir negocio por si misma.

Ejemplo:

| Entidad | Fuente oficial | Proyeccion permitida |
| --- | --- | --- |
| Pedido | Firestore `orders/{id}` en arquitectura objetivo | RTDB `operational_view/orders/{id}` |
| Conductor online | RTDB `conductores_activos/{uid}` | Snapshot operativo |
| Finanzas | Firestore `finanzas/*` en arquitectura objetivo | RTDB `dashboard_finanzas` |

## Baseline de piloto
Durante el piloto, Nelly mantiene el contrato certificado:

`Backend -> Firebase RTDB -> Android/Web`

Eso significa:

- el manifiesto no migra datos automaticamente;
- no se cambia el contrato Android;
- no se reemplaza la fuente oficial de pedidos en runtime sin certificacion;
- Firestore como fuente oficial persistente queda como arquitectura objetivo post-piloto.

## Regla de bloqueo
Una nueva funcionalidad no entra si:

- no define dueno del dato;
- no define fuente oficial;
- escribe una entidad critica desde `public/`;
- duplica dinero en Firestore y RTDB como verdad;
- duplica estados de pedido como verdad;
- calcula finanzas fuera del backend;
- depende de una proyeccion como si fuera canonica.

## Decision
El Manifiesto del Dato queda adoptado como quinto principio transversal de Nelly OS.

Las 4 Casillas ordenan responsabilidades.

El Manifiesto del Dato ordena la verdad del sistema.
