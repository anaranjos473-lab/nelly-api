#!/bin/bash

# Nelly Logistics - Script de Auditoría de Concurrencia
# Ejecuta el test de integración y reporta fallos a Discord.

TEST_PATH="tests/concurrencia_listo.test.js"

echo "--------------------------------------------------"
echo "🚀 Iniciando prueba de concurrencia: $TEST_PATH"
echo "--------------------------------------------------"

# Ejecutar el test usando Jest
# --forceExit es útil para cerrar procesos de Firebase que queden colgados
npx jest "$TEST_PATH" --forceExit
TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ Prueba superada con éxito."
else
    echo "❌ La prueba ha fallado (Exit Code: $TEST_RESULT). Enviando reporte a Discord..."

    # Validar si existe la URL del webhook en el entorno
    if [ -z "$WEBHOOK_URL" ]; then
        echo "⚠️  ADVERTENCIA: La variable de entorno WEBHOOK_URL no está definida."
        echo "El reporte no pudo ser enviado."
    else
        TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
        
        # Construcción del payload JSON para el webhook de Discord
        PAYLOAD=$(cat <<EOF
{
  "username": "Nelly Sentinel",
  "embeds": [
    {
      "title": "🚨 Fallo Crítico: Test de Concurrencia",
      "description": "Se detectó una colisión o error en el flujo de pedidos **/listo** durante la prueba de carga simultánea.",
      "color": 15548997,
      "fields": [
        { "name": "Archivo de Test", "value": "\`$TEST_PATH\`", "inline": true },
        { "name": "Código de Salida", "value": "\`$TEST_RESULT\`", "inline": true },
        { "name": "Timestamp", "value": "$TIMESTAMP", "inline": false }
      ],
      "footer": { "text": "Nelly Logistics System Audit v4.0" }
    }
  ]
}
EOF
)

        # Envío a Discord vía POST
        curl -H "Content-Type: application/json" -X POST -d "$PAYLOAD" "$WEBHOOK_URL"
        echo "📢 Reporte de fallo enviado a Discord."
    fi
fi

exit $TEST_RESULT