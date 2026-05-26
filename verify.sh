#!/usr/bin/env bash
set -euo pipefail

# verify.sh - Comprobaciones postarranque para entorno dev Nelly
# Uso: chmod +x verify.sh && ./verify.sh
# Requiere: docker, docker-compose, curl, redis-cli (opcional), k6 (opcional)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILES="-f docker-compose.yml -f docker-compose.override.yml"

echo
echo "=== VERIFICACIÓN RÁPIDA DEL ENTORNO DEV NELLY ==="
echo "Directorio raíz: $ROOT_DIR"
echo

# 1) Contenedores up
echo "1) Comprobando contenedores Docker"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
echo

# 2) Logs iniciales (últimas 200 líneas por servicio)
echo "2) Extrayendo logs recientes (gateway, assignment-service, envoy, redis)"
echo "---- gateway ----"
docker compose $COMPOSE_FILES logs --no-color --tail=200 gateway || true
echo "---- assignment-service ----"
docker compose $COMPOSE_FILES logs --no-color --tail=200 assignment-service || true
echo "---- envoy ----"
docker compose $COMPOSE_FILES logs --no-color --tail=200 envoy || true
echo "---- redis ----"
docker compose $COMPOSE_FILES logs --no-color --tail=200 redis || true
echo

# 3) Sanity endpoints via Envoy y Gateway directo
ECHO_OK="\e[32mOK\e[0m"
ECHO_FAIL="\e[31mFAIL\e[0m"

echo "3) Pruebas de endpoints"
URL_EDGE="http://localhost:10000/trip/123"
URL_GATEWAY="http://localhost:8080/trip/123"

echo -n "  - Envoy edge $URL_EDGE ... "
if curl -sS -o /tmp/verify_edge_resp.json -w "%{http_code}" "$URL_EDGE" | grep -qE '^(200|503)$'; then
  echo -e "$ECHO_OK"
  echo "    Código HTTP: $(cat /tmp/verify_edge_resp.json | jq -r '.status // "(no status field)"' 2>/dev/null || echo '(response saved)')"
else
  echo -e "$ECHO_FAIL"
  echo "    Resultado raw:"
  curl -sS -i "$URL_EDGE" || true
fi

echo -n "  - Gateway directo $URL_GATEWAY ... "
if curl -sS -o /tmp/verify_gateway_resp.json -w "%{http_code}" "$URL_GATEWAY" | grep -qE '^(200|503)$'; then
  echo -e "$ECHO_OK"
else
  echo -e "$ECHO_FAIL"
  curl -sS -i "$URL_GATEWAY" || true
fi
echo

# 4) Verificar headers llegan (envoy -> gateway)
echo "4) Verificar headers (Authorization y x-device-id) mediante petición de prueba"
echo -n "  - Envoy con headers ... "
if curl -sS -o /dev/null -w "%{http_code}" -H "Authorization: Bearer TEST_TOKEN" -H "x-device-id: verify-device" "$URL_EDGE" | grep -qE '^(200|401|503|429)$'; then
  echo -e "$ECHO_OK"
else
  echo -e "$ECHO_FAIL"
fi
echo

# 5) Redis checks (si redis-cli disponible)
echo "5) Comprobación Redis"
if command -v redis-cli >/dev/null 2>&1; then
  echo -n "  - Ping Redis ... "
  if docker compose $COMPOSE_FILES exec -T redis redis-cli ping 2>/dev/null | grep -qP '^PONG$'; then
    echo -e "$ECHO_OK"
  else
    echo -e "$ECHO_FAIL"
  fi

  echo -n "  - Listar claves trip:* (máx 20) ... "
  docker compose $COMPOSE_FILES exec -T redis redis-cli --raw keys "trip:*" | head -n 20 || echo "(no keys or redis-cli error)"
  echo
else
  echo "  - redis-cli no encontrado. Omite comprobación Redis local."
fi
echo

# 6) Verificar puertos de debug para attach
echo "6) Verificar puertos de debug (9229 gateway, 9230 assignment)"
check_port() {
  local port=$1
  if ss -ltn 2>/dev/null | awk '{print $4}' | grep -q ":$port$"; then
    echo -e "  - puerto $port abierto $ECHO_OK"
  else
    echo -e "  - puerto $port cerrado $ECHO_FAIL"
  fi
}
check_port 9229
check_port 9230
echo

# 7) Prueba de cache en Redis tras petición
if command -v redis-cli >/dev/null 2>&1; then
  echo "7) Verificar que la petición creó cache en Redis (trip:123)"
  KEY="trip:123"
  VAL=$(docker compose $COMPOSE_FILES exec -T redis redis-cli get "$KEY" 2>/dev/null || true)
  if [ -n "$VAL" ]; then
    echo -e "  - clave $KEY encontrada en Redis $ECHO_OK"
  else
    echo -e "  - clave $KEY no encontrada en Redis $ECHO_FAIL"
  fi
else
  echo "7) Omite verificación de cache Redis (redis-cli no disponible)"
fi
echo

# 8) Prueba de carga básica con k6 si está instalado
echo "8) Prueba de carga básica con k6 (opcional)"
if command -v k6 >/dev/null 2>&1; then
  echo "  - Ejecutando k6 por 30s (rampa 50->200->0). Umbral p95 < 300ms"
  k6 run --summary-export=/tmp/k6_summary.json k6/load_test.js || echo "  - k6 terminó con errores (revisa salida)"
  echo "  - Resumen k6 guardado en /tmp/k6_summary.json"
else
  echo "  - k6 no instalado. Instala k6 para ejecutar pruebas de carga."
fi
echo

# 9) Comprobación final y recomendaciones
echo "9) Resumen rápido"
echo "  - Si todos los checks anteriores muestran OK, el entorno dev está operativo."
echo "  - Si hay FAIL en endpoints o Redis, revisa logs con:"
echo "      docker compose $COMPOSE_FILES logs -f gateway"
echo "      docker compose $COMPOSE_FILES logs -f assignment-service"
echo "      docker compose $COMPOSE_FILES logs -f envoy"
echo
echo "=== FIN DE VERIFICACIÓN ==="