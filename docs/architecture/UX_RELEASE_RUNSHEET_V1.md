# UX RELEASE RUNSHEET V1

## Uso
Hoja de corrida unica para ejecutar tres validaciones operativas del piloto controlado sin duplicar formatos.

## Corridas

| Corrida | Objetivo | Estado | Evidencia |
| --- | --- | --- | --- |
| RC2-A | Validar el recorrido base extremo a extremo. | Pendiente | `.` |
| RC2-B | Validar variaciones operativas normales. | Pendiente | `.` |
| RC2-C | Validar robustez y recuperacion ante acciones repetidas o invalidas. | Pendiente | `.` |

## Criterios comunes

| Campo | Valor |
| --- | --- |
| Responsable | Codex |
| Entorno | Local pre-piloto |
| Base URL | http://127.0.0.1:3001 |
| Commit de referencia | d1f15f7 |

## 1. Verificacion Funcional

| Item | RC2-A | RC2-B | RC2-C | Observaciones |
| --- | --- | --- | --- | --- |
| Login Comercial | Pendiente | Pendiente | Pendiente | Validar acceso en cada corrida. |
| Login Operativo | Pendiente | Pendiente | Pendiente | Validar acceso en cada corrida. |
| Login Admin | Pendiente | Pendiente | Pendiente | Validar acceso en cada corrida. |
| Logout | Pendiente | Pendiente | Pendiente | Confirmar salida limpia. |
| Navegacion entre paneles | Pendiente | Pendiente | Pendiente | Confirmar acceso entre dominios operativos. |
| Acceso a CRM | Pendiente | Pendiente | Pendiente | Confirmar apertura y consistencia. |
| Acceso a Cocina | Pendiente | Pendiente | Pendiente | Confirmar fluidez del panel. |
| Acceso a Repartidor | Pendiente | Pendiente | Pendiente | Confirmar acceso y acciones. |

## 2. Verificacion Visual

| Item | RC2-A | RC2-B | RC2-C | Observaciones |
| --- | --- | --- | --- | --- |
| Responsive desktop | Pendiente | Pendiente | Pendiente | Revisar en cada corrida. |
| Responsive tablet | Pendiente | Pendiente | Pendiente | Revisar en cada corrida. |
| Responsive mobile | Pendiente | Pendiente | Pendiente | Revisar en cada corrida. |
| Iconografia consistente | Pendiente | Pendiente | Pendiente | Verificar UI 1.5. |
| Estados loading | Pendiente | Pendiente | Pendiente | Verificar en paneles principales. |
| Estados empty | Pendiente | Pendiente | Pendiente | Verificar en paneles principales. |
| Estados error | Pendiente | Pendiente | Pendiente | Verificar recuperacion. |
| Estados success | Pendiente | Pendiente | Pendiente | Verificar confirmaciones. |
| Contraste legible | Pendiente | Pendiente | Pendiente | Revisar legibilidad. |

## 3. Verificacion Tecnica

| Item | RC2-A | RC2-B | RC2-C | Observaciones |
| --- | --- | --- | --- | --- |
| `node --check` en archivos tocados | PASS | PASS | PASS | Sintaxis validada previamente para la base actual. |
| Sin errores JavaScript bloqueantes | Pendiente | Pendiente | Pendiente | Revisar consola en cada corrida. |
| Sin recursos faltantes | Pendiente | Pendiente | Pendiente | Revisar network. |
| Sin errores 404 | Pendiente | Pendiente | Pendiente | Revisar network. |
| Sin errores 500 | Pendiente | Pendiente | Pendiente | Revisar backend. |
| Sin 429 en corrida final | Pendiente | Pendiente | Pendiente | Asegurar ejecucion sin saturacion. |

## 4. Verificacion Operativa

| Item | RC2-A | RC2-B | RC2-C | Observaciones |
| --- | --- | --- | --- | --- |
| Crear pedido | Pendiente | Pendiente | Pendiente | Registrar ID por corrida. |
| Ver pedido en Cocina | Pendiente | Pendiente | Pendiente | Confirmar estado visible. |
| Publicar al pool | Pendiente | Pendiente | Pendiente | Confirmar despacho. |
| Aceptar con repartidor | Pendiente | Pendiente | Pendiente | Registrar driver usado. |
| Seguimiento visible | Pendiente | Pendiente | Pendiente | Registrar transiciones y estados. |
| Entrega registrada | Pendiente | Pendiente | Pendiente | Confirmar cierre del flujo. |
| Finanzas actualizadas | Pendiente | Pendiente | Pendiente | Confirmar efecto en saldo/deuda. |
| CRM actualizado | Pendiente | Pendiente | Pendiente | Confirmar reflejo de datos. |
| Dashboard Operativo consistente | Pendiente | Pendiente | Pendiente | Revisar snapshot final. |
| Dashboard Comercial consistente | Pendiente | Pendiente | Pendiente | Revisar métricas. |
| Panel Administrativo consistente | Pendiente | Pendiente | Pendiente | Revisar consistencia final. |

## 5. Criterio de Salida

| Criterio | RC2-A | RC2-B | RC2-C | Observaciones |
| --- | --- | --- | --- | --- |
| Puntos funcionales aprobados | Pendiente | Pendiente | Pendiente |  |
| Puntos visuales aprobados | Pendiente | Pendiente | Pendiente |  |
| Puntos tecnicos aprobados | Pendiente | Pendiente | Pendiente |  |
| Flujo extremo a extremo completo | Pendiente | Pendiente | Pendiente |  |
| Sin regresiones bloqueantes | Pendiente | Pendiente | Pendiente |  |

## 6. Dictamen por corrida

| Corrida | Resultado | Observaciones | Acciones siguientes |
| --- | --- | --- | --- |
| RC2-A | Pendiente | Corrida base. | Ejecutar primero. |
| RC2-B | Pendiente | Corrida de variacion operativa. | Ejecutar segundo. |
| RC2-C | Pendiente | Corrida de robustez. | Ejecutar tercero. |

## 7. Dictamen consolidado

| Campo | Valor |
| --- | --- |
| Resultado global | Pendiente |
| Observaciones finales | Consolidar solo despues de cerrar RC2-A, RC2-B y RC2-C. |
| Acciones siguientes | Ejecutar las tres corridas y cerrar el acta con evidencia. |

