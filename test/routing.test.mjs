import test from "node:test";
import assert from "node:assert/strict";
import slugs from "../config/article-slugs.json" with { type: "json" };
import { BLOG_FEED, BLOG_ORIGIN, decide, SHORT_LINKS, slugSetFrom } from "../src/routing.js";

const slugSet = slugSetFrom(slugs);

function url(path) {
  return new URL(path, "https://javan.de");
}

test("serves the landing page for / and static files", () => {
  assert.equal(decide(url("/"), slugSet).type, "asset");
  assert.equal(decide(url("/index.html"), slugSet).type, "asset");
  assert.equal(decide(url("/blinky.svg"), slugSet).type, "asset");
  assert.equal(decide(url("/robots.txt"), slugSet).type, "asset");
  assert.equal(decide(url("/sitemap.xml"), slugSet).type, "asset");
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
  for (const path of ["/wp-login.php", "/wp-admin/", "/wp-json/", "/xmlrpc.php", "/wp-content/uploads/x.jpg"]) {
    assert.equal(decide(url(path), slugSet).type, "origin", path);
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
