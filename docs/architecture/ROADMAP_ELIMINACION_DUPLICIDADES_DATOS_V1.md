# ROADMAP DE ELIMINACION DE DUPLICIDADES DE DATOS V1

## Estado
Hoja de ruta de advertencias conocidas para la arquitectura de datos de Nelly.

Fecha: 2026-07-26

## Proposito
Convertir las advertencias detectadas por el diagnostico de arquitectura de datos en objetivos de eliminacion o control.

Este documento no autoriza migraciones durante el piloto. Define que debe ocurrir despues del piloto para reducir duplicidades sin romper el baseline certificado.

## Estado actual

Ultima validacion reportada del endpoint:

`GET /api/data-architecture/status`

Resultado operativo:

- modo: `pilot_rtdb_baseline`;
- duplicidades criticas financieras: `0`;
- advertencias: `2`;
- lecturas fallidas: `0`.

## Tablero de advertencias

| Duplicidad | Estado actual | Severidad | Objetivo | Momento |
| --- | --- | --- | --- | --- |
| Pedidos RTDB + Firestore | Vigilar | Advertencia | Eliminar despues del piloto: Firestore `orders` sera canonico y RTDB quedara como proyeccion viva. | Post-piloto |
| `conductores_activos` / `repartidores_activos` | Vigilar | Advertencia | Unificar nombre y propietario: `conductores_activos` como fuente viva objetivo; `repartidores_activos` como legacy temporal. | Post-piloto |
| Finanzas RTDB + Firestore | Sin duplicidad critica | Alta si reaparece | Mantener asi: ningun escritor paralelo ni nodo financiero fuera del backend. | Permanente |

## Objetivo 1: Pedidos RTDB + Firestore

### Decision actual
Durante el piloto:

- RTDB `pedidos/{pedidoId}` sigue siendo el baseline operativo certificado.
- Firestore `orders/{id}` queda documentado como objetivo, no como runtime activo.
- Firestore `pedidos` queda deprecado.

### Riesgo
Estados divergentes entre:

- cierre del pedido;
- indices operativos;
- tracking del cliente;
- dashboards;
- finanzas;
- CRM.

### Plan post-piloto

1. Congelar cambios de pedidos antes de migrar.
2. Levantar conteo comparativo RTDB vs Firestore.
3. Identificar escritores activos por archivo, endpoint y modulo.
4. Crear adaptador backend `PedidoRepository` server-side para escribir en una sola fuente.
5. Migrar lectura de paneles a backend/API.
6. Generar proyeccion RTDB `operational_view/orders/{id}` o equivalente.
7. Ejecutar pruebas de equivalencia de estados.
8. Certificar cierre de pedido:
   - `ENTREGADO`;
   - limpieza de `pedidos_en_camino`;
   - limpieza de `pedidos_para_reparto`;
   - actualizacion financiera;
   - tracking cliente.
9. Desactivar Firestore `pedidos` legacy.

### Criterio de salida

La advertencia se elimina cuando:

- existe una sola entidad canonica de pedido;
- RTDB solo contiene proyecciones;
- ningun panel escribe pedidos directo a Firebase;
- el diagnostico ya no reporta `orders_rtdb_firestore` como advertencia.

## Objetivo 2: `conductores_activos` / `repartidores_activos`

### Decision actual
Durante el piloto:

- ambas vistas se toleran como proyecciones vivas;
- ninguna debe ser editada desde paneles;
- el backend mantiene el control de elegibilidad, deuda y presencia.

### Riesgo
Un conductor puede aparecer como disponible en una vista y no en otra.

Esto afecta:

- mapa operativo;
- asignacion;
- balance de carga;
- diagnostico de deuda;
- soporte.

### Nombre objetivo

La proyeccion viva objetivo sera:

`conductores_activos/{uid}`

Propietario:

`DriverPresenceService`

### Plan post-piloto

1. Inventariar consumidores de `repartidores_activos`.
2. Migrar lecturas hacia `conductores_activos`.
3. Mantener espejo temporal solo desde backend si algun modulo legacy lo requiere.
4. Crear validacion para que nuevos paneles no lean `repartidores_activos`.
5. Retirar escritura legacy.
6. Retirar lectura legacy.
7. Eliminar `repartidores_activos` cuando no tenga consumidores.

### Criterio de salida

La advertencia se elimina cuando:

- `conductores_activos` es la unica vista viva;
- `repartidores_activos` no recibe escrituras;
- no existe consumidor activo del nodo legacy;
- el diagnostico ya no reporta `drivers_live_duplicates`.

## Objetivo 3: Finanzas sin duplicidad critica

### Decision actual
Durante el piloto:

- RTDB mantiene liquidaciones y agregados financieros certificados del piloto.
- Firestore financiero queda como objetivo post-piloto, no como escritor activo paralelo.
- pagos, deuda, bloqueos y liquidaciones pasan por backend.

### Riesgo si se rompe
Dinero contabilizado en dos fuentes oficiales.

Consecuencias:

- saldos distintos por panel;
- conductores bloqueados incorrectamente;
- liquidaciones inconsistentes;
- dashboards financieros no conciliables.

### Guardia permanente

El pipeline debe fallar si:

- aparece nueva escritura directa financiera desde `public/`;
- `finance_rtdb_firestore` deja de ser regla `high`;
- se agrega una ruta financiera RTDB fuera del catalogo;
- se crea un nuevo nodo financiero sin propietario backend.

### Criterio de salida

Este punto no se elimina. Se mantiene como control permanente.

Estado correcto:

`0 duplicidades financieras criticas`

## Auditoria automatica

Script:

`npm run validate:data-architecture`

Protege:

- reglas de coexistencia obligatorias;
- entidades con propietario y rol declarado;
- ausencia de escrituras directas criticas desde `public/`;
- rutas financieras RTDB dentro de catalogo.

CI/CD:

El workflow `Security Gate` ejecuta esta auditoria antes del `npm audit`.

## Regla de cierre

Mientras el piloto este activo:

- no se ejecutan migraciones masivas de datos;
- no se cambia la fuente oficial de pedidos;
- no se cambia la fuente financiera;
- no se elimina compatibilidad legacy sin evidencia;
- toda observacion se registra en la bitacora del piloto.

Despues del piloto:

- las advertencias pasan a tickets de migracion;
- cada migracion requiere ADR o plan tecnico;
- cada cierre requiere evidencia y certificacion.
