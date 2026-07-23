# POL-DOC-001
## Politica Documental - Nelly OS

**Version:** 1.0  
**Estado:** Vigente  
**Ambito:** Plataforma Nelly OS

### 1. Proposito

Establecer la gobernanza documental de Nelly OS para decidir con consistencia cuando crear, actualizar, enlazar, archivar o cerrar documentos, evitando duplicidad y manteniendo trazabilidad entre arquitectura, implementacion, operacion y certificacion.

### 2. Alcance

Esta politica aplica a:

- ADRs;
- certificaciones;
- actas;
- indices maestros;
- politicas;
- informes de cierre;
- reportes operativos;
- documentacion historica;
- notas de transicion y gobernanza.

### 3. Principios

- Una sola fuente de verdad por dominio.
- Documentacion proporcional al cambio.
- Evidencia antes que narrativa.
- Separacion entre documentos normativos, operativos e historicos.
- La documentacion debe facilitar auditoria, no sustituirla.
- Evitar duplicar el mismo contenido en multiples documentos.

### 4. Politicas de documentacion

- Los ADRs deben registrar decisiones arquitectonicas relevantes.
- Las certificaciones deben registrar hechos validados y evidencia.
- Los indices deben centralizar la navegacion y enlazar la fuente oficial de cada dominio.
- Los documentos historicos deben conservarse solo cuando aporten trazabilidad.
- Los documentos operativos deben reflejar el estado vigente de la operacion o de la fase activa.
- Un documento no debe redefinir un dominio ya gobernado por otro documento rector.

### 5. Excepciones

- Se permite documentacion adicional cuando exista un cambio de alcance, una necesidad de auditoria o un requisito normativo.
- Toda excepcion debe justificar por que no basta con actualizar la fuente oficial existente.

### 6. Cumplimiento

La documentacion se considera alineada cuando:

- existe una fuente oficial por tema;
- los indices apuntan al documento correcto;
- no hay duplicidad funcional entre documentos;
- las observaciones abiertas estan claramente separadas de los hechos cerrados;
- la documentacion historica esta identificada como tal.

### 7. Trazabilidad

Cada documento relevante debe poder relacionarse con:

- un objetivo o decision concreta;
- una evidencia o validacion;
- un indice que lo referencie;
- un estado claro: vigente, historico, operativo o de cierre.

### 8. Referencias

- `AGENTS.md`
- `POL_ARCH_001.md`
- `POL_DEV_001.md`
- `POL_IA_001.md`

### 9. Historial de cambios

- 2026-07-23: Version inicial de la politica documental.
