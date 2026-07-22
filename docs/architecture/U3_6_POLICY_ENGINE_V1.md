# U3.6 - POLICY ENGINE V1

## Fecha
2026-07-22

## Proposito
Definir el motor de reglas que permita expresar comportamiento variable sin codificar casos especiales en el nucleo de dominio.

## Alcance
U3.6 no reemplaza la logica del dominio. Su objetivo es formalizar reglas configurables para que la plataforma adapte su comportamiento a paises, comercios, verticales y condiciones operativas sin modificar los contratos canonicos.

## Reglas objetivo

- quien puede aceptar pedidos;
- cuando liberar inventario;
- como calcular comisiones;
- cuando dividir un pedido;
- que evidencia exigir;
- cuando permitir devoluciones;
- reglas por pais, ciudad o comercio;
- reglas por tipo de nodo;
- reglas por canal de venta;
- reglas por integracion externa.

## Relacion con el nucleo

El policy engine debe consumir:
- contratos canonicos;
- maquina de estados;
- eventos de dominio;
- ledger;
- fulfillment engine.

Y debe producir:
- decisiones de politica;
- validaciones de elegibilidad;
- recomendaciones de aplicacion;
- trazabilidad de la regla aplicada.

## Criterios de implementacion

1. Las reglas deben ser declarativas o al menos versionables.
2. El motor no debe contener logica exclusiva de un vertical.
3. Toda decision debe quedar auditada con origen y version de regla.
4. El comportamiento por defecto debe seguir siendo el ya certificado si no existe regla especifica.
5. El doctor debe poder verificar la presencia y compatibilidad del conjunto de reglas activas.

## Matriz de validacion

| Area | Requisito | Estado | Evidencia |
| --- | --- | --- | --- |
| Elegibilidad | Reglas de acceso por contexto | Definido | U3.6 |
| Inventario | Liberacion y reserva gobernadas | Definido | U3.6 |
| Comisiones | Calculo por politica | Definido | U3.6 |
| Split orders | Division por regla | Definido | U3.6 |
| Evidencia | Requisitos por vertical | Definido | U3.6 |
| Devoluciones | Politicas por canal o comercio | Definido | U3.6 |
| Auditoria | Version y origen de regla | Definido | U3.6 |

## Limitacion conocida

U3.6 queda como capa de diseno hasta que existan casos reales suficientes para materializar reglas concretas sin afectar el baseline funcional ya certificado.

## Conclusiones

1. U3.6 separa politica de implementacion.
2. La plataforma gana capacidad de adaptacion sin reescribir el nucleo.
3. El motor de reglas es el complemento natural para una plataforma de marketplace y multi-vertical.
