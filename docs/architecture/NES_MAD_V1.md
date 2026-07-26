# NES_MAD_V1
## Matriz de Decisiones de Arquitectura - Nelly Engineering System

**Version:** 1.0  
**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS

### 1. Proposito

Registrar, de forma resumida y trazable, las decisiones de arquitectura mas relevantes del NES para mantener una unica referencia global sobre el estado, el criterio y la direccion tecnica del proyecto.

### 2. Objetivo

La Matriz de Decisiones de Arquitectura sirve para responder rapidamente:

- que se decidio;
- que alternativas se evaluaron;
- por que se eligio esa opcion;
- cual es el estado actual de la decision;
- que documento o evidencia la respalda.

### 3. Relacion con ADR

Esta matriz no reemplaza los ADR.

Los ADR documentan una decision puntual con contexto, analisis y consecuencias.
La MAD del NES ofrece una vista consolidada de alto nivel sobre las decisiones principales del sistema.

Cuando una decision requiera detalle historico, tecnico o de riesgo, debe existir o crearse un ADR complementario.

### 4. Principios

- Una decision importante debe ser visible.
- Una decision importante debe ser trazable.
- Una decision importante debe tener un responsable o fuente de referencia.
- Una decision importante no debe contradecir el manifiesto ni las politicas vigentes.
- La matriz resume; los ADR justifican.

### 5. Estructura de registro

Cada fila de la matriz debe incluir, como minimo:

- **Decision:** nombre corto de la decision.
- **Opciones evaluadas:** alternativas consideradas.
- **Elegida:** opcion seleccionada o estado actual.
- **Motivo:** razon principal de la eleccion.
- **Estado:** vigente, en evaluacion, pendiente o cerrada.
- **Referencia:** documento, ADR o evidencia relacionada.

### 6. Matriz inicial

| Decision | Opciones evaluadas | Elegida | Motivo | Estado | Referencia |
| --- | --- | --- | --- | --- | --- |
| Base de datos operativa | Firestore / PostgreSQL | Firestore | Menor complejidad y continuidad con la arquitectura existente | Vigente | `MANIFIESTO_NES_V1.md`, `POL_ARCH_001.md` |
| Separacion Firestore/RTDB | Una sola base / doble base sin regla / Firestore negocio + RTDB vivo | Firestore para negocio persistente; RTDB para memoria operativa | Evita doble verdad y aprovecha los servicios existentes sin nueva infraestructura | Arquitectura objetivo | `ADR-011-ESTRATEGIA-SSOT-FIRESTORE-RTDB.md`, `ARQUITECTURA_DATOS_NELLY_V1.md` |
| Backend principal | Express / NestJS | Express | Estabilidad, conocimiento del equipo y compatibilidad con la base actual | Vigente | `POL_ARCH_001.md` |
| Modelo de eventos | Sin Event Bus / Event Bus | Event Bus | Facilita desacoplamiento, trazabilidad y automatizacion por capacidades | Vigente | `ARQ_HARNESS_ENGINEERING_V1.md` |
| Gobierno de IA | Sin politica / Politica formal | Politica formal | Permite trazabilidad, auditabilidad y control de automatizaciones | Vigente | `POL_IA_001.md` |
| Flujo de desarrollo | Ad hoc / Proceso estandarizado | Proceso estandarizado | Reduce variabilidad y mejora certificabilidad | Vigente | `POL_DEV_001.md` |
| Gobernanza documental | Dispersa / Fuente oficial unica | Fuente oficial unica | Evita duplicidad, mantiene consistencia y facilita auditorias | Vigente | `POL_DOC_001.md` |
| Lenguaje comun | Informal / Glosario oficial | Glosario oficial | Evita ambiguedades entre personas y automatizaciones | Vigente | `NES_GLOSARIO_V1.md` |
| Biblioteca de capacidades | No estandarizada / Skills reutilizables | Skills reutilizables | Reduce repeticion y ordena la ejecucion de capacidades | Vigente | `BIBLIOTECA_SKILLS_NES_V1.md` |
| Biblioteca de iniciativas | No trazable / Goals con identificador | Goals con identificador | Mejora seguimiento, cierre y certificacion de iniciativas | Vigente | `BIBLIOTECA_GOALS_NES_V1.md` |
| Contrato operativo | Implicito / AGENTS.md formal | AGENTS.md formal | Define reglas practicas para personas e IA sobre el repositorio | Vigente | `AGENTS.md` |

### 7. Criterios de actualizacion

La matriz debe actualizarse cuando:

- cambie una decision de arquitectura relevante;
- se abra o cierre un ADR que altere el criterio vigente;
- una politica nueva sustituya o refine una anterior;
- una capacidad del negocio obligue a reevaluar una decision base.

### 8. Gobernanza

La MAD del NES debe permanecer alineada con:

- `MANIFIESTO_NES_V1.md`;
- las politicas permanentes;
- `AGENTS.md`;
- la arquitectura de Harness Engineering;
- los ADR y certificaciones vigentes.

### 9. Cierre

Esta matriz constituye la vista ejecutiva del estado de las decisiones de arquitectura del NES y debe usarse como referencia rapida para entender la direccion tecnica del proyecto.
