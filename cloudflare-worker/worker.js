/**
 * Reverse-proxy для Telegram Bot API.
 *
 * Зачем: с российских IP api.telegram.org режется ТСПУ (таймауты/504),
 * а IP-диапазоны Cloudflare — нет. Воркер принимает запрос бота и
 * прозрачно пересылает его в api.telegram.org с edge-ноды Cloudflare.
 *
 * Использование: в OpenClaw задать
 *   channels.telegram.apiRoot = "https://<worker>.workers.dev"
 * (без /bot<TOKEN> — путь бот добавит сам).
 *
 * Защита: воркер пропускает только пути вида /bot<token>/<method>
 * и /file/bot<token>/<path>, чтобы им нельзя было пользоваться как
 * открытым прокси. Токен бота нигде не хранится — он в пути запроса.
 */
const UPSTREAM = "https://api.telegram.org";
const ALLOWED_PATH = /^\/(file\/)?bot\d+:[A-Za-z0-9_-]+(\/|$)/;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/healthz") {
      return new Response("telegram-bot-api proxy: ok", { status: 200 });
    }
    if (!ALLOWED_PATH.test(url.pathname)) {
      return new Response("forbidden", { status: 403 });
    }

    const upstream = new URL(url.pathname + url.search, UPSTREAM);
    const headers = new Headers(request.headers);
    headers.set("Host", "api.telegram.org");
    // Cloudflare-специфичные заголовки Telegram не нужны.
    for (const h of ["cf-connecting-ip", "cf-ipcountry", "cf-ray", "cf-visitor", "x-forwarded-for", "x-real-ip"]) {
      headers.delete(h);
    }

    const init = {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
      redirect: "follow",
    };

    try {
      const resp = await fetch(upstream, init);
      return new Response(resp.body, {
        status: resp.status,
        statusText: resp.statusText,
        headers: resp.headers,
      });
    } catch (err) {
      return new Response(JSON.stringify({ ok: false, error_code: 502, description: `proxy error: ${err.message}` }), {
        status: 502,
        headers: { "content-type": "application/json" },
      });
    }
  },
};
