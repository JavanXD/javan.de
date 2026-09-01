import test from "node:test";
import assert from "node:assert/strict";
import { BLOG_FEED, BLOG_ORIGIN, SHORT_LINKS } from "../src/routing.js";
import { bulkRedirectItems, staticRedirectsFile } from "../scripts/quota-free-redirects.mjs";

test("bulk list covers apex article, feed, short link, and newsletter homepage", () => {
  const items = bulkRedirectItems();
  const sources = new Set(items.map((item) => item.redirect.source_url));
  assert.ok(sources.has("https://javan.de/the-future-security-engineer/"));
  assert.ok(sources.has("https://www.javan.de/the-future-security-engineer/"));
  assert.ok(sources.has("https://javan.de/feed/"));
  assert.ok(sources.has("https://javan.de/zoom"));
  assert.ok(sources.has("https://newsletter.javan.de/"));
  assert.ok(sources.has("https://digest.javan.de/"));
  assert.equal(sources.size, items.length);

  const article = items.find((item) => item.redirect.source_url.endsWith("/the-future-security-engineer/"));
  assert.equal(article.redirect.target_url, `${BLOG_ORIGIN}/the-future-security-engineer/`);
  assert.equal(article.redirect.status_code, 301);

  const feed = items.find((item) => item.redirect.source_url === "https://javan.de/feed/");
  assert.equal(feed.redirect.target_url, BLOG_FEED);

  const zoom = items.find((item) => item.redirect.source_url === "https://javan.de/zoom");
  assert.equal(zoom.redirect.status_code, SHORT_LINKS.zoom.status);
  assert.equal(zoom.redirect.preserve_query_string, false);

  const newsletter = items.find((item) => item.redirect.source_url === "https://newsletter.javan.de/");
  assert.equal(newsletter.redirect.subpath_matching, false);
});

test("static _redirects file is path-only for this Worker", () => {
  const file = staticRedirectsFile();
  assert.match(file, /^\/the-future-security-engineer /m);
  assert.match(file, /\/zoom https:\/\/us05web\.zoom\.us\/.* 301/m);
  assert.doesNotMatch(file, /newsletter\.javan\.de/);
});
