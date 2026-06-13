# FINANCIAL_LEDGER_SIMULATION_001

## POSICION DEL DOCUMENTO DENTRO DE NELLY OS

FINANCIAL_LEDGER_SIMULATION_001.md es un documento de validacion y certificacion financiera.

Su proposito es probar escenarios operativos reales y verificar que las politicas y tarifas oficiales produzcan resultados sostenibles para:

- Clientes
- Repartidores
- Comercios
- Nelly OS

## Jerarquia Documental

En caso de conflicto entre documentos, prevalecera el siguiente orden:

1. FINANCIAL_POLICY.md
2. TARIFF_CATALOG_V1.md
3. FINANCIAL_LEDGER_SIMULATION_001.md

Este documento no crea politicas, tarifas, comisiones ni reglas de negocio.

Su funcion es validar y certificar las definiciones establecidas por los documentos superiores.

## Objetivos de la Simulacion

Cada escenario debera responder:

- ?El cliente acepta el precio?
- ?El repartidor acepta la ganancia?
- ?El comercio acepta las condiciones?
- ?Nelly genera utilidad?
- ?Los fondos internos crecen correctamente?
- ?El modelo sigue siendo competitivo frente al mercado local?

## Resultado Esperado de Certificacion

Las simulaciones serviran como evidencia para:

- Congelar la version financiera V1.
- Certificar el catalogo tarifario.
- Autorizar la implementacion de FIN-006 ServicioNellyCalculator.
- Autorizar la integracion con Ledger, Liquidaciones y Auditoria.

Hasta completar la certificacion oficial, todos los escenarios deberan considerarse de caracter experimental y de validacion.

## Propósito

Probar la lógica financiera de `Servicio Nelly` y la trazabilidad antes de implementar `ServicioNellyCalculator`.

## Escenarios de simulación

1. Pedido de comida
2. Mandadito con efectivo
3. Supermercado
4. Residencial
5. Lluvia
6. Pedido de $1,200+

## Parámetros clave

- Producto
- Servicio Nelly
  - Envío
  - Tarifa Nelly
  - Fondos Internos
  - Recargos Operativos
- Retención operativa
- Ganancia neta repartidor
- Comisiones comercio

## Objetivos

- Validar que `Servicio Nelly` sea rentable para Nelly.
- Verificar que el cliente solo vea `Producto + Servicio Nelly`.
- Confirmar que el reparto interno de fondos quede trazado en el ledger.
- Asegurar que el cálculo es reproducible para auditoría.

## Métricas de éxito

- Cliente acepta precio
- Repartidor acepta precio
- Nelly genera margen

## Requisitos de datos reales

- 30 pedidos reales de Comida
- 30 pedidos reales de Mandaditos
- 30 pedidos reales de Supermercado
- 30 pedidos reales de Envíos

## Resultado esperado

- `Servicio Nelly Final` definido
- `TARIFF_CATALOG_V1` validado
- Base estable para el desarrollo de `FIN-006` y `ServicioNellyCalculator`
