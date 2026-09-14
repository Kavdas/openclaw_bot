# Копирует SOUL.md / IDENTITY.md из репозитория в named volume OpenClaw
# и убирает BOOTSTRAP.md (ритуал первого запуска не нужен — личность уже задана).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
docker compose -f "$root\docker-compose.yml" run -T --rm --no-deps --entrypoint sh openclaw-gateway -c "cat > /home/node/.openclaw/workspace/SOUL.md" < "$root\workspace\SOUL.md"
docker compose -f "$root\docker-compose.yml" run -T --rm --no-deps --entrypoint sh openclaw-gateway -c "cat > /home/node/.openclaw/workspace/IDENTITY.md; rm -f /home/node/.openclaw/workspace/BOOTSTRAP.md" < "$root\workspace\IDENTITY.md"
docker compose -f "$root\docker-compose.yml" run -T --rm --no-deps --entrypoint node openclaw-gateway dist/index.js agents set-identity --agent main --name "Клешня" --theme "прямой, краткий, с мнением" --emoji "🦀"
Write-Host "workspace synced"
