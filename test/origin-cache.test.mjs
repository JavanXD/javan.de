import test from "node:test";
import assert from "node:assert/strict";
import {
  ORIGIN_CACHE_MAX_AGE,
  isOriginCacheableRequest,
  isOriginCacheableResponse,
} from "../src/origin-cache.js";

function req(url, init = {}) {
  return new Request(url, init);
}

test("caches only anonymous GET HTML without preview params", () => {
  const url = new URL("https://javan.de/some-post/");
  assert.equal(isOriginCacheableRequest(req(url), url), true);

  assert.equal(
    isOriginCacheableRequest(req(url, { method: "POST" }), url),
    false,
    "POST",
  );
  assert.equal(
    isOriginCacheableRequest(req(url, { headers: { Cookie: "x=1" } }), url),
    false,
    "Cookie",
  );
  assert.equal(
    isOriginCacheableRequest(req(url, { headers: { Authorization: "Bearer x" } }), url),
    false,
    "Authorization",
  );

  const preview = new URL("https://javan.de/draft/?preview=true");
  assert.equal(isOriginCacheableRequest(req(preview), preview), false, "preview");

  const nonce = new URL("https://javan.de/draft/?_wpnonce=abc");
  assert.equal(isOriginCacheableRequest(req(nonce), nonce), false, "_wpnonce");
});

test("never caches wp-login or wp-admin", () => {
  for (const path of ["/wp-login.php", "/wp-admin/", "/wp-admin/index.php"]) {
    const url = new URL(`https://javan.de${path}`);
    assert.equal(isOriginCacheableRequest(req(url), url), false, path);
  }
});

test("stores only successful HTML without Set-Cookie", () => {
  assert.equal(
    isOriginCacheableResponse(
      new Response("<html></html>", {
        status: 200,
        headers: { "Content-Type": "text/html; charset=UTF-8" },
      }),
    ),
    true,
  );

  assert.equal(
    isOriginCacheableResponse(
      new Response("err", { status: 404, headers: { "Content-Type": "text/html" } }),
    ),
    false,
  );
  assert.equal(
    isOriginCacheableResponse(
      new Response("{}", { status: 200, headers: { "Content-Type": "application/json" } }),
    ),
    false,
  );
  assert.equal(
    isOriginCacheableResponse(
      new Response("<html></html>", {
        status: 200,
        headers: { "Content-Type": "text/html", "Set-Cookie": "x=1" },
      }),
    ),
    false,
  );
});

test("origin cache TTL is one day", () => {
  assert.equal(ORIGIN_CACHE_MAX_AGE, 86_400);
});
