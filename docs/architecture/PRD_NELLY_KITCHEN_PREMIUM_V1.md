# PRD - NELLY KITCHEN PREMIUM V1

## Centro de Operaciones Inteligente

### Proposito
Definir la evolucion de la cocina de Nelly Delivery desde un panel operativo hacia una consola estable, escalable y certificable para operacion continua.

### Vision
Nelly Kitchen Premium sera el corazon operativo de Nelly Delivery.
No sera solo un panel de pedidos.
Sera una consola desde la cual un restaurante pueda controlar su operacion en tiempo real con trazabilidad, visibilidad y respuesta rapida.

### Objetivos
- Reducir tiempos de preparacion.
- Disminuir errores operativos.
- Aumentar trazabilidad.
- Facilitar capacitacion de nuevos operadores.
- Escalar desde una operacion pequena hasta una cadena.

### Principios
1. Operacion primero
   - Cada elemento de la pantalla debe ayudar a tomar decisiones.
   - No decorar.
   - No distraer.

2. Una sola fuente de verdad
   - Backend.
   - Firebase RTDB.
   - UI.
   - Nunca al reves.

3. Todo deja evidencia
   - Cada accion importante debe quedar registrada.
   - No para vigilar personas.
   - Para entender la operacion.

## Alcance Funcional

### Nivel 1 - Dashboard Ejecutivo
Siempre visible.

Debe responder en menos de tres segundos:
- Estado del sistema.
- Pedidos nuevos.
- Preparando.
- Listos.
- En reparto.
- Entregados.
- Tiempo promedio.
- Pedido mas antiguo.
- Retrasos.
- Conductores conectados.
- Conductores ocupados.
- Esperando repartidor.
- Ventas del dia.
- Ticket promedio.
- Cobrado.
- Pendiente.
- Backend.
- Firebase.
- RTDB.
- Latencia.
- Ultima sincronizacion.

### Nivel 2 - Centro de Produccion
Vista tipo Kanban.

Columnas:
- Nuevos.
- Aceptados.
- Preparando.
- Listos.
- Repartidor asignado.
- En reparto.
- Entregados.

Regla:
cada columna debe reflejar un estado real del backend.
No se admiten estados inventados en la UI.

### Tarjeta Premium
Cada tarjeta debe ser compacta, legible y accionable.

Debe mostrar:
- Numero de pedido.
- Cliente.
- Zona o colonia.
- Tiempo transcurrido.
- Productos resumidos.
- Total.
- Forma de pago.
- Prioridad.
- Repartidor, si existe.
- Observaciones breves.

La prioridad visual debe cambiar por SLA:
- Verde.
- Amarillo.
- Naranja.
- Rojo.

### Vista Detalle
Al abrir un pedido:
- Cliente.
- Productos.
- Notas.
- Observaciones.
- Historial.
- Timeline.
- Fotos.
- Firma.
- Pagos.
- Eventos.

### Timeline Operativo
Cada accion debe quedar registrada con hora:
- Pedido creado.
- Aceptado.
- Preparacion iniciada.
- Listo.
- Repartidor acepto.
- En camino.
- Entregado.

### Centro de Salud
Debe estar siempre visible o accesible en un panel lateral.

Indicadores:
- Backend.
- Firebase.
- RTDB.
- Maps.
- Auth.
- Latencia.
- Errores.

### Centro de Alertas
No usar `alert()` como mecanismo principal de operacion.

Clasificacion:
- Criticas: backend caido, Firebase desconectado, pedido detenido.
- Importantes: sin repartidor, SLA proximo.
- Informativas: nuevo pedido, pedido entregado.

### Modo Incidencias
Si algo falla, el panel debe explicarlo:
- Firebase desconectado.
- Reconectando.
- Backend lento.
- Sincronizacion retrasada.
- Error de permisos.

### Auditoria Operativa
Toda accion importante debe registrar:
- fecha y hora.
- operador o usuario.
- accion ejecutada.
- pedido afectado.
- resultado.

### Inteligencia Operativa
No IA generativa.
IA aplicada a operacion.

Casos de uso:
- Prediccion de tiempos.
- Riesgo de retraso.
- Balanceo de carga.
- Recomendacion de prioridad.
- Analitica historica.

### Mapa
El mapa debe ser apoyo, no protagonista.

Debe mostrar:
- Conductores.
- Clientes.
- Rutas.
- Tiempo estimado.

## Arquitectura Tecnica

La cocina no debe seguir creciendo dentro de un `panel.html` monolitico.

Estructura objetivo:

```text
public/
├── panel.html
├── css/
│   ├── tokens.css
│   ├── layout.css
│   ├── dashboard.css
│   ├── kanban.css
│   ├── cards.css
│   ├── timeline.css
│   ├── alerts.css
│   ├── dialogs.css
│   └── themes.css
└── js/
    ├── auth/
    ├── firebase/
    ├── api/
    ├── state/
    ├── sync/
    ├── render/
    ├── dashboard/
    ├── kitchen/
    ├── orders/
    ├── alerts/
    ├── timeline/
    ├── metrics/
    ├── maps/
    ├── audit/
    ├── ui/
    └── panel.js
```

## Roadmap

### P1 - Base Premium
Objetivo: consolidar una base estable sin cambiar la operacion.

Incluye:
- Modularizar el codigo.
- Redisenar el layout.
- Dashboard superior.
- Tarjetas premium.
- Estados de conexion.
- Gestion de errores.
- Autenticacion endurecida.
- Base de auditoria.

Meta:
mantener el comportamiento actual con una arquitectura mas limpia.

### P2 - Operacion
Objetivo: mejorar la productividad de la cocina.

Incluye:
- Kanban completo.
- Timeline por pedido.
- Centro de alertas.
- Confirmaciones elegantes.
- Panel de salud.
- Bitacora operativa.

Meta:
reducir errores y mejorar visibilidad.

### P3 - Inteligencia
Objetivo: apoyar la toma de decisiones.

Incluye:
- KPIs avanzados.
- Reportes.
- Mapa integrado.
- Metricas historicas.
- Indicadores de rendimiento.

Meta:
convertir datos operativos en informacion util.

### P4 - Cocina Inteligente
Objetivo: optimizar la operacion con asistencia inteligente.

Incluye:
- Prediccion de tiempos.
- Deteccion temprana de retrasos.
- Recomendaciones de prioridad.
- Balanceo de carga.
- Analitica avanzada.

Meta:
anticipar problemas antes de que afecten al cliente.

## Criterios de Calidad

### Disponibilidad
El panel debe seguir siendo utilizable incluso ante incidencias parciales, mostrando estados claros cuando falle un servicio.

### Rendimiento
La interfaz debe mantenerse fluida con decenas de pedidos simultaneos.

### Mantenibilidad
Cada modulo debe poder evolucionar sin afectar al resto.

### Trazabilidad
Toda accion relevante debe poder auditarse.

### Escalabilidad
La arquitectura debe soportar nuevos modulos sin redisenar la base.

## Criterio de Exito
Nelly Kitchen Premium sera valida cuando permita operar la cocina con rapidez, claridad y trazabilidad, sin convertir el panel en un monolito fragil y sin romper el flujo ya certificado.
