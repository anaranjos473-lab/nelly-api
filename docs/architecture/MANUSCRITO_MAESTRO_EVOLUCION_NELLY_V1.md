# MANUSCRITO MAESTRO DE EVOLUCION NELLY V1

## Estado

Propuesto como vision estrategica de largo plazo.

## Proposito

Convertir la vision de crecimiento de Nelly en una secuencia evolutiva ordenada, sin mezclar el alcance del piloto, la primera version comercial ni la plataforma B2B madura.

## Regla de alcance

Este manuscrito no forma parte del piloto controlado ni sustituye la documentacion operativa actual.

Su funcion es definir la direccion de evolucion despues de que Nelly Delivery y Nelly Store esten validados.

## Lectura por etapas

### Etapa 1. Nelly Delivery Core

Objetivo:

- validar la operacion de ultima milla;
- mantener el foco en reparto, comercios, cocina, administracion, finanzas, geolocalizacion, cobros, radar y reportes.

Alcance:

- Delivery;
- repartidores;
- comercios;
- cocina;
- administracion;
- finanzas;
- geolocalizacion;
- cobros;
- radar;
- reportes.

### Etapa 2. Nelly Store

Objetivo:

- validar el comercio propio sobre el nucleo ya probado;
- convertir la tienda oficial de Nelly en el primer consumidor de la API interna.

Alcance:

- catalogo;
- promociones;
- pagos;
- inventario;
- cupones;
- clientes;
- integracion con Delivery.

### Etapa 3. Nelly Business Platform

Objetivo:

Abrir la infraestructura de Nelly para que distintos modulos evolucionen de forma independiente sobre el mismo nucleo.

Arquitectura funcional:

- Delivery API;
- Commerce API;
- Inventory API;
- Billing API;
- Driver API;
- Merchant API;
- Analytics API.

Principio:

Cada modulo evoluciona por contrato y no por acoplamiento.

### Etapa 4. API First

Objetivo:

Diseñar Nelly como una plataforma integrable por terceros y por productos propios, sin depender de un proveedor unico.

Capacidades:

- autenticacion;
- autorizacion;
- versionado;
- publicacion de integraciones;
- webhooks;
- auditoria;
- idempotencia;
- limites de uso.

### Etapa 5. Nelly OS

Objetivo:

Consolidar un sistema operativo logistico y comercial reutilizable por aplicaciones propias y por plataformas externas.

Servicios nucleares:

- identidad;
- seguridad;
- geolocalizacion;
- pedidos;
- inventario;
- comercio;
- pagos;
- facturacion;
- IA;
- analitica;
- automatizacion;
- API Gateway;
- SDK para terceros;
- marketplace de integraciones;
- centro de eventos.

## Lineamientos arquitectonicos

### 1. Persistencia desacoplada

La arquitectura no debe depender de una base de datos concreta.

La persistencia principal puede ser MongoDB hoy, pero el contrato debe permitir PostgreSQL, CockroachDB u otra tecnologia en el futuro sin redisenar el negocio.

### 2. Firebase como capa operacional

Firebase se reserva para:

- tiempo real;
- ubicacion;
- presencia;
- tracking;
- sincronizacion.

No debe usarse como base historica principal.

### 3. Seguridad empresarial

La capa de seguridad debe incluir:

- OAuth2;
- JWT;
- rotacion de credenciales;
- expiracion;
- auditoria;
- rate limit;
- webhooks firmados;
- idempotencia.

### 4. Webhooks robustos

Toda integracion asincrona debe considerar:

- firma HMAC;
- reintentos automáticos;
- identificador unico de evento;
- registro de auditoria.

### 5. Riesgo y continuidad

La plataforma debe contemplar desde el diseno:

- fraude;
- caidas de infraestructura;
- recuperacion;
- disaster recovery;
- observabilidad;
- alertas.

### 6. Motor inteligente

La IA debe enfocarse en:

- asignacion dinamica;
- prediccion de demanda;
- agrupacion inteligente;
- calculo de rutas;
- estimacion de tiempos;
- precios dinamicos;
- deteccion de anomalias.

## Roadmap evolutivo

La secuencia recomendada es:

1. Piloto certificado.
2. Nelly Store.
3. Nelly Business Platform.
4. API publica.
5. Marketplace.
6. Expansion regional.
7. Escalamiento nacional.

## Criterios de adopcion

Este manuscrito solo se considera ejecutable cuando exista evidencia de:

- operacion estable en Delivery;
- tienda propia funcional;
- API interna suficientemente madura;
- capacidad de soportar integraciones sin romper el core;
- valor de negocio medible.

## Relacion con documentos existentes

- `PLAN_ESTRATEGICO_NELLY_V1.md`
- `RC2_PILOTO_CONTROLADO_V1.md`
- `ROADMAP_COMERCIAL_NELLY_COMMERCE_V1.md`
- `PLAN_EVIDENCIA_PILOTO_MAQUINA_ESTADOS_V1.md`
- `MATRIZ_FINAL_ECOSISTEMA_COMERCIAL_V1.md`

### Ruta de lectura sugerida

1. `PLAN_ESTRATEGICO_NELLY_V1.md`
2. `ROADMAP_COMERCIAL_NELLY_COMMERCE_V1.md`
3. `RC2_PILOTO_CONTROLADO_V1.md`
4. `PLAN_EVIDENCIA_PILOTO_MAQUINA_ESTADOS_V1.md`

## Cierre

Nelly debe crecer por etapas: primero demostrar que la operacion local funciona, luego convertir esa base en tienda propia, despues abrir la plataforma a APIs y finalmente consolidar Nelly OS como nucleo logistico y comercial reusable.

No se requiere mas documentacion para esta linea mientras no exista nueva evidencia del piloto o de la operacion real que justifique reabrirla.
