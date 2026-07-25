# GOAL-G1-001
## Gate G1 - Ecosistema Comercial

**Estado:** Baseline abierta  
**Ambito:** Plataforma Nelly OS  
**Marco:** NES v1.0

### 1. Objetivo

Verificar que `GOAL-C2-001`, `GOAL-C3-001`, `GOAL-C4-001` y `GOAL-C5-001` operan como un unico ecosistema comercial sobre la misma SSOT certificada, sin reglas duplicadas ni indicadores contradictorios.

### 2. Alcance

Este gate comprende:

- validar que CRM, fidelizacion, inteligencia comercial y promociones ligeras consumen la misma SSOT;
- revisar que las recomendaciones no repitan logica ya resuelta en una capa previa;
- comprobar que las metricas coincidan entre vistas;
- confirmar que cada capa agrega valor nuevo sin romper las anteriores;
- mantener el flujo de desarrollo pausado hasta cerrar esta integracion transversal.

### 2.1 Areas a validar

- CRM basico;
- fidelizacion basica;
- inteligencia comercial;
- promociones ligeras;
- dashboard comercial;
- indice maestro;
- biblioteca de goals.

### 2.2 Preguntas de integracion

- ¿Todas las vistas consumen exactamente la misma SSOT?
- ¿No hay reglas duplicadas?
- ¿Las recomendaciones usan los mismos criterios?
- ¿Los indicadores coinciden entre CRM y Dashboard Comercial?
- ¿Cada capacidad aporta algo nuevo sin repetir la anterior?

### 3. No alcance

Este gate no incluye:

- nuevas fuentes de datos;
- nuevas capacidades de negocio;
- automatizacion comercial adicional;
- scoring predictivo;
- cambios al core operativo.

### 4. Riesgos

- fragmentacion del ecosistema comercial;
- inconsistencias entre vistas;
- duplicacion de reglas o metricas;
- confusion entre implementacion parcial y validacion integral.

### 5. Criterios de aceptacion

El gate se considerara listo para ejecucion cuando:

- C2, C3, C4 y C5 apunten a la misma SSOT;
- las metricas principales coincidan entre capas;
- no existan reglas repetidas o contradictorias;
- el ecosistema comercial pueda leerse como un unico sistema.

### 5.1 Criterio de salida

GOAL-G1-001 se considerara superado cuando:

- el CRM, la fidelizacion, la inteligencia comercial y las promociones ligeras sean coherentes entre si;
- no existan discrepancias funcionales entre las vistas;
- el ecosistema comercial quede listo para abrir nuevas capacidades sin deuda de integracion.

### 6. Evidencias

- revision cruzada de C2, C3, C4 y C5;
- checklist de consistencia de SSOT;
- comparacion de metricas entre dashboard y vistas derivadas;
- referencias en indice maestro y biblioteca de goals;
- commits de validacion del gate.

### 7. Metricas iniciales

Se deberan medir, como minimo:

- coincidencia de metricas entre C2, C3, C4 y C5;
- numero de reglas duplicadas detectadas;
- numero de indicadores contradictorios detectados;
- coherencia de recomendaciones entre capas;
- consistencia de la SSOT en todas las vistas.

### 8. Relacion con C2, C3, C4 y C5

Este gate depende de la evidencia y de las lecturas derivadas en `GOAL-C2-001`, `GOAL-C3-001`, `GOAL-C4-001` y `GOAL-C5-001`. El gate no construye una nueva verdad; verifica que las verdades ya certificadas siguen alineadas.

### 9. Historial

- 2026-07-25: Se abre el Gate G1 para validar el ecosistema comercial como unico sistema sobre la SSOT certificada.
