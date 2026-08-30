import test from "node:test";
import assert from "node:assert/strict";
import slugs from "../config/article-slugs.json" with { type: "json" };
import { BLOG_FEED, BLOG_ORIGIN, decide, SHORT_LINKS, slugSetFrom } from "../src/routing.js";

const slugSet = slugSetFrom(slugs);

function url(path, host = "https://javan.de") {
  return new URL(path, host);
}

test("serves the landing page for / and static files", () => {
  assert.equal(decide(url("/"), slugSet).type, "asset");
  assert.equal(decide(url("/index.html"), slugSet).type, "asset");
  assert.equal(decide(url("/blinky.svg"), slugSet).type, "asset");
  assert.equal(decide(url("/favicon.ico"), slugSet).type, "asset");
  assert.equal(decide(url("/favicon-192.png"), slugSet).type, "asset");
  assert.equal(decide(url("/og-image.jpg"), slugSet).type, "asset");
  assert.equal(decide(url("/robots.txt"), slugSet).type, "asset");
  assert.equal(decide(url("/sitemap.xml"), slugSet).type, "asset");
  assert.equal(decide(url("/sitemap-main.xml"), slugSet).type, "asset");
  assert.equal(decide(url("/sitemap-subdomains.xml"), slugSet).type, "asset");
  // Retired child sitemap is no longer a landing asset (falls through to origin / 404).
  assert.equal(decide(url("/sitemap-projects.xml"), slugSet).type, "origin");
});

test("redirects www.javan.de to apex preserving path and query", () => {
  const home = decide(url("/", "https://www.javan.de"), slugSet);
  assert.equal(home.type, "redirect");
  assert.equal(home.status, 301);
  assert.equal(home.location, "https://javan.de/");

  const withPath = decide(url("/zoom?x=1", "https://www.javan.de"), slugSet);
  assert.equal(withPath.type, "redirect");
  assert.equal(withPath.status, 301);
  assert.equal(withPath.location, "https://javan.de/zoom?x=1");

  const article = decide(url("/the-future-security-engineer/", "https://www.javan.de"), slugSet);
  assert.equal(article.type, "redirect");
  assert.equal(article.location, "https://javan.de/the-future-security-engineer/");
});

test("does not redirect apex or workers.dev hosts via www rule", () => {
  assert.equal(decide(url("/"), slugSet).type, "asset");
  assert.equal(decide(url("/", "https://www-javan.example.workers.dev"), slugSet).type, "asset");
});

test("redirects RSS URLs to the static blog feed", () => {
  for (const path of ["/feed/", "/feed", "/rss/", "/comments/feed/", "/feed.xml", "/?feed=rss2"]) {
    const decision = decide(url(path), slugSet);
    assert.equal(decision.type, "redirect", path);
    assert.equal(decision.status, 301, path);
    assert.equal(decision.location, BLOG_FEED, path);
  }
});

test("does not treat /feedback as a feed", () => {
  assert.equal(decide(url("/feedback"), slugSet).type, "origin");
});

test("redirects known article slugs to blog.javan.de", () => {
  const decision = decide(url("/the-future-security-engineer/"), slugSet);
  assert.equal(decision.type, "redirect");
  assert.equal(decision.status, 301);
  assert.equal(decision.location, `${BLOG_ORIGIN}/the-future-security-engineer/`);
});

test("redirects article comment/feed subpaths to the article on the blog", () => {
  const decision = decide(url("/the-future-security-engineer/feed/"), slugSet);
  assert.equal(decision.type, "redirect");
  assert.equal(decision.location, `${BLOG_ORIGIN}/the-future-security-engineer/`);
});

test("keeps WordPress login and admin on the origin", () => {
  for (const path of ["/wp-login.php", "/wp-admin/", "/wp-json/", "/wp-content/uploads/x.jpg"]) {
    assert.equal(decide(url(path), slugSet).type, "origin", path);
  }
});

test("blocks WordPress XML-RPC and fingerprint files", () => {
  for (const path of ["/xmlrpc.php", "/readme.html", "/license.txt", "/wp-admin/install.php", "/wp-admin/setup-config.php"]) {
    const decision = decide(url(path), slugSet);
    assert.equal(decision.type, "block", path);
    assert.equal(decision.status, 404, path);
  }
});

test("unknown permalinks stay on WordPress so new drafts still work", () => {
  assert.equal(decide(url("/a-brand-new-unpublished-slug/"), slugSet).type, "origin");
});

test("preserves existing short links", () => {
  const zoom = decide(url("/zoom"), slugSet);
  assert.equal(zoom.type, "redirect");
  assert.equal(zoom.status, 301);
  assert.match(zoom.location, /zoom\.us/);

  const meet = decide(url("/meet/"), slugSet);
  assert.equal(meet.status, SHORT_LINKS.meet.status);
  assert.equal(meet.location, SHORT_LINKS.meet.location);

  const csslp = decide(url("/csslp"), slugSet);
  assert.equal(csslp.status, 302);
});

test("covers exported article slugs including percent-encoded emoji paths", () => {
  assert.ok(slugs.includes("the-future-security-engineer"));
  assert.ok(slugs.length >= 63);
  const decoded = slugs.find((slug) => slug.includes("hacking-lotto") && !slug.includes("%"));
  assert.ok(decoded);
  const decision = decide(url(`/${decoded}/`), slugSet);
  assert.equal(decision.type, "redirect");
  assert.equal(decision.location, `${BLOG_ORIGIN}/${encodeURI(decoded)}/`);

  const encoded = slugs.find((slug) => slug.includes("hacking-lotto-%"));
  assert.ok(encoded);
  assert.equal(decide(url(`/${encoded}/`), slugSet).type, "redirect");
});
