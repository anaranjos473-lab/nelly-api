# FINANCIAL_LEDGER_SIMULATION_002_MANDADITOS

## Posicion del documento

FINANCIAL_LEDGER_SIMULATION_002_MANDADITOS.md es un documento de validacion operativa y financiera.

Su proposito es probar escenarios reales de mandaditos antes de implementar FIN-006 ServicioNellyCalculator.

Este documento no crea politicas, tarifas, comisiones ni reglas de negocio.

En caso de conflicto, prevalece el siguiente orden:

1. FINANCIAL_POLICY.md
2. TARIFF_CATALOG_V1.md
3. FINANCIAL_LEDGER_SIMULATION_001.md
4. FINANCIAL_LEDGER_SIMULATION_002_MANDADITOS.md

## Alcance

Esta simulacion se enfoca en mandaditos porque concentra riesgos de:

- Compras
- Recolecciones
- Efectivo
- Transferencias
- Residenciales
- Lluvia
- Documentos
- Medicamentos
- Bultos
- Cambios y vuelto
- Clientes nuevos
- Clientes confiables

## Regla de congelacion

FIN-006 no debera iniciar implementacion hasta que los escenarios criticos de mandaditos hayan sido simulados y documentados con evidencia real o controlada.

## Escenarios obligatorios

| Nivel | Escenario | Evidencia minima | Estado |
| --- | --- | --- | --- |
| 1 | Compra de comida | Ticket, distancia, Servicio Nelly, ganancia repartidor | Pendiente |
| 2 | Compra de supermercado | Ticket, tiempo total, productos, Servicio Nelly | Pendiente |
| 3 | Medicamentos | Ticket, restricciones, autorizacion cliente | Pendiente |
| 4 | Recoleccion simple | Punto origen, punto destino, tiempo, evidencia entrega | Pendiente |
| 5 | Compra con $300 efectivo | Monto entregado, ticket, cambio, liquidacion | Pendiente |
| 6 | Compra con $1,200 efectivo | Capital requerido, riesgo, liquidacion, autorizacion | Pendiente |
| 7 | Residencial | Nivel residencial, acceso, espera, recargo operativo | Pendiente |
| 8 | Lluvia fuerte | Evidencia clima, recargo, aceptacion repartidor | Pendiente |
| 9 | Nocturno | Hora, recargo, aceptacion cliente, aceptacion repartidor | Pendiente |
| 10 | Cliente nuevo | Validacion minima, riesgo, limite operativo | Pendiente |
| 11 | Cliente confiable | Historial, limite operativo, comportamiento de pago | Pendiente |
| 12 | Carga pesada 15 kg+ | Peso estimado, recargo, viabilidad repartidor | Pendiente |
| 13 | Entrega con espera | Minutos de espera, recargo, aceptacion cliente | Pendiente |
| 14 | GPS incorrecto | Desviacion, ajuste distancia, recargo operativo | Pendiente |
| 15 | Cancelacion | Momento de cancelacion, costo hundido, liquidacion | Pendiente |

## Auditoria de cobertura por familias

Antes de llenar escenarios reales, la simulacion debera verificar que las siguientes familias queden cubiertas:

| Familia | Cobertura requerida | Estado |
| --- | --- | --- |
| A - Compras | Comida, supermercado, medicamentos, materiales | Pendiente |
| B - Recolecciones | Documentos, paquetes, objetos personales | Pendiente |
| C - Capital | $300, $1,200, $2,000+ | Pendiente |
| D - Riesgo Operativo | Lluvia, nocturno, residencial, GPS incorrecto, espera, cancelacion | Pendiente |
| E - Logistica Especial | 15 kg+, multiples destinos, productos delicados | Pendiente |

Si una familia queda descubierta, FIN-006 debera permanecer bloqueado aunque los 15 escenarios base esten documentados.

## Campos por escenario

Cada escenario debera registrar:

- Fecha
- Zona
- Tipo de mandadito
- Producto o articulo
- Monto de compra
- Efectivo requerido
- Distancia estimada
- Tiempo estimado
- Tiempo real
- Servicio Nelly calculado
- Recargos Operativos
- Retencion repartidor
- Ganancia neta repartidor
- Utilidad Nelly
- Evidencia requerida
- Resultado cliente
- Resultado repartidor
- Resultado Nelly
- Observaciones

## Criterios de salida

Para considerar la simulacion lista para FIN-006, cada escenario debe responder:

- ?El cliente acepto el precio?
- ?El repartidor acepto la ganancia?
- ?El efectivo fue suficiente y trazable?
- ?La liquidacion puede reconstruirse?
- ?Los recargos operativos fueron justificables?
- ?Nelly genero utilidad?
- ?El caso puede automatizarse sin introducir ambiguedad?

## Estado actual

Estado: Pendiente de simulacion de campo.

FIN-006: No iniciar aun.
