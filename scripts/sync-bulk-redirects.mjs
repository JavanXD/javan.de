#!/usr/bin/env node
/**
 * Upsert account Bulk Redirect list `javan_de_quota_free` from this repo.
 * Source: CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID (general All-accounts token
 * or ~/Projects/.secrets/javan-de-filter-lists-transform.env if scoped later).
 * Does not print the token.
 */
import { bulkRedirectItems } from "./quota-free-redirects.mjs";

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const LIST_NAME = "javan_de_quota_free";

if (!ACCOUNT || !TOKEN) {
  console.error("Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN");
  process.exit(1);
}

const api = async (method, path, body) => {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.success) {
    const err = json.errors?.map((e) => e.message).join("; ") || res.statusText;
    throw new Error(`${method} ${path}: ${err}`);
  }
  return json;
};

const items = bulkRedirectItems();
const lists = await api("GET", `/accounts/${ACCOUNT}/rules/lists`);
let list = (lists.result || []).find((row) => row.name === LIST_NAME);
if (!list) {
  const created = await api("POST", `/accounts/${ACCOUNT}/rules/lists`, {
    name: LIST_NAME,
    description: "javan.de article/feed/short-link + newsletter homepage 301s (quota-free)",
    kind: "redirect",
  });
  list = created.result;
  console.log(`Created list ${LIST_NAME} (${list.id})`);
} else {
  console.log(`Using list ${LIST_NAME} (${list.id})`);
}

const put = await api("PUT", `/accounts/${ACCOUNT}/rules/lists/${list.id}/items`, items);
const opId = put.result?.operation_id;
if (!opId) throw new Error("No operation_id from list item PUT");

for (let i = 0; i < 30; i++) {
  const op = await api("GET", `/accounts/${ACCOUNT}/rules/lists/bulk_operations/${opId}`);
  const status = op.result?.status;
  if (status === "completed") break;
  if (status === "failed") throw new Error(`bulk operation failed: ${JSON.stringify(op.result)}`);
  await new Promise((r) => setTimeout(r, 1000));
  if (i === 29) throw new Error(`bulk operation still ${status}`);
}

let entry;
try {
  entry = await api("GET", `/accounts/${ACCOUNT}/rulesets/phases/http_request_redirect/entrypoint`);
} catch {
  entry = null;
}

const rule = {
  ref: "eval_javan_de_quota_free",
  expression: `http.request.full_uri in $${LIST_NAME}`,
  description: "Bulk Redirects: javan.de quota-free 301s",
  action: "redirect",
  action_parameters: {
    from_list: { name: LIST_NAME, key: "http.request.full_uri" },
  },
};

if (!entry?.result?.id) {
  const created = await api("POST", `/accounts/${ACCOUNT}/rulesets`, {
    name: "Redirect rules ruleset",
    kind: "root",
    phase: "http_request_redirect",
    rules: [rule],
  });
  console.log(`Created account redirect ruleset ${created.result.id}`);
} else {
  const existing = entry.result.rules || [];
  if (!existing.some((row) => row.ref === rule.ref || row.action_parameters?.from_list?.name === LIST_NAME)) {
    await api("POST", `/accounts/${ACCOUNT}/rulesets/${entry.result.id}/rules`, rule);
    console.log("Added Bulk Redirect rule to existing account ruleset");
  } else {
    console.log("Bulk Redirect rule already present");
  }
}

console.log(`Synced ${items.length} Bulk Redirect items`);
