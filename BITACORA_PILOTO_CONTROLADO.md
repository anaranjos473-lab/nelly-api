# BITACORA DEL PILOTO CONTROLADO

## Estado
Documento vivo de operacion.

## Proposito
Registrar evidencia real del piloto controlado de Nelly OS sin reabrir arquitectura, redisenar pantallas ni convertir observaciones en desarrollo inmediato.

## Regla de uso
Todo hallazgo del piloto se registra primero aqui.

Una incidencia solo se convierte en cambio de codigo cuando:
- afecta la operacion real;
- es reproducible;
- tiene evidencia suficiente;
- se clasifica su severidad;
- se decide responsable y accion.

## Alcance congelado del piloto

### Incluido
- Pedido.
- Cocina.
- Operaciones.
- Logistica.
- Seguimiento por estados.
- Administracion.
- Alta controlada de restaurantes.
- CRM como lectura de clientes y comercios.
- Analytics como lectura de indicadores.
- Developer como diagnostico tecnico.

### No incluido
- Seguimiento GPS para el cliente.
- IA avanzada.
- Automatizaciones complejas.
- Optimizaciones cosmeticas.
- Nuevos modulos.
- Redisenos durante la corrida.
- Cambios de maquina de estados sin evidencia del piloto.

## Criterios de severidad

| Severidad | Criterio | Accion |
| --- | --- | --- |
| Critica | Detiene pedidos, entrega, cobro o acceso operativo principal | Contener, escalar y evaluar cambio inmediato |
| Alta | Afecta un rol clave pero permite operar con workaround | Registrar, asignar responsable y corregir antes de ampliar piloto |
| Media | Genera friccion operativa repetible sin detener el flujo | Registrar patron y planificar correccion |
| Baja | Observacion menor, capacitacion o detalle visual no bloqueante | Registrar y revisar al cierre |

## Tabla de incidencias

| ID | Fecha | Modulo | Incidencia | Severidad | Estado | Responsable | Evidencia | Accion / Cierre |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PIL-000 | 2026-07-26 | General | Bitacora creada para inicio de piloto controlado | Baja | Cerrada | Equipo Nelly | Commit / validacion paneles | Documento operativo activo |

## Registro rapido

Copiar esta fila para cada nuevo hallazgo:

| PIL-___ | AAAA-MM-DD | Modulo | Descripcion breve | Baja/Media/Alta/Critica | Abierta/En analisis/Cerrada | Responsable | Captura/log/pedido | Accion tomada |

## Reglas de cierre

- No cerrar incidencias sin accion, decision o justificacion.
- No mezclar varias causas en una sola incidencia si requieren acciones distintas.
- Si un restaurante, repartidor o cliente reporta algo por WhatsApp o llamada, registrar canal y hora.
- Si el mismo problema se repite, enlazarlo con el ID anterior y elevar severidad si afecta operacion.
- Si el problema es de capacitacion, cerrarlo con accion operativa, no con cambio de codigo.

## Dictamen inicial
Con base en la validacion de paneles, navegacion, repositorio y separacion por casillas, el piloto puede iniciar con monitoreo cercano y registro disciplinado de incidencias en esta bitacora.

