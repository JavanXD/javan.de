import test from "node:test";
import assert from "node:assert/strict";
import {
  BRAND_TARGET,
  LIST_NAME,
  TARGET,
  asecAppRedirectItems,
} from "../scripts/asec-app-host-redirects.mjs";

test("asec.app hosts are hostname-wide 301s that drop old paths", () => {
  const items = asecAppRedirectItems();
  assert.equal(LIST_NAME, "asec_app_legacy");
  assert.equal(items.length, 4);

  const bySource = Object.fromEntries(
    items.map((row) => [row.redirect.source_url, row.redirect]),
  );

  const apex = bySource["https://asec.app/"];
  assert.equal(apex.target_url, BRAND_TARGET);
  assert.equal(apex.status_code, 301);
  assert.equal(apex.subpath_matching, true);
  assert.equal(apex.preserve_path_suffix, false);
  assert.equal(apex.include_subdomains, false);

  const www = bySource["https://www.asec.app/"];
  assert.equal(www.target_url, BRAND_TARGET);
  assert.equal(www.include_subdomains, false);

  const testHost = bySource["https://test.asec.app/"];
  assert.equal(testHost.target_url, BRAND_TARGET);
  assert.equal(testHost.status_code, 301);
  assert.equal(testHost.subpath_matching, true);
  assert.equal(testHost.preserve_path_suffix, false);
  assert.equal(testHost.include_subdomains, false);

  const workshop = bySource["https://secure-coding.asec.app/"];
  assert.equal(workshop.target_url, TARGET);
  assert.equal(workshop.subpath_matching, true);
  assert.equal(workshop.preserve_path_suffix, false);
  assert.equal(workshop.include_subdomains, false);
});
