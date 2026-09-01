/** Public WordPress HTML cache TTL (24h). Saves origin CPU; Worker still runs per request. */
export const ORIGIN_CACHE_MAX_AGE = 86_400;

const UNCACHED_QUERY_KEYS = new Set([
  "preview",
  "preview_id",
  "preview_nonce",
  "preview_path",
  "_wpnonce",
  "nonce",
]);

/**
 * Whether a GET origin passthrough request may use the Cache API.
 * Authenticated, admin, and preview traffic always bypasses the cache.
 */
export function isOriginCacheableRequest(request, url) {
  if (request.method !== "GET") return false;
  if (request.headers.has("Cookie")) return false;
  if (request.headers.has("Authorization")) return false;

  const pathname = url.pathname.toLowerCase();
  if (pathname === "/wp-login.php") return false;
  if (pathname === "/wp-admin" || pathname.startsWith("/wp-admin/")) return false;

  for (const key of url.searchParams.keys()) {
    if (UNCACHED_QUERY_KEYS.has(key.toLowerCase())) return false;
  }

  return true;
}

/** Whether an origin response may be stored in caches.default. */
export function isOriginCacheableResponse(response) {
  if (response.status < 200 || response.status >= 300) return false;

  const type = (response.headers.get("Content-Type") || "").toLowerCase();
  if (!type.startsWith("text/html")) return false;
  if (response.headers.has("Set-Cookie")) return false;

  return true;
}

function cacheKeyRequest(request) {
  return new Request(request.url, { method: "GET" });
}

function withCacheTtl(response) {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", `public, max-age=${ORIGIN_CACHE_MAX_AGE}, s-maxage=${ORIGIN_CACHE_MAX_AGE}`);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/** Fetch WordPress origin with Cache API in front (GET HTML only). */
export async function fetchOriginWithCache(request, ctx) {
  const url = new URL(request.url);
  const cacheable = isOriginCacheableRequest(request, url);
  const cache = caches.default;
  const cacheKey = cacheKeyRequest(request);

  if (cacheable) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  const response = await fetch(request);

  if (cacheable && isOriginCacheableResponse(response)) {
    const toStore = withCacheTtl(response.clone());
    ctx.waitUntil(cache.put(cacheKey, toStore));
  }

  return response;
}
