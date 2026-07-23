# GOAL-S4-001
## Dashboard Operativo Unificado - Nelly OS

**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0

### 1. Objetivo

Construir un Dashboard Operativo Unificado que consuma la Plataforma de Eventos Operativos y presente el estado del sistema de forma desacoplada, trazable y util para operacion, observabilidad y toma de decisiones.

### 2. Alcance

Este goal comprende:

- definir el contrato visual y operativo del dashboard;
- consumir eventos y proyecciones ya generadas por la capa de eventos;
- mostrar auditoria, metricas, finanzas, notificaciones y analitica sin consultar directamente el flujo de negocio;
- mantener el dashboard como consumidor de la arquitectura, no como productor de reglas;
- reutilizar la base certificada de S3 como fuente de estado.

### 3. No alcance

Este goal no incluye:

- acceso directo al flujo operativo de pedidos;
- logica de negocio central;
- redefinicion de eventos de dominio;
- modificaciones al productor de eventos;
- reescritura del bus;
- orquestacion IA completa;
- cambios estructurales al ledger o fulfillment.

### 4. Riesgos

- acoplar el dashboard a fuentes de negocio en lugar de consumir proyecciones;
- duplicar logica ya resuelta en consumers;
- introducir estados visuales que no coincidan con la verdad operativa;
- convertir el dashboard en otro origen de reglas;
- perder consistencia entre paneles y eventos.

### 5. Criterios de aceptacion

El goal se considerara cumplido cuando:

- el dashboard consuma al menos una proyeccion derivada de S3;
- la interfaz muestre informacion de eventos, metricas o finanzas sin depender del core;
- no sea necesario modificar el productor de eventos para agregar nuevas vistas;
- el dashboard conserve una fuente de verdad derivada y trazable;
- exista evidencia de ejecucion o validacion del consumo visual.

### 6. Evidencias

- prototipo o implementacion del dashboard;
- enlaces en indice maestro;
- pruebas de consumo de proyecciones;
- commits y push de la capacidad visual;
- referencias a S3 y al NES.

### 7. Referencias

- `GOAL-S3-001.md`
- `CERTIFICACION_S3_EVENTOS_OPERATIVOS_V1.md`
- `CATALOGO_EVENTOS_V1.md`
- `GATE_CERTIFICACION_S3_V1.md`
- `MANIFIESTO_NES_V1.md`
- `ARQ_HARNESS_ENGINEERING_V1.md`
- `NES_MAD_V1.md`
- `BIBLIOTECA_GOALS_NES_V1.md`

### 8. Historial

- 2026-07-23: Version inicial del goal S4 para el Dashboard Operativo Unificado.
