# U3.3 - MATRIZ DE COMPATIBILIDAD DE INTEGRACIONES V1

## Fecha
2026-07-22

## Proposito
Registrar el estado real de las integraciones iniciadas en U3.3 y dejar claro que el avance se basa en contratos canónicos, validaciones y doctor, no en adaptadores aislados.

## Matriz

| Adaptador | Contratos | Eventos | Ledger | Estados | Tests | Doctor |
| --- | --- | --- | --- | --- | --- | --- |
| Inventory | ✅ | N/A | N/A | ✅ | ✅ | ✅ |
| Payment | ✅ | N/A | N/A | ✅ | ✅ | ✅ |
| Billing | ✅ | N/A | N/A | ✅ | ✅ | ✅ |
| POS | ✅ | N/A | ✅ | ✅ | ✅ | ✅ |
| ERP | ✅ | N/A | N/A | ✅ | ✅ | ✅ |
| Marketplace | ✅ | N/A | N/A | ✅ | ✅ | ✅ |
| Identity | ✅ | N/A | N/A | ✅ | ✅ | ✅ |
| Notifications | N/A | ✅ | N/A | N/A | ✅ | ✅ |

## Interpretacion

- `Inventory`, `Payment` y `Billing` quedan como integraciones base ya arrancadas y certificadas.
- `POS` queda como adaptador operativo prioritario por su cercania al flujo comercial.
- `ERP`, `Marketplace`, `Identity` y `Notifications` quedan iniciados como adaptadores canonicos adicionales.
- `Notifications` consume eventos del dominio sin tocar ledger.
- La matriz no reemplaza la certificacion completa; la prepara.

## Evidencia de soporte

- [`src/integrations/inventoryAdapter.js`](/C:/Users/hp14/OneDrive/Desktop/nelly/src/integrations/inventoryAdapter.js)
- [`src/integrations/paymentAdapter.js`](/C:/Users/hp14/OneDrive/Desktop/nelly/src/integrations/paymentAdapter.js)
- [`src/integrations/billingAdapter.js`](/C:/Users/hp14/OneDrive/Desktop/nelly/src/integrations/billingAdapter.js)
- [`src/integrations/posAdapter.js`](/C:/Users/hp14/OneDrive/Desktop/nelly/src/integrations/posAdapter.js)
- [`src/integrations/erpAdapter.js`](/C:/Users/hp14/OneDrive/Desktop/nelly/src/integrations/erpAdapter.js)
- [`src/integrations/marketplaceAdapter.js`](/C:/Users/hp14/OneDrive/Desktop/nelly/src/integrations/marketplaceAdapter.js)
- [`src/integrations/identityAdapter.js`](/C:/Users/hp14/OneDrive/Desktop/nelly/src/integrations/identityAdapter.js)
- [`src/integrations/notificationAdapter.js`](/C:/Users/hp14/OneDrive/Desktop/nelly/src/integrations/notificationAdapter.js)

## Cierre
Con esta matriz, U3.3 queda formalmente abierto y ya dispone de una base de integraciones operativas sobre la que continuar con los conectores restantes o con la certificacion formal de la fase.
