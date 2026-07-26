# ARQUITECTURA NELLY V1

## Estado
Constitucion tecnica y de producto para el piloto controlado de Nelly OS.

Este documento conecta las decisiones vigentes del ecosistema y fija las reglas fundamentales que deben guiar nuevos cambios.

## Proposito
Dar una referencia corta y estable para responder:
- como se organiza Nelly;
- que reglas no deben romperse;
- como se decide si una nueva funcionalidad entra;
- que documentos gobiernan cada dimension del producto.

## Principios rectores

### 1. Nelly OS es un hub
Nelly OS dirige al usuario al Centro de Trabajo correcto.

No debe convertirse en un panel gigante ni concentrar operacion, administracion, comercio, logistica, CRM, analytics o developer.

Referencia:
- [`MANIFIESTO_4_CASILLAS_NELLY_OS_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/MANIFIESTO_4_CASILLAS_NELLY_OS_V1.md)

### 2. Un Centro de Trabajo = una responsabilidad
Cada Centro responde una sola pregunta de negocio:

| Centro | Pregunta |
| --- | --- |
| Gobierno del Ecosistema | Como configuro y audito? |
| Centro de Operaciones | Que ocurre ahora? |
| Centro Comercial | Como vendo mas? |
| Centro Logistico | Como muevo el pedido? |
| CRM | Como entiendo y fidelizo clientes? |
| Analytics | Que debo medir? |
| Developer | Que debo diagnosticar tecnicamente? |

Si una funcionalidad responde otra pregunta, esta en el Centro equivocado.

### 3. Backend decide, clientes reflejan
La verdad operativa permanece en:

`Backend -> Firebase RTDB -> Android/Web`

Los clientes no inventan estado de negocio.

Referencia:
- [`AGENTS.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/AGENTS.md)
- [`MANIFIESTO_NES_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/MANIFIESTO_NES_V1.md)

### 4. La arquitectura del piloto esta congelada
Durante el piloto no se reabre arquitectura sin evidencia operativa.

Las mejoras visuales, operativas o tecnicas deben preservar los contratos certificados.

Referencia:
- [`DECISION_CONGELACION_ARQUITECTONICA_PILOTO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/DECISION_CONGELACION_ARQUITECTONICA_PILOTO_V1.md)

### 5. Todo desarrollo nuevo pasa por gate
Ningun desarrollo nuevo entra sin responder:

1. Que problema resuelve?
2. Quien lo utiliza?
3. En cual Centro de Trabajo pertenece?
4. Afecta otro Centro de Trabajo?
5. Puede resolverse sin romper la separacion de responsabilidades?

Si alguna respuesta no esta clara, el cambio queda en revision.

Referencia:
- [`MANIFIESTO_4_CASILLAS_NELLY_OS_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/MANIFIESTO_4_CASILLAS_NELLY_OS_V1.md)

### 6. El Design System es obligatorio para nuevas interfaces
Toda pantalla nueva debe usar los patrones comunes antes de crear CSS propio:
- header;
- sidebar;
- card;
- KPI;
- tabla;
- boton primario;
- boton secundario;
- boton de peligro;
- modal;
- panel lateral;
- mapa;
- timeline;
- badge de estado;
- empty/loading/error/success.

Referencia:
- [`NELLY_DESIGN_SYSTEM_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/NELLY_DESIGN_SYSTEM_V1.md)
- [`INDEX_MAESTRO_NELLY_UI_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/INDEX_MAESTRO_NELLY_UI_V1.md)

### 7. La experiencia se orienta por roles
El usuario debe entrar directamente a su espacio de trabajo.

| Rol | Entrada recomendada |
| --- | --- |
| Administrador General | `/admin` |
| Operador | `/control` |
| Restaurante | `/commerce` |
| Repartidor | App NellyDriver |
| Supervisor Comercial | `/commerce` + `/crm` |
| Analista | `/analytics` |
| Desarrollador | `/developer` |

Los permisos reales deben implementarse posteriormente sobre esta matriz, con certificacion de seguridad.

Referencia:
- [`NELLY_ROLES_ACCESO_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/NELLY_ROLES_ACCESO_V1.md)

### 8. El piloto produce evidencia antes que desarrollo
Durante el piloto, todo hallazgo debe registrarse antes de convertirse en cambio.

La prioridad es operar, observar, medir y decidir con evidencia.

Referencia:
- [`UX_RELEASE_RUNSHEET_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/UX_RELEASE_RUNSHEET_V1.md)
- [`PILOTO_PROCEDIMIENTO_INCIDENCIAS_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/PILOTO_PROCEDIMIENTO_INCIDENCIAS_V1.md)
- [`PILOTO_PROCEDIMIENTO_SOPORTE_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/PILOTO_PROCEDIMIENTO_SOPORTE_V1.md)

## Reglas de no regresion

- No mezclar responsabilidades entre Centros de Trabajo.
- No convertir Nelly OS en panel operativo.
- No crear CSS nuevo si existe componente en el Design System.
- No modificar contratos de backend sin evidencia y certificacion.
- No tocar Android certificado para resolver problemas que pertenecen al backend.
- No implementar permisos reales por UI solamente.
- No abrir funcionalidades nuevas durante el piloto sin gate.

## Jerarquia documental

1. [`MANIFIESTO_NES_V1.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/docs/architecture/MANIFIESTO_NES_V1.md)
2. Politicas (`POL_*`)
3. [`AGENTS.md`](/C:/Users/hp14/OneDrive/Desktop/nelly/AGENTS.md)
4. Esta arquitectura
5. ADRs, certificaciones y actas
6. Runbooks, checklists y bitacoras

## Decision
ARQUITECTURA NELLY V1 queda adoptada como documento rector de conexion entre producto, UX, roles, piloto y reglas tecnicas.

Su funcion no es reemplazar documentos especializados, sino evitar que el ecosistema vuelva a crecer por intuicion o acumulacion de paneles.
