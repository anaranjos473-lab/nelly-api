# ADR-011: Estrategia SSOT Firestore + Realtime Database

## Estado
Adoptado como arquitectura objetivo.

No ejecuta migracion automatica durante el piloto controlado.

## Contexto
Nelly utiliza dos servicios de Firebase:

- Cloud Firestore.
- Realtime Database.

Las capturas y la auditoria muestran que Firestore contiene o puede contener colecciones de negocio como:

- `orders`;
- `pedidos`;
- `pedidos_en_curso`;
- `pedidos_completados`;
- `metricas`;
- `configuracion`;
- `bitacora_forense`;
- usuarios, clientes, CRM y otras entidades persistentes.

Realtime Database contiene informacion operativa y de alta frecuencia como:

- `conductores_activos`;
- `repartidores_activos`;
- `pedidos_para_reparto`;
- `pedidos_en_camino`;
- `finanzas`;
- `historial_ventas`;
- snapshots y lecturas operativas.

Tener dos bases no es el problema. El riesgo aparece cuando ambas almacenan la misma entidad como verdad oficial o cuando dos modulos calculan estados financieros u operativos desde fuentes distintas.

## Decision
Se adopta la siguiente estrategia:

### 1. Firestore sera la verdad oficial persistente de negocio
Arquitectura objetivo:

- pedidos;
- restaurantes;
- clientes;
- usuarios;
- CRM;
- finanzas;
- metricas persistentes;
- configuracion;
- bitacora;
- auditoria forense.

Firestore se usara para informacion historica, consultable, auditable y de consistencia de negocio.

### 2. Realtime Database sera memoria operativa
Arquitectura objetivo:

- conductores activos;
- GPS;
- presence;
- heartbeat;
- estado online;
- cola operativa;
- snapshots operativos;
- vistas temporales de pedido para despacho o seguimiento.

RTDB se usara para datos de alta frecuencia, sincronizacion en vivo y proyecciones temporales.

### 3. No se permite doble verdad
Una entidad puede tener proyecciones, pero solo una fuente oficial.

Ejemplo objetivo:

- Pedido oficial: `Firestore orders/{id}`.
- Vista viva: `RTDB operational_view/orders/{id}`.

La vista viva no contabiliza ni decide. Solo acelera operacion.

### 4. Finanzas queda bajo regla estricta
La verdad financiera persistente debe vivir en Firestore en la arquitectura objetivo.

Ejemplo objetivo:

- `finanzas/movimientos`;
- `finanzas/liquidaciones`;
- `finanzas/comisiones`;
- `finanzas/cuentas`;
- `finanzas/cierres`;
- `finanzas/auditoria`.

RTDB puede exponer:

- `dashboard_finanzas`;
- `saldo_actual`;
- `ventas_hoy`;
- alertas financieras operativas.

Pero esos nodos son proyecciones, no contabilidad.

## Baseline del piloto
El piloto controlado mantiene el contrato certificado vigente:

`Backend -> Firebase RTDB -> Android/Web`

Por lo tanto:

- no se cambia el runtime certificado durante el piloto;
- no se migra pedidos ni finanzas a Firestore sin plan, pruebas y certificacion;
- no se modifica Android para compensar decisiones de datos;
- toda escritura critica sigue pasando por backend.

## Arquitectura objetivo

```text
                 Backend
                    |
        +-----------+-----------+
        |                       |
     Firestore              Realtime DB
        |                       |
  Verdad oficial          Estado en vivo
  persistente             y proyecciones
```

| Firestore | Realtime Database |
| --- | --- |
| Pedidos oficiales | Conductores online |
| Finanzas oficiales | GPS |
| Clientes | Presence |
| CRM | Cola operativa |
| Configuracion persistente | Snapshots operativos |
| Bitacora y auditoria | Vistas vivas temporales |

## Regla para Centros de Trabajo

| Centro | Regla |
| --- | --- |
| Gobierno | Configura y audita; no modifica pedidos operativos directamente. |
| Operaciones | Cambia estado de pedidos por backend; no calcula finanzas. |
| Comercio | Gestiona tienda/menu/ventas por backend; no administra conductores. |
| Logistica | Actualiza ubicacion/asignacion por backend; no modifica usuarios ni finanzas. |
| CRM | Lee datos de cliente y fidelizacion; escrituras futuras por backend CRM. |
| Finanzas | Registra movimientos, pagos y cierres por backend financiero. |
| Analytics | Solo lectura sobre datos persistentes y proyecciones certificadas. |
| Developer | Diagnostica; no modifica datos de negocio desde panel. |

## Consecuencias

### Positivas
- Reduce riesgo de inconsistencias entre pantallas.
- Permite usar Firestore para historico y auditoria.
- Mantiene RTDB para lo que hace mejor: sincronizacion viva.
- Evita costos de una infraestructura nueva.
- Permite migrar gradualmente sin romper piloto.

### Riesgos
- Requiere una migracion controlada para cambiar la fuente oficial de pedidos.
- Requiere adaptadores de lectura/escritura durante coexistencia.
- Requiere certificacion de finanzas antes de mover contabilidad a Firestore.
- Requiere limpiar colecciones Firestore legacy o marcarlas como no oficiales.

## Criterios para activar migracion
La migracion hacia Firestore como verdad oficial persistente solo puede iniciar cuando:

1. El piloto cierre o exista ventana controlada de cambio.
2. Exista plan de migracion por entidad.
3. Existan adaptadores backend.
4. Existan pruebas de equivalencia RTDB vs Firestore.
5. Finanzas tenga conciliacion repetible.
6. Android y paneles consuman backend, no rutas Firebase directas.
7. Se pueda volver atras sin perdida de datos.

## Decision final
Para el piloto:

- RTDB conserva el baseline certificado.
- Backend sigue siendo el unico escritor critico.

Para la evolucion post-piloto:

- Firestore sera la fuente oficial persistente de negocio.
- RTDB sera memoria operativa y capa de proyecciones vivas.
