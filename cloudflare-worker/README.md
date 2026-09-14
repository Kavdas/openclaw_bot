# Cloudflare Worker: прокси для Telegram Bot API

Обходит блокировку `api.telegram.org` из РФ без VPN на машине с OpenClaw.

## Деплой (вариант 1 — через дашборд, без установки чего-либо)

1. https://dash.cloudflare.com → Workers & Pages → Create → Start with Hello World → Deploy.
2. Edit code → вставить содержимое `worker.js` → Deploy.
3. Скопировать URL вида `https://tg-bot-api-proxy.<account>.workers.dev`.

## Деплой (вариант 2 — CLI)

```bash
cd cloudflare-worker
npx wrangler login
npx wrangler deploy
```

## Проверка

```bash
curl https://tg-bot-api-proxy.<account>.workers.dev/healthz
curl https://tg-bot-api-proxy.<account>.workers.dev/bot<TOKEN>/getMe
```

## Подключение к OpenClaw

В `.env`: `TELEGRAM_API_ROOT=https://tg-bot-api-proxy.<account>.workers.dev`
и `docker compose run --rm openclaw-cli config set channels.telegram.apiRoot "$TELEGRAM_API_ROOT"`.

> Если `*.workers.dev` тоже начнут резать — привязать воркер к своему домену
> на Cloudflare (Workers → Settings → Domains & Routes), логика не меняется.
