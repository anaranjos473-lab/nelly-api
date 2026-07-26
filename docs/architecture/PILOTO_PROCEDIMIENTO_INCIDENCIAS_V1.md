# PILOTO PROCEDIMIENTO INCIDENCIAS V1

**Estado:** Procedimiento operativo breve  
**Ambito:** Reporte de incidencias Q1 durante piloto controlado  
**Referencia:** `OV1_PRE_PILOTO_GATE_V1.md`

## 1. Objetivo

Registrar incidencias de forma consistente para que Q1 pueda explicar que fallo, por que fallo y que mejora se aplico.

## 2. Datos minimos

| Campo | Descripcion |
| --- | --- |
| Pedido | Identificador del pedido |
| Comercio | Comercio afectado |
| Repartidor | Repartidor relacionado, si aplica |
| Tipo | Producto, empaque, servicio, entrega, pago u otro |
| Severidad | Critica, alta, media o baja |
| Causa raiz | Empaque, cocina, transporte, comercio, cliente, sistema u otro |
| Merma estimada | Valor estimado si existe perdida |
| Accion correctiva | Medida aplicada o propuesta |
| Seguimiento | Nueva medicion o resultado posterior |

## 3. Flujo Q1

1. Registrar incidencia.
2. Clasificar tipo y severidad.
3. Identificar causa raiz probable.
4. Registrar accion correctiva.
5. Medir si hubo reincidencia o mejora.
6. Alimentar C4 y C5 solo como contexto, sin mezclar responsabilidades.

## 4. Tipos iniciales

| Tipo | Ejemplo |
| --- | --- |
| Producto | Producto incorrecto, incompleto o danado |
| Empaque | Sellado insuficiente, derrame o empaque roto |
| Servicio | Mala atencion o comunicacion deficiente |
| Entrega | Retraso, direccion o confirmacion |
| Pago | Diferencia de monto o deuda |
| Sistema | Error de panel, app o sincronizacion |

## 5. Criterio de cierre de una incidencia

Una incidencia puede cerrarse cuando:

- tiene tipo y severidad;
- tiene causa raiz registrada o motivo de no determinacion;
- tiene accion correctiva;
- tiene seguimiento posterior;
- queda trazable para OV1.

## 6. Plantilla rapida de una pagina

Usar este formato para registrar una incidencia sin extender el reporte.

```text
Fecha y hora:
Pedido:
Comercio:
Repartidor:
Canal de deteccion:
Tipo:
Severidad:
Descripcion corta:
Causa raiz probable:
Accion aplicada:
Seguimiento:
Estado de cierre:
Responsable:
Evidencia:
```

### Guía de uso

- Si no hay dato, escribir `N/A`.
- Si la causa raiz no se conoce, registrar `Pendiente de analisis`.
- Si el problema afecta varios pedidos, abrir una sola incidencia madre y listar los pedidos relacionados.
- Si el problema se repite, vincularlo a la incidencia previa.
- Si la evidencia existe, adjuntarla o referenciarla con ruta, captura o log.

## 7. Historial

- 2026-07-25: Se crea el procedimiento de incidencias para piloto.
