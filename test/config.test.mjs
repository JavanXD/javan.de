import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));

test("Worker sits in front of WordPress via routes, not as a custom-domain origin", async () => {
  const source = await readFile(join(root, "wrangler.jsonc"), "utf8");
  const config = JSON.parse(source.replace(/\/\/.*$/gm, ""));

  assert.equal(config.name, "javan-de");
  assert.equal(config.main, "src/index.js");
  assert.equal(config.assets.directory, "./dist");
  assert.equal(config.assets.binding, "ASSETS");
  assert.equal(config.assets.run_worker_first, undefined);
  assert.equal(config.observability.head_sampling_rate, 0.1);
  assert.equal(config.workers_dev, true);

  assert.ok(config.routes.length >= 4);
  for (const route of config.routes) {
    assert.equal(route.custom_domain, undefined, `${route.pattern} must not be a custom domain`);
    assert.equal(route.zone_name, "javan.de");
    assert.match(route.pattern, /^(www\.)?javan\.de(\/\*)?$/);
  }

  const patterns = config.routes.map((route) => route.pattern);
  assert.ok(patterns.includes("javan.de/*"));
  assert.ok(patterns.includes("www.javan.de/*"));
});
