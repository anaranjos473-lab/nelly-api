# PILOTO PROCEDIMIENTO SOPORTE V1

**Estado:** Procedimiento operativo breve  
**Ambito:** Soporte durante piloto controlado  
**Referencia:** `OV1_PRE_PILOTO_GATE_V1.md`

## 1. Objetivo

Establecer una forma unica de recibir, clasificar y resolver solicitudes durante el piloto, evitando respuestas improvisadas.

## 2. Canales

El piloto debe operar con un canal principal de soporte y un responsable por turno.

| Elemento | Registro |
| --- | --- |
| Canal principal | Pendiente por operacion |
| Responsable | Pendiente por turno |
| Horario | Pendiente por turno |

## 3. Clasificacion

| Severidad | Descripcion | Accion |
| --- | --- | --- |
| Critica | Impide completar pedidos o afecta pagos | Atencion inmediata |
| Alta | Afecta operacion pero tiene contencion | Atencion prioritaria |
| Media | Afecta experiencia sin bloquear flujo | Registrar y programar |
| Baja | Duda, mejora o ajuste menor | Registrar |

## 4. Flujo de soporte

1. Recibir solicitud.
2. Registrar pedido, comercio, repartidor y hora.
3. Clasificar severidad.
4. Revisar si pertenece a operacion, finanzas, calidad, panel o app.
5. Aplicar contencion si existe.
6. Registrar dictamen.
7. Escalar solo si hay evidencia de bloqueo o regresion.

## 5. Regla de evidencia

Toda solicitud relevante debe incluir al menos:

- hora;
- pedido afectado;
- comercio o repartidor;
- descripcion corta;
- captura, log o evidencia observable cuando aplique.

## 6. Criterio de exito

Soporte funciona cuando las incidencias quedan clasificadas, trazables y no se resuelven mediante cambios tecnicos sin evidencia.

## 7. Historial

- 2026-07-25: Se crea el procedimiento de soporte para piloto.
