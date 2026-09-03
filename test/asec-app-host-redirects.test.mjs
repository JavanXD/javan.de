import test from "node:test";
import assert from "node:assert/strict";
import { LIST_NAME, TARGET, asecAppRedirectItems } from "../scripts/asec-app-host-redirects.mjs";

test("asec.app secure-coding is a hostname-wide 301 that drops old paths", () => {
  const items = asecAppRedirectItems();
  assert.equal(LIST_NAME, "asec_app_legacy");
  assert.equal(items.length, 1);
  const { redirect } = items[0];
  assert.equal(redirect.source_url, "https://secure-coding.asec.app/");
  assert.equal(redirect.target_url, TARGET);
  assert.equal(redirect.status_code, 301);
  assert.equal(redirect.subpath_matching, true);
  assert.equal(redirect.preserve_path_suffix, false);
  assert.equal(redirect.include_subdomains, false);
});
