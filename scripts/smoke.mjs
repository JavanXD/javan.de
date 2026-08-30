#!/usr/bin/env node

const apex = process.env.WWW_SMOKE_URL || "https://javan.de";
const blog = process.env.BLOG_SMOKE_URL || "https://blog.javan.de";
const failures = [];

const homepage = await request(apex, "/");
expectStatus("apex homepage", homepage, 200);
expectHeader("apex homepage", homepage, "content-type", /text\/html/i);
if (homepage) {
  const body = await homepage.text();
  if (!/<h1>javan<span>\.de<\/span><\/h1>/.test(body) || !/arcade-mark/.test(body)) {
    failures.push("apex homepage is not the arcade landing page");
  }
  if (body.includes("wp-json") || /cf-edge-cache:\s*cache,platform=wordpress/i.test(homepage.headers.get("cf-edge-cache") || "")) {
    failures.push("apex homepage still looks like WordPress");
  }
}

const www = await request("https://www.javan.de", "/", { redirect: "manual" });
expectStatus("www homepage", www, 301);
expectHeader("www homepage", www, "location", /^https:\/\/javan\.de\/?$/);

const wwwPath = await request("https://www.javan.de", "/zoom?x=1", { redirect: "manual" });
expectStatus("www path+query", wwwPath, 301);
expectHeader("www path+query", wwwPath, "location", /^https:\/\/javan\.de\/zoom\?x=1$/);

const feed = await request(apex, "/feed/", { redirect: "manual" });
expectStatus("RSS /feed/", feed, 301);
expectHeader("RSS /feed/", feed, "location", /^https:\/\/blog\.javan\.de\/feed\.xml$/);

const rss = await request(apex, "/rss/", { redirect: "manual" });
expectStatus("RSS /rss/", rss, 301);
expectHeader("RSS /rss/", rss, "location", /^https:\/\/blog\.javan\.de\/feed\.xml$/);

const article = await request(apex, "/the-future-security-engineer/", { redirect: "manual" });
expectStatus("article redirect", article, 301);
expectHeader(
  "article redirect",
  article,
  "location",
  /^https:\/\/blog\.javan\.de\/the-future-security-engineer\/$/,
);

const login = await request(apex, "/wp-login.php", { redirect: "manual" });
expectStatus("wp-login.php", login, 200);
expectHeader("wp-login.php", login, "content-type", /text\/html/i);
expectBody("wp-login.php", login, /loginform|WordPress/i);

for (const blocked of ["/xmlrpc.php", "/readme.html", "/license.txt"]) {
  const res = await request(apex, blocked, { redirect: "manual" });
  expectStatus(`blocked ${blocked}`, res, 404);
}

const admin = await request(apex, "/wp-admin/", { redirect: "manual" });
if (!admin || (admin.status !== 302 && admin.status !== 301)) {
  failures.push(`wp-admin/ returned ${admin?.status ?? "nothing"}, expected a redirect to login`);
}

const zoom = await request(apex, "/zoom", { redirect: "manual" });
expectStatus("/zoom", zoom, 301);
expectHeader("/zoom", zoom, "location", /zoom\.us/);

const mirror = await request(blog, "/the-future-security-engineer/");
expectStatus("blog mirror article", mirror, 200);
expectBody("blog mirror article", mirror, /The Future Security Engineer/);

const mirrorFeed = await request(blog, "/feed.xml");
expectStatus("blog mirror feed", mirrorFeed, 200);
expectHeader("blog mirror feed", mirrorFeed, "content-type", /xml/i);

if (failures.length) {
  console.error("Smoke check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Smoke check passed against ${apex} (blog ${blog}).`);
}

async function request(origin, pathname, init = {}) {
  const url = new URL(pathname, `${origin.replace(/\/$/, "")}/`);
  try {
    return await fetch(url, { redirect: init.redirect || "follow" });
  } catch (error) {
    failures.push(`${url} failed to fetch (${error.message})`);
    return null;
  }
}

function expectStatus(label, response, status) {
  if (!response) return;
  if (response.status !== status) failures.push(`${label} returned ${response.status}, expected ${status}`);
}

function expectHeader(label, response, name, pattern) {
  if (!response) return;
  const value = response.headers.get(name) || "";
  if (!pattern.test(value)) failures.push(`${label} ${name} is ${value || "(missing)"}`);
}

async function expectBody(label, response, pattern) {
  if (!response) return;
  const body = await response.text();
  if (!pattern.test(body)) failures.push(`${label} body did not match ${pattern}`);
}
