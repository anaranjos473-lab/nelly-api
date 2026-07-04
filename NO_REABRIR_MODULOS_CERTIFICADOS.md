# NO REABRIR MODULOS CERTIFICADOS

| Modulo | Estado |
| --- | --- |
| Backend | CERTIFICADO |
| RTDB | CERTIFICADO |
| Panel | CERTIFICADO |
| Pedidos LISTO | CERTIFICADO |
| Boton Aceptar | CERTIFICADO |
| Estados Driver | CERTIFICADO |
| Driver recepcion | CERTIFICADO |
| Flujo operativo | CERTIFICADO |

## Unico Bloqueador

Camera Intent

Captura Evidencia

Finalizar Entrega

## Regla Operativa

No se vuelve a tocar un modulo certificado salvo evidencia nueva, directa y reproducible de fallo en ese modulo.

La siguiente investigacion inicia con una sola pregunta:

Que ocurre exactamente despues de pulsar "CAPTURAR EVIDENCIA"?

Revisar unicamente:

- ActivityResultLauncher
- registerForActivityResult
- TakePicture
- ACTION_IMAGE_CAPTURE
- permisos de camara
- callback onActivityResult o equivalente en Compose
