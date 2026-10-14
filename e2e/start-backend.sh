#!/usr/bin/env bash
# Levanta senda-api para E2E: base aparte (senda_e2e, recreada en cada corrida),
# LLM simulado y puerto 8081 para no chocar con el entorno de desarrollo.
set -euo pipefail
API_DIR="$(cd "$(dirname "$0")/../../senda-api" && pwd)"
COMPOSE=(docker compose -f "$API_DIR/compose.yaml")

"${COMPOSE[@]}" up -d --wait postgres
"${COMPOSE[@]}" exec -T postgres psql -U senda -d senda -q -c "DROP DATABASE IF EXISTS senda_e2e WITH (FORCE);"
"${COMPOSE[@]}" exec -T postgres psql -U senda -d senda -q -c "CREATE DATABASE senda_e2e;"

cd "$API_DIR"
# Las variables de entorno pesan más que el .env local de senda-api (que puede apuntar a otro proveedor).
export LLM_PROVIDER="anthropic"
export LLM_MODEL="mock-llm-e2e"
export LLM_BASE_URL="http://localhost:${MOCK_LLM_PORT:-4010}"
export LLM_API_KEY="e2e"
exec ./mvnw -q spring-boot:run -Dspring-boot.run.arguments="--server.port=8081 --spring.docker.compose.enabled=false --spring.datasource.url=jdbc:postgresql://localhost:5432/senda_e2e"
