# PROGRAMA DE IMPLEMENTACION DE PLATAFORMA V1

## Fecha
2026-07-22

## Proposito
Definir el siguiente ciclo del proyecto como un programa operativo de adopcion, despliegue y validacion en campo sobre la base arquitectonica ya consolidada en B, U1, U2 y U3.

## Punto de partida

La plataforma ya dispone de:
- baseline funcional certificada;
- nucleo universal U2;
- migracion progresiva U3;
- cierre maestro de U3;
- integraciones y nodos ya validados;
- doctor y validadores automaticos.

Referencia:
- [`U3_CIERRE_MAESTRO_PLATAFORMA_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/U3_CIERRE_MAESTRO_PLATAFORMA_V1.md)

## Objetivo del programa

Pasar de la construccion de arquitectura a la adopcion operativa controlada, manteniendo:
- compatibilidad;
- evidencia;
- trazabilidad;
- reproducibilidad;
- preservacion del baseline.

## Bloques del programa

### P1 - Migracion de Admin

Objetivo:
- hacer que el panel administrativo consuma de forma consistente el nucleo universal;
- eliminar logica duplicada donde ya exista un contrato canónico;
- conservar la experiencia operativa.

### P2 - Migracion de Driver

Objetivo:
- llevar la app del repartidor al mismo modelo canonico;
- reducir dependencias de estado local divergente;
- mantener sincronizacion y seguimiento en tiempo real.

### P3 - Backend sin logica duplicada

Objetivo:
- consolidar la logica de negocio en el nucleo;
- retirar progresivamente ramas paralelas;
- mantener los contratos estables.

### P4 - Piloto controlado

Objetivo:
- ejecutar la plataforma con comercios y repartidores reales o semireales;
- registrar incidencias, excepciones y comportamiento operativo;
- comparar resultados contra el baseline certificado.

Base documental de P4:
- [`P4_PILOTO_CONTROLADO_PLATAFORMA_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/P4_PILOTO_CONTROLADO_PLATAFORMA_V1.md)
- [`P4_CIERRE_PILOTO_CONTROLADO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/P4_CIERRE_PILOTO_CONTROLADO_V1.md)

### P5 - Release Candidate y congelamiento

Objetivo:
- definir una candidata de liberacion;
- congelar arquitectura y contratos clave;
- dejar solo ajustes menores basados en evidencia.

Base documental de P5:
- [`P5_RELEASE_CANDIDATE_CONGELAMIENTO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/P5_RELEASE_CANDIDATE_CONGELAMIENTO_V1.md)
- [`P5_CIERRE_RELEASE_CANDIDATE_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/P5_CIERRE_RELEASE_CANDIDATE_V1.md)

## Criterios del programa

1. Ningun bloque avanza sin evidencia verificable.
2. La migracion no rompe flujos certificados.
3. Cada adopcion debe poder medirse con pruebas, doctor y, cuando aplique, validacion funcional.
4. El entorno Firebase operativo sigue siendo requisito para la certificacion funcional completa.

## Matriz operativa

| Bloque | Estado | Evidencia esperada |
| --- | --- | --- |
| P1 | Pendiente | Admin alineado con U2/U3 |
| P2 | Pendiente | Driver alineado con U2/U3 |
| P3 | Pendiente | Backend sin duplicacion de dominio |
| P4 | Pendiente | Piloto controlado con incidencias documentadas |
| P5 | Pendiente | RC1 y congelamiento del baseline operativo |

## Relacion con U3

U3 representa la consolidacion tecnica y la preparacion multi-vertical. Este programa representa la adopcion operativa de esa base en los módulos y flujos donde la plataforma vive en produccion.

## Cierre

Este programa sustituye la idea de abrir una nueva fase arquitectonica amplia. A partir de aqui, el valor principal esta en desplegar, validar y preservar la plataforma sobre el nucleo ya certificado.

## Indice maestro global

- [`INDEX_MAESTRO_PLATAFORMA_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/INDEX_MAESTRO_PLATAFORMA_V1.md)

## Transicion a RC1

La fase P5 se apoya en:
- [`RELEASE_CANDIDATE_NELLY_DELIVERY.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/RELEASE_CANDIDATE_NELLY_DELIVERY.md)
- [`RC1_BASELINE_REPOSITORIES.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/RC1_BASELINE_REPOSITORIES.md)

## Indice maestro

- [`INDEX_PROGRAMA_IMPLEMENTACION_PLATAFORMA_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/INDEX_PROGRAMA_IMPLEMENTACION_PLATAFORMA_V1.md)
