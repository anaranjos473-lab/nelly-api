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

## Fases del piloto

### Fase 1 - Validacion funcional
No desarrollar nada. Solo comprobar que cada modulo cumple su proposito.

| Modulo | Validar | Evidencia minima |
| --- | --- | --- |
| Administrador | Alta de restaurantes, edicion, usuarios y configuracion | Captura, ID de registro o log |
| Operaciones | Crear pedido, cambio de estados, seguimiento y alertas | ID de pedido y resultado del flujo |
| Comercio | Menu, productos, horarios y recepcion de pedidos | Registro del comercio y pedido de prueba |
| Logistica | Aceptacion, asignacion, entrega y finalizacion | ID de pedido, repartidor y estado final |

### Fase 2 - Validacion con usuarios
Confirmar si los usuarios entienden el flujo, no solo si el sistema funciona.

Registrar:
- dudas frecuentes;
- pasos que requieren explicacion;
- botones que no se entienden;
- errores por confusion;
- comentarios de cliente, restaurante, operador o repartidor.

### Fase 3 - Priorizacion
Clasificar cada observacion antes de convertirla en tarea.

| Tipo | Criterio | Decision |
| --- | --- | --- |
| Critica | Impide operar | Corregir inmediatamente |
| Importante | No impide operar, pero afecta experiencia o eficiencia | Programar para la siguiente version |
| Mejora | Idea de UX, optimizacion o refinamiento | Acumular para roadmap |

## Criterios de severidad

| Severidad | Criterio | Accion |
| --- | --- | --- |
| Critica | Detiene pedidos, entrega, cobro o acceso operativo principal | Contener, escalar y evaluar cambio inmediato |
| Alta | Afecta un rol clave pero permite operar con workaround | Registrar, asignar responsable y corregir antes de ampliar piloto |
| Media | Genera friccion operativa repetible sin detener el flujo | Registrar patron y planificar correccion |
| Baja | Observacion menor, capacitacion o detalle visual no bloqueante | Registrar y revisar al cierre |

## Criterios de impacto y reproducibilidad

| Campo | Valores sugeridos | Proposito |
| --- | --- | --- |
| Impacto | Cliente, Restaurante, Operador, Repartidor, Administrador, Tecnico | Identificar a quien afecta |
| Reproducibilidad | Siempre, Ocasional, Una vez, No reproducido | Evitar decisiones por percepcion aislada |

## Tabla de incidencias

| ID | Fecha | Fase | Modulo | Incidencia | Severidad | Impacto | Reproducibilidad | Estado | Responsable | Evidencia | Accion / Cierre |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PIL-000 | 2026-07-26 | Preparacion | General | Bitacora creada para inicio de piloto controlado | Baja | Equipo Nelly | Una vez | Cerrada | Equipo Nelly | Commit / validacion paneles | Documento operativo activo |

## Registro rapido

Copiar esta fila para cada nuevo hallazgo:

| PIL-___ | AAAA-MM-DD | Fase 1/2/3 | Modulo | Descripcion breve | Baja/Media/Alta/Critica | Cliente/Restaurante/Operador/Repartidor/Administrador/Tecnico | Siempre/Ocasional/Una vez/No reproducido | Abierta/En analisis/Cerrada | Responsable | Captura/log/pedido | Accion tomada |

## Reglas de cierre

- No cerrar incidencias sin accion, decision o justificacion.
- No mezclar varias causas en una sola incidencia si requieren acciones distintas.
- Si un restaurante, repartidor o cliente reporta algo por WhatsApp o llamada, registrar canal y hora.
- Si el mismo problema se repite, enlazarlo con el ID anterior y elevar severidad si afecta operacion.
- Si el problema es de capacitacion, cerrarlo con accion operativa, no con cambio de codigo.

## Dictamen inicial
Con base en la validacion de paneles, navegacion, repositorio y separacion por casillas, el piloto puede iniciar con monitoreo cercano y registro disciplinado de incidencias en esta bitacora.
