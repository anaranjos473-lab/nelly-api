# NELLY_OS_PRODUCT_BACKLOG

## Backlog rector del ecosistema Nelly

### 1. Certificación Financiera
- [ ] Definir política única de comisión
- [ ] Unificar billetera oficial en RTDB
- [ ] Definir flujo de liquidaciones oficial
- [ ] Crear ledger financiero inmutable
- [ ] Simular pedido de $100 en entorno controlado

### FIN-006

Motor de cálculo Servicio Nelly

Objetivo:

- Calcular automáticamente:
  - Envío
  - Tarifa Nelly
  - Fondos
  - Lluvia
  - Residencial
  - Nocturno
  - Peso
  - Riesgo

- y devolver:
  - Servicio Nelly Final

### FIN-007

Financial Transparency Dashboard

Estado:

- NO INICIAR AUN.
- Requiere completar validacion de campo y certificacion de fondos internos.

Objetivo:

- Mostrar internamente:
  - Fondos SAT
  - Fondos Riesgo
  - Fondos Emergencias
  - Fondos Tecnologia
  - Fondos Juridicos
  - Fondos Operativos

- Por cada fondo:
  - Ingresos
  - Egresos
  - Saldo
  - Historial

### 2. Auditoría
- [ ] Documentar métricas de conciliación
- [ ] Asegurar trazabilidad por pedido
- [ ] Establecer `liquidaciones_auditoria` como fuente de verdad de eventos

### 3. Riesgo y Custodia
- [ ] Evaluar bloqueo por deuda y límite de crédito
- [ ] Normalizar `billetera_guerra`
- [ ] Revisar reservas de capital y liberaciones

### 4. Operaciones
- [ ] Validar `metricas/ganancias_hoy` en entrega real
- [ ] Confirmar endpoints montados en `app.js`
- [ ] Remover o declarar legacy rutas no usadas

### 5. Exclusiones actuales
- ❌ IA
- ❌ Tarifas dinámicas
- ❌ Bonos
- ❌ Rankings avanzados
- ❌ Franquicias
- ❌ Nuevos módulos no esenciales

## Notas

Este backlog solo contiene los módulos de mayor riesgo que deben atenderse antes de escribir código nuevo en el dominio financiero.
