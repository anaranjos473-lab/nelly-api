# ACTA PRE PILOTO CONTROLADO 001

## Identificacion

| Campo | Valor |
| --- | --- |
| Codigo | `PRE_PILOTO_CONTROLADO_001` |
| Documento | `Acta de prepiloto operacional` |
| Version | `1.0` |
| Estado | `APROBADO` |
| Proyecto | `Nelly Delivery` |
| Fecha | `2026-08-01` |
| Responsable tecnico | `Codex` |
| Responsable operativo | `Pendiente de firma` |
| Revisor de calidad | `Pendiente de firma` |
| Baseline certificado | `PANEL_VISUAL_001`, `PANEL_VALIDATOR_001`, `DOMAIN_CERT_001`, `ATOMIC_ASSIGNMENT_001`, `ECOSYSTEM_CERT_001` |

## Proposito

Registrar la ejecucion y validacion del prepiloto operacional previo al inicio del piloto controlado.

El objetivo fue confirmar que el ecosistema certificado sigue operando de forma consistente en una corrida corta, sin modificar el baseline y sin introducir cambios de codigo fuera de la correccion ya certificada.

## Alcance

Incluye:

- backend operativo;
- autenticacion de panel y repartidor;
- flujo `dispatch-order -> accept-order -> complete-order`;
- dashboard operativo;
- verificacion financiera;
- verificacion de continuidad del estado al cierre.

No incluye:

- nuevas funciones;
- cambios de arquitectura;
- ajustes al baseline certificado;
- reabrir certificaciones cerradas.

## Referencias

- [PAQUETE_PREPARACION_PILOTO_CONTROLADO_V1.md](../PAQUETE_PREPARACION_PILOTO_CONTROLADO_V1.md)
- [CHECKLIST_PRE_PILOTO_CONTROLADO_V1.md](../CHECKLIST_PRE_PILOTO_CONTROLADO_V1.md)
- [HOJA_CORRIDA_PRE_PILOTO_CONTROLADO_V1.md](../HOJA_CORRIDA_PRE_PILOTO_CONTROLADO_V1.md)
- [EVIDENCIAS_PRE_PILOTO_CONTROLADO_001.md](./EVIDENCIAS_PRE_PILOTO_CONTROLADO_001.md)
- [ACTA_ECOSYSTEM_CERT_001_FINAL.md](../../certificaciones/ACTA_ECOSYSTEM_CERT_001_FINAL.md)

## Entorno utilizado

| Campo | Valor |
| --- | --- |
| Base URL | `http://127.0.0.1:3001` |
| Entorno | `local` |
| Backend | Operativo |
| RTDB | Operativo |
| Panel | Operativo |
| Driver | Operativo |
| Metodo de autenticacion | `Firebase Auth real` con ejecucion local |

Nota operativa:

- El runner oficial `npm run ov1:rotation` quedo bloqueado por acceso de red al servicio externo de autenticacion en este entorno.
- La corrida del prepiloto se completo con tokens reales obtenidos localmente y contra el backend local, sin alterar el baseline certificado.

## Dataset

Se ejecutaron 3 ciclos de prueba con pedidos de rotacion controlada:

- `P1_ROT_1785586241929_0`
- `P1_ROT_1785586243510_1`
- `P1_ROT_1785586244866_2`

Los drivers usados fueron:

- `ULILm4AyJGbfQzuUlC9ySpGrQrf1`
- `iXXl1erAQxW0Hht0CLWzlOYGaAi1`
- `9XPSCLkFUWeZnxWoFgZEf0uzkTe2`

## Ejecucion

La corrida verifico los siguientes pasos en cada ciclo:

1. crear pedido;
2. despachar;
3. aceptar;
4. completar;
5. validar dashboard;
6. validar salud operativa y financiera.

### Resultado de los tres ciclos

| Ciclo | Pedido | Driver | Dispatch | Accept | Complete | Dashboard | Backend | Finanzas |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `P1_ROT_1785586241929_0` | `ULILm4AyJGbfQzuUlC9ySpGrQrf1` | OK | OK | OK | GREEN | OK | OK |
| 2 | `P1_ROT_1785586243510_1` | `iXXl1erAQxW0Hht0CLWzlOYGaAi1` | OK | OK | OK | GREEN | OK | OK |
| 3 | `P1_ROT_1785586244866_2` | `9XPSCLkFUWeZnxWoFgZEf0uzkTe2` | OK | OK | OK | GREEN | OK | OK |

## Evidencia observada

- `dispatch-order` respondio `200`.
- `accept-order` respondio `200`.
- `complete-order` respondio `200`.
- El dashboard operativo quedo en `GREEN`.
- `backendOk = true`.
- `financeOk = true`.
- No se introdujeron cambios al baseline certificado durante la corrida.

## Riesgos residuales

- El runner oficial depende de autenticacion externa y en este entorno la red hacia Firebase Auth puede estar limitada.
- La corrida validada aqui se apoyo en tokens reales obtenidos localmente para mantener la fidelidad operativa.
- Si el piloto controlado se ejecuta en un entorno con otra topologia de red, conviene confirmar que el runner oficial recupere conectividad antes de usarlo como unica evidencia.

## Dictamen

La evidencia obtenida permite concluir que:

- el prepiloto operacional fue ejecutado;
- la corrida fue consistente en los 3 ciclos;
- el estado del ecosistema fue estable durante la validacion;
- no se detectaron regresiones nuevas;
- el baseline certificado se mantuvo intacto.

## Resultado final

**PREPILOTO: APROBADO**

**Autorizado para iniciar Piloto Controlado.**

## Firma tecnica

| Rol | Nombre | Firma | Fecha |
| --- | --- | --- | --- |
| Responsable tecnico | Codex |  | 2026-08-01 |
| Responsable operativo |  |  |  |
| Revisor de calidad |  |  |  |
