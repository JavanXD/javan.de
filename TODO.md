# javan.de

Working queue for the arcade landing Worker that sits in front of WordPress on `javan.de` / `www.javan.de`.

- [x] **Shared SEO @javan/web 0.2.0 (2026-11-22).** shareMetaTags/chromeHeadTags + Person `@id` https://javan.de/#person + AI robots Allow list (14) + theme-color/color-scheme defaults. Vendored `social/` + `seo/`.
- [x] **SEO harden + footer RSS @javan/web 0.2.2 (2026-11-23).** Solid white mail + RSS chips; apex `og-image.jpg` in defaults; share-meta markers on static hosts; Person compact on imprint/unagentic/secure-coding; privacy OG dims; catalog AI robots; apex Sitemap dedupe.
- [x] **Footer CSS isolation @javan/web 0.2.3 (2026-11-23).** Vendored `javan-footer.css` ships unlayered (host `@layer` CSS can no longer restyle it); stronger link resets; imprint/training host overrides trimmed; privacy opacity override removed.
- [x] **Shared CSS tokens Wave 1 @javan/web 0.2.4 (2026-11-23).** Arcade `--javan-*` tokens + `javan-tokens.css`; blog + projects alias bridges and split stylesheets. Look unchanged.
- [x] **Shared CSS Wave 2 @javan/web 0.2.4 (2026-11-23).** unagentic / secure-coding / imprint / about / training hub+catalog adopt tokens + split styles (local overrides kept); apex arcade CSS extracted to `/styles/arcade.css` with CSP `style-src 'self'` + SVG hashes.
- [x] **Shared CSS Wave 3 @javan/web 0.2.5 (2026-11-23).** Shared `javan-arcade.css` (atmosphere / pellets / mono `.button*`); blog + projects drop host duplicates; secure-coding loads arcade and keeps quieter atmosphere + sans button overrides.
- [x] **Shared CSS Wave 4 @javan/web 0.2.6 (2026-11-23).** Arcade `--arcade-*` theme hooks + dual glow classes; about adopts shared arcade (keeps pac/lockup/theme); package `base.css` drops global `a:hover` (hosts still do not load it). Apex host arcade unchanged.
- [x] **Shared CSS Wave 5 pin unify @javan/web 0.2.6 (2026-11-23).** Re-synced blog / projects / secure-coding / imprint / unagentic / training / apex vendor pins so tokens+footer+arcade hooks match about. Look unchanged (arcade consumers use dark fallbacks; SC quieter + unagentic unique atmosphere stay host-local).
- [x] **Footer RSS label @javan/web 0.2.7 (2026-11-23).** RSS link matches mail: icon + visible `RSS` text (not icon-only).
- [x] **Footer place line @javan/web 0.2.8 (2026-11-23).** `Made in Black Forest, Germany 🌲` (was BW).
- [x] **Shared CSS Wave 6 hygiene (2026-11-23).** Keep package `base.css` unused on hosts; keep unagentic unique atmosphere; apex host `styles/arcade.css` stays. Sync scripts also resolve `02-library/web` (SSOT) beside `brand-system/web`.
- [x] **Post-wave gap fix (2026-11-23).** `workers_dev: false` on blog + apex (custom-domain-only baseline). Config test expects `workers_dev`/`preview_urls` false. SC CTA external buttons use `aria-label` for new-tab hint; `.visually-hidden` gains `clip-path: inset(50%)`.
- [x] **Wave 7 ops hygiene (2026-11-23).** Apex `npm run validate` green after arcade extract (`style-src 'self'` + SVG hashes). Training hub: `npm run deploy:hub` mirrors CI (sync `@javan/web` + catalog export + wrangler) when `javan-training` Actions billing blocks.
- [x] **Footer mobile denser + RSS invert @javan/web 0.2.9 (2026-11-24).** Tighter padding; identity split (name/place left, mail/RSS/Imprint right, top-aligned on narrow); RSS transparent chip + white frame/mark (pair to mail).

## Current / next / ops

- **Now:** Shared CSS Waves 1–6 settled; footer mobile denser on `@javan/web` **0.2.9**. Wave 7 ops hygiene done — apex `npm run validate` passes (CSP hashes match dist). P1 quota-free edge is live (2026-09-01). **Bulk Redirects** list `javan_de_quota_free` + account phase rule synced (288 items). **Transform Rules** on `javan.de` for `tt-cheatsheet` + `aroundtheworld` (2 rules); obsolete **`javan-gh-pages-headers` Worker deleted** *(2026-09-01)*. Arcade `/` + `_headers` are Static Assets (0 Worker quota). Zone Single Redirect `www.javan.de` → apex (rule `78323227…`, **10/10**). Known article/feed/short-link 301s via `_redirects` + Bulk (www copies + newsletter/digest homepage). WP login/admin + scanners still Worker. Cloudflare Worker script renamed `www-javan` → **`javan-de`** (2026-08-30); GitHub repo renamed `www.javan.de` → **`javan.de`** (2026-08-31). **asec.app** zone **Active** on Javan (`grace`/`martin`): apex + `www` **301 → https://javan.de/**; `secure-coding.asec.app` **301 → https://secure-coding.javan.de/** (path dropped). **BIMI** `/bimi-logo.svg` Blinky Tiny PS — foot/skirt pixels restored 2026-09-03 (`javan.eu` TXT still points here).
- **Next (shared CSS):** look-change only — package `base.css` host adopt, or unagentic → shared arcade. Shared CSS framework otherwise idle; no new CSS waves unless a regression appears.
- **Ops gap:** `javan-training` org Actions still blocked by billing/spending limit (human). Workaround: from `training.javan.de` run `npm run deploy:hub` (CI-parity local path). Fix org billing when you can.
- **Next (cost / abuse):** WAF scanner Blocks live (2026-11-23). Optional permalink rate-limit still open (Worker RL binding — Free zone RL = leaked-cred). Playbook: `~/Projects/rasok.at/docs/CLOUDFLARE-BASELINE.md`. **You:** unpublish leftover Google Sites custom domains (`www` / `secure-coding` / `test.asec.app`, and `asec.yaaw.de` if mapped); optional mail smoke any `@asec.app` → Gmail; optional **add** CF DS at Hetzner when you want DNSSEC live (remove-old-DS is **N/A** — public DS empty; CF already `pending`).
- **Later:** Search Console — submit apex sitemap. Refresh Facebook Sharing Debugger / WhatsApp cache after OG change. Dependabot merges (handled separately); WordPress privacy / publish webhook for blog sync stays in `blog.javan.de`. Cross-host SEO/favicon follow-ups from 2026-08-29 audit (other repos — see below).
- **Ops:** Always land on `main`. No feature branches or PRs for this repo except Dependabot. Never attach this Worker as a Cloudflare **custom domain** on apex/www. Cloudflare spend: keep this zone **Free**; do not buy Pro for extra Single Redirects (**Bulk Redirects** / zone rules first; Worker only as slot workaround). Umbrella 2026-09-01: **no Workers Paid**; **quota-free is better** (this checklist P1). Cross-account playbook: `~/Projects/rasok.at/docs/CLOUDFLARE-BASELINE.md`.

## Needs your decision

- [x] **Shared design for all `*.javan.de` sites (2026-11-22):** how shared CSS variables, base styles, footer, logo, and profile photo reach the sites. Decided 2026-11-22: **shared source repo; each site builds in a pinned copy and serves it from its own domain** (no runtime stylesheet on `static.javan.de`).
- [x] **Shared design — reference look:** which current site look the shared CSS variables and base styles start from. Decided 2026-11-22: **bronze palette** from about, blog, projects, training (`#d4a574` accent, `#0f0f0f` background, Arial Black headlines, system fonts).
- [x] **Shared design — site exceptions:** none. All sites use the shared bronze colors and system fonts; yellow and red stay only in logos and illustrations. *(2026-11-22)*
- [x] **Shared design — package contents (v1):** CSS variables + base page styles + shared footer + Blinky logo + profile photo + shared nav cards, buttons, and typography helpers. *(2026-11-22)*
- [x] **Shared design — source location:** `javan-personal-branding/brand-system/web/` (versioned web package with its own README/tags; graphics tokens stay separate for now). *(2026-11-22)*
- [x] **Shared design — site consumption:** private npm package, version pinned in each site’s `package.json`, copied into that site’s build output and served from the same origin. *(2026-11-22)*
- [x] **Shared design — footer:** identity split (name/place · mail/RSS/Imprint); “Made in Black Forest, Germany 🌲” + Germany flag · mail glyph · `javan@rasok.at` · RSS (transparent + white frame) + `RSS` → blog feed · Imprint; subdomain gimmick `[ about | blog | newsletter | projects | training ].javan.de`. Privacy line + `@javan/web` **0.2.9**. *(Updated 2026-11-24 — mobile denser)*
- [x] **Shared design — ship `@javan/web` v0.1.0:** SSOT in `javan-personal-branding/brand-system/web/`; vendored into sites via `npm run sync:javan-web`. Live on **javan.de**, **imprint**, **about**, **blog**, **projects**, **training**, **secure-coding**, **unagentic**. *(2026-11-22)*
- [x] **Shared footer roll-out rule:** before replacing a site footer, inventory unique gimmicks and ask before dropping them. Prefer keep + compose with `@javan/web` identity block rather than a blind swap. *(Compose shipped 2026-11-22.)*
  - **blog (inventory):** keep newsletter CTA above shared footer; replace `footer-inner` lockup/links with `@javan/web` (sites map + Black Forest place line + mail + Imprint).
  - **projects (inventory):** keep “Still building.” / last-indexed lockup (+ Back to top); compose shared footer below; do not drop Blinky/pellets atmosphere. Detail pages: keep “Return to archive”, add shared footer.
  - **training (inventory):** keep “More from the trainer” + Subscribe [un]agentic (+ Admin on hub pages); compose shared footer below.
  - **secure-coding (inventory):** keep lockup + Impressum/Datenschutz/Fortschritt; compose shared footer below.
  - **unagentic / newsletter (inventory):** keep Privacy legal-bar; compose shared footer below (newsletter `aria-current`).
- [x] **Landing footer layout:** arcade `nav a` card styles no longer hit footer links (scoped to `.site-nav`); footer CSS resets host link chrome; envelope is SVG. `@javan/web` **0.1.1**. *(2026-11-22)*
- [x] **Training language:** EN/DE on-site toggle on `/catalog/` only (one URL). No separate Schulungen product page. `about` stays English (theme toggle only). imprint + secure-coding stay German. `/catalog/de/` **301** → `/catalog/?lang=de`. *(Shipped 2026-11-22)*
- [x] **Location copy placement:** cities/region stay in footer and one header line (`header-region`); do not re-stuff About bios, “Why I train”, arcade hero, or catalog ledes. *(Restored 2026-11-22)*
- [x] **Trainer search visibility (2026-11-22):** home city **Stuttgart**; on-site Stuttgart · Karlsruhe · Heilbronn · Pforzheim; other German cities on request; remote DACH. *(Updated 2026-11-22: Frankfurt removed from titles and city lists because Gemini placed Javan in Frankfurt.)*
- [x] **German trainer page location:** same `/catalog/` with `?lang=de` (thin `/catalog/de/` page retired). *(Updated 2026-11-22)*
- [x] **Public contact address:** `javan@rasok.at` as readable plain text on javan.de (footer, JSON-LD `email`, `llms.txt`), about.javan.de, and the training catalog; catalog form stays for inquiries. Cloudflare **Email Obfuscation off** on `javan.de` and `rasok.at` zones. *(Updated 2026-11-22.)*
- [x] **Go / no-go** on the fix plan. *(Go, 2026-11-22. javan.de: title/description, shared Person `https://javan.de/#person`, Training → `/catalog/` + German card, `llms.txt`, `/about` + `/about/` 301 → `about.javan.de` in `_redirects` and Bulk Redirects.)*
- [x] **AI crawler access verified live (2026-11-22).** 108/108 HEAD/GET probes as GPTBot, ChatGPT-User, ClaudeBot, anthropic-ai, Google-Extended, PerplexityBot, Bytespider, CCBot, OAI-SearchBot, Gemini/CloudVertex, cohere-ai, meta-externalagent → 200 on javan.de, about, catalog EN/DE, blog, projects, secure-coding, unagentic, llms.txt. Cloudflare: BFM Off, AI Search/Agent/Training Allow, no AI WAF blocks (only Tor challenge). robots.txt expanded with explicit Allow for those agents.
- [x] **Google Business Profile (2026-11-22):** logo + cover uploaded by owner. *(Service-area / category / hours assumed set with that pass; website `https://javan.de/`.)*
- [x] **HoneyPi legal noindex (2026-11-22).** CF Transform Rule on `honey-pi.de`: `X-Robots-Tag: noindex, nofollow` for `/impressum*` + `/datenschutzvereinbarungen*` (no Worker). Impressum copy updated in WP by owner; footer + JSON-LD skipped.
- [x] **HoneyPi Soft 404 (GSC 2026-11-09) — won’t fix (2026-11-22).** Cause: `/page/N/` 200 with front-page HTML + empty `/category/uncategorized/`. No WordPress change; no CF redirects. Leave GSC Soft 404 as-is.
- [ ] **You:** Directories still showing `asec.app` + Dorfäckerweg as the public software shop (e.g. meinestadt) — set website to `https://javan.de/` where claimable.
- [x] **Cloudflare crawler audit (2026-11-22).** Zone `javan.de`: Bot Fight Mode Off (`fight_mode=false`); AI Search/Agent/Training/User = Allow (`ai_*=disabled` = not blocking); managed robots.txt Off; Email Address Obfuscation **Off**. Same AI Allow on `asec.app` / `javan.eu`. `rasok.at` Email Obfuscation Off. Site `robots.txt` explicitly Allows GPTBot, Claude, Perplexity, Google-Extended.
- [ ] **You:** Search Console URL inspection → request indexing for `https://javan.de/`, `https://training.javan.de/catalog/`, `https://imprint.javan.de/`; import Bing Webmaster Tools. Sitemap paste: `https://javan.de/sitemap.xml` (workflow `sitemap-indexing.yml` prints GSC + Bing UI links; it does not submit). `/catalog/de/` is a 301 only.
- [x] **HoneyPi / trainer entity split — code side (2026-11-22).** Person `sameAs` includes imprint.javan.de (not honey-pi.de); about + projects model HoneyPi as `SoftwareApplication` with `creator` → `#person`; imprint Geltungsbereich. Live smoke OK on imprint / about / javan.de / projects honeypi page.
- [x] **AI overview spot-check (2026-11-22):** “Javan Rasokat Security Trainer Stuttgart” → KI-Übersicht = Stuttgart trainer + about/javan.de; no HoneyPi street. GBP done; GSC + directories still open.

## Cloudflare cost — WP scan / request-pool hygiene (Javan account)

**Why:** Every **Worker invocation** counts against the **account-wide** Free 100k requests/day (shared with blog, about, unagentic, leftover labs, Ferienhaus). That is **not** origin bandwidth. Scanners probing `/wp-login.php`, `/wp-admin/`, and invented permalinks all go `decide` → `origin` → `fetch(request)` **and still count** even if Cache API later avoids a second WordPress hit. **Static Assets are free and unlimited only when the Worker does not run.** Landing files under `dist/` skip the Worker. Unknown permalinks and `/wp-*` still invoke it. Do **not** buy Workers Paid on Javan to absorb scans; fix routing / edge instead.

**Static vs Worker (quota):**

- **Workers Static Assets** (file in `dist/`, and `run_worker_first` does **not** match that path) → **$0, 0 Worker quota**. Landing arcade + `_headers` / `_redirects` use this. `run_worker_first` is **off** (2026-09-01).
- **Cache API / CDN cache in front of WP origin** → still a **Worker request** whenever this script runs. Saves origin CPU, **not** the 100k cap.
- **WordPress HTML cannot become Static Assets** on this Worker unless those pages are files in `dist/` (that is already `blog.javan.de`). Remaining `/wp-*` + unknown slugs are inherently origin passthrough → Worker.
- Zone WAF custom rules for scanner/junk paths **before** the Worker can 403 with **no** Worker invocation (saves quota). **Do not** enable Bot Fight Mode (baseline: indexed everywhere + allow AI agents). Edge 404 **inside** the Worker still counts.

P1 is the viral-isolation plan (decided 2026-09-01). Cache API stays for leftover WP origin hits; it does not protect training.javan.de from a 100k clip.

### P0 — Cut origin load (implement soon)

- [x] **Cache public WordPress GET HTML** via Cache API / `caches.default` in front of origin passthrough. TTL **24h** (`ORIGIN_CACHE_MAX_AGE` in `src/origin-cache.js`). Cache key: GET + URL (no Cookie on request).
- [x] **Never cache:** `/wp-login.php`, `/wp-admin/*`, Cookie/Authorization, POST+, preview/nonce query params, non-2xx, non-HTML, Set-Cookie — enforced in `isOriginCacheableRequest` / `isOriginCacheableResponse`.
- [x] **Expand edge 404 blocklist** — `isWpBlockedPath()` in `src/routing.js`: xmlrpc/readme/license/install/setup-config plus `.env`, `phpmyadmin`, `wlwmanifest.xml`, `wp-config.php`, `wp-json/wp/v2/users`, `wp-includes/*.php`, `wp-content/plugins/*` readme/.php probes, `debug.log`. `/wp-login.php` + `/wp-admin/` still origin.
- [x] **Lower Workers Logs sampling** — `observability.head_sampling_rate: 0.1` (10%; matches reward-copilot).

### P1 — Quota-free edge (decided 2026-09-01)

Standing rule: **if it does not consume Worker quota, it is better.** Worker `fetch` only for work that cannot be Rules / Static Assets / `_headers`.

- [x] **Zone Single Redirect** `www.javan.de` → `https://javan.de` + path + query. *(2026-09-01; rule `78323227…`; zone **10/10**. Worker www 301 is fallback.)*
- [x] **Article / feed / short-link 301s off the Worker** via Static Assets **`_redirects`** (generated from `article-slugs.json` + `SHORT_LINKS`; live 301s carry asset `_headers`). Worker `decide()` remains fallback for `?feed=` and unpublished slugs. **Bulk Redirects** list **`javan_de_quota_free`** + account phase rule for www copies + newsletter/digest homepage aliases *(synced 2026-09-01 via `npm run sync:bulk-redirects`; general All-accounts token)*. Canonical/share **`blog.javan.de`**.
- [x] **Landing asset-first** — `run_worker_first` omitted (default false). `dist/` arcade + `_headers` = free unlimited. Unmatched paths hit the Worker.
- [x] **Keep Worker** for `/wp-login.php`, `/wp-admin/*`, scanner 404s, unpublished/unknown slugs (WP drafts). Optional later: drop catch-all `javan.de/*` so admin is the only origin route.
- [x] **about.javan.de** — assets-only (no `main`); CSP/XFO/cache in **`_headers`**. Trailing-slash XML via `_redirects`. See `about.javan.de/TODO.md`.
- [x] **unagentic.javan.de** — `run_worker_first: ["/api/*", "/privacy", "/privacy/"]`; static HTML/icons via assets + **`_headers`**. Worker stays for signup/D1. `newsletter.javan.de` / `digest.javan.de` **homepage is 200** (canonical still unagentic) until Bulk exists. See `unagentic.javan.de/TODO.md`.
- [x] **`javan-gh-pages-headers`** — per-host **Transform Rules** on zone `javan.de` for `tt-cheatsheet.javan.de` + `aroundtheworld.javan.de` *(rules `gh_pages_common_headers`, `tt_cheatsheet_csp`; ruleset `5433226472194944b9079f48bea8e59e`)*. Obsolete Worker script **deleted** *(2026-09-01)*. **Caveat:** aroundtheworld WP fingerprint **404** + missing-`og:image` HTML injection were Worker-only — now origin/WP (`xmlrpc.php` **405**). Revisit with WAF or origin fix if needed.
- [x] **SHORT_LINKS** (`/zoom` etc.) — on **`_redirects`** (0 Worker quota). Zone slots stay for lab host 301s (now 10/10 including www). Worker copy is fallback.
- [ ] **Optional — rate-limit unknown permalinks** (paths that are not landing assets, not known article slugs, not `/wp-login.php`/`/wp-admin/`): per-IP cap via CF Rate Limiting binding or DO so a single scanner IP cannot burn tens of thousands of origin fetches/day. Return 429 (or edge 404) when exceeded. *(Free zone RL slot is the leaked-cred template — use a Worker Rate Limit binding if/when needed.)*
- [x] **Optional — WAF custom rules** on zone `javan.de` for scanner/junk paths / high-rate 404 bursts (Free ≤5 rules, no regex). Prefer edge block over Paid WAF. **Do not** enable Bot Fight Mode (see [`CLOUDFLARE-BASELINE.md`](../../rasok.at/docs/CLOUDFLARE-BASELINE.md#indexing--ai-crawlers)). *(2026-11-23: 3 Block rules for WP fingerprint / env / plugin probes on apex+www before Worker; kept Challenge Tor. Live smoke: `/xmlrpc.php` + `/.env` → 403; `/` → 200.)*
- [x] **Confirm leftover lab Workers** on Javan are deleted after rasok cutovers (umbrella Javan cleanup) so scans of old hosts cannot steal from this same 100k pool. *(2026-11-23: account script list is only intentional hosts — about/blog/imprint/javan-de/projects/secure-coding/training/unagentic + `javan-de-lab-host-redirects` for asec.app 301s + clipdictate/email-spam-drop/automation-companion-alerts. No orphan lab Workers.)*

### Done when

- [x] Repeat GET of a public WP page within TTL is a Cache API hit (no second origin fetch). *(deploy to verify live)*
- [x] Login/admin and cookie/POST still uncached and usable.
- [x] Known scanner paths 404 at the Worker without origin.
- [x] Log sample &lt; 100% in wrangler.
- [x] Document behavior briefly in README (what is cached / what is not).

## asec.app — hostname 301s (2026-09-10)

No `asec.app` / `*.asec.app` repo. **Schulung** lives at https://secure-coding.javan.de (local: http://127.0.0.1:4173/). Brand park is https://javan.de.

- **Zone:** `asec.app` `dfb714f8d4ec19ff26b601bb0db71431` (**Active**, Javan, Free). Live NS: `grace.ns.cloudflare.com`, `martin.ns.cloudflare.com`. Stays on **Javan** (not Dev).
- **Live 301s** (Bulk list **`asec_app_legacy`** + account rule `eval_asec_app_legacy`; apex/`www`/`test`/`secure-coding` proxied originless `AAAA 100::`):
  - `https://asec.app/*` + `https://www.asec.app/*` + `https://test.asec.app/*` → `https://javan.de/` (**path dropped**)
  - `https://secure-coding.asec.app/*` → `https://secure-coding.javan.de/` (**path dropped**)
- **Mail (2026-09-10, reversed):** inbound-forward role 2 — Email Routing **enabled/ready**; catch-all → existing Worker `email-spam-drop` → verified `javanxd@gmail.com` (spam indications dropped). MX `route*.mx.cloudflare.net`; one SPF `include:_spf.mx.cloudflare.net`; DKIM `cf2024-1._domainkey`; DMARC `p=quarantine; pct=100` + CF Email Auth `rua`. BIMI skipped (no sending brand). Squarespace `_domainconnect` CNAME removed.
- **Re-sync:** `export CLOUDFLARE_ACCOUNT_ID=d4190a56f523423d2c5e6fa542932c35 CLOUDFLARE_API_TOKEN=$(cat ~/Projects/.secrets/cloudflare-general-api-token)` → `npm run sync:asec-app-redirects`.
- **Human leftover:** unpublish Google Sites custom domains (edge already 301s); mail smoke any `@asec.app` → Gmail; optional **add** CF DS at Hetzner (CF DNSSEC `pending` — do not auto-publish). **Remove-old-DS is N/A** (public DS empty 2026-09-10 afternoon).

## Needs your decision

- [x] **Shared CSS Wave 6 — package `base.css` on hosts?** Keep unused (2026-11-23). Hover accent already removed in 0.2.6; host resets still differ — adopt only with an explicit look-preserving host pass later.
- [x] **Shared CSS — unagentic atmosphere:** keep unique (2026-11-23). Host maze/glow stays; do not force `javan-arcade.css` (would change look).
- [x] **asec.app workshop 301 on CF** (Javan zone + `asec_app_legacy`). Live: `secure-coding.asec.app` → `https://secure-coding.javan.de/`. *(2026-09-03 ready; NS Active + smoke 2026-09-10)*
- [x] **asec.app apex / `www` → javan.de.** Decided 2026-09-10: hostname-wide **301** to `https://javan.de/` (drop old Squarespace/Sites paths). No Mailgun.
- [x] **asec.app Email Routing.** Reversed 2026-09-10 (was “do not enable”): catch-all → `email-spam-drop` → Gmail; CF MX/SPF/DKIM; DMARC quarantine + CF `rua`. *(API: routing `enabled`/`ready`; destination verified `2024-04-04`; Worker reused, `workers_dev` off)*
- [x] **asec.app Free security baseline (Active gaps).** HSTS 6mo includeSubDomains no preload; DNSSEC CF=`pending`; script monitoring On; leaked-cred On + Free RL `Leaked credential check` (`a6538c68…`); AI Allow / BFM Off. *(2026-09-10)*
- [x] **`test.asec.app` park.** Proxied originless `AAAA 100::` + Bulk 301 → `https://javan.de/` (path dropped). `_domainconnect` Squarespace CNAME deleted.
- [ ] **You:** Unpublish leftover Google Sites custom domains — Google Sites → **Settings → Custom domains** → remove `www.asec.app` / `secure-coding.asec.app` / `test.asec.app` (and `asec.yaaw.de` if listed). Edge 301s already replace them.
- [ ] **You:** Mail smoke — send to any `@asec.app` address → confirm it lands in Gmail (spam-drop Worker).
- [x] **You:** **[Action required] Remove the DS record for asec.app** — **done/N/A.** Public `dig DS` empty @1.1.1.1 / @grace 2026-09-10 afternoon; CF DNSSEC `pending`; API messages empty. Ignore dashboard/email “remove DS” if it still shows. Do **not** remove anything.
- [ ] **You:** Optional **add** DNSSEC **DS** at Hetzner for `asec.app` when you want DNSSEC live (CF already `pending`; do **not** auto-publish).
- [x] **Shared imprint** at `https://imprint.javan.de/` (assets-only Worker `imprint-javan-de`, noindex). Apex `/imprint` + `/imprint/` **301** via `_redirects` + Bulk. Site footers point at shared host. Contact: `imprint@javan.de`. *(2026-10-24)* Footer CSS broke arcade `style-src` hashes — fixed same day; validate now checks CSP hash ↔ `<style>` match. *(2026-11-22)* Footer stays one row on mobile (dropped the ≤480px `display: grid` override; CSP hash updated in meta + `_headers`).
- [x] **WordPress imprint (1531):** Public `/imprint/` 301s to `imprint.javan.de`; `?p=1531` no longer serves imprint HTML. *(2026-11-22)* Won’t unpublish 1531 in WP admin — not needed. Privacy-policy (1532) still has `kontakt@javan.de` (update when privacy is migrated).
- [x] **Viral blog vs shared Javan 100k Worker cap → isolate (B).** Decided 2026-09-01: **quota-free is better.** Bulk Redirect / `_redirects` for `javan.de/<slug>` 301s; zone www→apex; canonical/share `blog.javan.de`; Worker only for WP admin/login/unknown. Do **not** buy Paid to absorb a viral post. Implement: P1.
- [x] **Headers without a Worker.** Decided 2026-09-01: **anything that does not consume Worker quota is fine and better.** Per-app **`_headers`** (preferred, in git) or zone **Transform Rules** (Free 10, 0 quota; one rule can set many headers). Worker `fetch` headers only when the Worker already generates the response (`/api`, training HTML). Implement: P1 + about / unagentic TODOs.
- [X] Search Console: submit `https://javan.de/sitemap.xml` (and/or keep www if already registered). Prefer apex to match canonical tags.
- [x] `training.javan.de` is `noindex` + `robots.txt` Disallow — **leave as-is.** Confirmed intentional soft-private: training hub delivers class-code / attendee-pack materials (`~/Training/training-hub`, private `javan-training/training.javan.de`); README + Worker set `X-Robots-Tag` / meta robots / `Disallow: /` by design. Do not open for indexing without an explicit product decision.
- [x] **High — `cf-relay.javan.de` open proxy on `*.javan.de`.** Decision (2026-08-30): **Move cf-relay off `*.javan.de` to its own domain**. Done: `cf-relay.rasok.at` + old host **301**. Details: `~/Projects/*.rasok.at/cf-relay/TODO.md`.
- [x] **`javan-gh-pages-headers` → `_headers` / Transform (quota-free).** Decided 2026-09-01: do not keep a header-only Worker on the shared 100k pool. Migrate tt-cheatsheet / aroundtheworld (conference-tracker already on rasok). Source: `workers/javan-gh-pages-headers/`.
- [x] **SHORT_LINKS — prefer quota-free Rules.** Decided 2026-09-01: zone Single Redirect or Bulk when a slot exists (0 Worker quota). Shipped on **`_redirects`** (zone slots full with lab 301s + www). Worker `SHORT_LINKS` is fallback.

## Bulk + Transform token — done (2026-09-01)

**Shipped with widened `~/Projects/.secrets/cloudflare-general-api-token`** (All accounts; Filter Lists + Bulk Redirects + Transform write). Dedicated **`~/Projects/.secrets/javan-de-filter-lists-transform.env` not needed** unless you later narrow the general token.

**Executed:**

- `CLOUDFLARE_ACCOUNT_ID=d4190a56…` + general token → `npm run sync:bulk-redirects` — list **`javan_de_quota_free`** (`a3dc7271…`, **288** items) + account redirect ruleset `99c7e065…` (`eval_javan_de_quota_free`).
- Zone Transform: **2** response-header rules on `javan.de` (ruleset `5433226472194944b9079f48bea8e59e`).
- Detached zone routes + **deleted** obsolete `javan-gh-pages-headers` Worker script.

**Re-sync:** `export CLOUDFLARE_ACCOUNT_ID=d4190a56f523423d2c5e6fa542932c35 CLOUDFLARE_API_TOKEN=$(cat ~/Projects/.secrets/cloudflare-general-api-token)` → `npm run sync:bulk-redirects`.

<details><summary>Original scoped-token checklist (archived)</summary>

1. Log in as **`mail@javan.de`** → API Tokens → Custom token.
2. Permissions: Account Filter Lists Edit, Bulk URL Redirects Edit, Account Rulesets Read, Zone Transform Rules Edit.
3. Account **Javan** only; zone **`javan.de`** only.
4. File: `~/Projects/.secrets/javan-de-filter-lists-transform.env` — **skipped**; general token works.

</details>

## Cutover (done)

- [x] Worker routes in front of WordPress (`javan.de/*`, `www.javan.de/*`), not custom-domain origin.
- [x] Arcade landing assets from `dist/` for `/`, icons, robots, sitemaps.
- [x] Known article slugs + feed paths 301 → `blog.javan.de`.
- [x] Short links (`/zoom`, `/meet`, `/secure-coding`, `/csslp`) on **`_redirects`** (0 Worker quota; Worker `SHORT_LINKS` is fallback). Zone Free-10 slots stay on lab host 301s + www.
- [x] `/wp-login.php` and `/wp-admin/` pass through to WordPress origin.
- [x] Deploy from `main` via GitHub Actions + local wrangler when secrets exist.

## Polish

- [x] Add `favicon-192.png` (192×192 from `blinky.svg`) at repo root; copied by `build:assets`.
- [x] Canonical / OG / Twitter / JSON-LD prefer apex `https://javan.de/`.
- [x] Sitemap index + robots `Sitemap:` line use apex; `rootPages` is apex-only (`www` redirects to apex).
- [x] `www.javan.de` → `javan.de` 301 zone Single Redirect (path + query; rule `78323227…`, **10/10**). Worker `decide()` www 301 is fallback.
- [x] Fix Firefox favicon: CSP `img-src 'self'` (Firefox enforces CSP on favicons; Chrome often does not) + `/favicon.ico` + absolute icon `href`s.
- [x] Fix stale `public/sitemap-main.xml` listing `https://www.javan.de/` → apex only.
- [x] Drop retired `sitemap-projects.xml` child; move sudoku into `subdomainPages`; apex article paths owned by blog sitemap. *(2026-08-30)*
- [x] Optional: `projects.javan.de/sitemap.xml` still lists stale apex article paths (`/pihole-…`, `/condition-injection/`) — fix in the projects repo, not here. *(2026-11-23: portfolio + repo homepages → `blog.javan.de/…`; sitemap now lists the live blog URLs.)*
- [x] Confirm live smoke: homepage, favicon, sitemap on apex; www 301 to apex. *(wrangler deploy + `npm run smoke` passed 2026-08-29)*
- [x] Homepage `<link rel="alternate" type="application/rss+xml">` → `https://blog.javan.de/feed.xml` for feed autodiscovery. *(was missing after cutover; old `/feed/` URLs still 301 correctly)*
- [x] `og:image` / `twitter:image` → `https://javan.de/favicon-192.png` (summary card; square mark). *(deployed; superseded by large card below)*
- [x] Dedicated 1200×630 share JPEG + `twitter:card=summary_large_image`. *(`og-image.jpg` arcade Blinky card; meta + routing + build/validate; deployed via Actions run 33261540488)*

## Cross-host audit index (2026-08-29)

Canvas: `/Users/javan/.cursor/projects/Users-javan-Projects-www-javan-de/canvases/external-security-audit.canvas.tsx`

### Pass (do not regress)

- [x] **javan.de / www.javan.de** — hygiene Pass for headers/favicon/OG path; WP login/xmlrpc by design (Warn tracked below).
- [x] **projects.javan.de** — baseline headers 2026-08-29.
- [x] **blog.javan.de** — favicon.ico + homepage PNG `og:image` shipped; optional CSP still open in `blog.javan.de/TODO.md`.
- [x] **about.javan.de** — favicon.ico + Worker headers.
- [x] **newsletter → unagentic.javan.de** — intentional 301; unagentic headers Pass.
- [x] **algocue.javan.de** — was Pass on headers; PNG OG + favicon.ico added 2026-08-29 (`LeetCodeTrainer`).
- [x] **training.javan.de** — intentional noindex (decision above).

### Hygiene shipped this session

- [x] **tt-cheatsheet.javan.de** — favicon + PNG OG + Referrer/XFO via `javan-gh-pages-headers`; 2026-08-30 follow-up: exclude `TODO.md` from public site, real `favicon-192.png` (stop using OG as icon), strip GH Pages `Access-Control-Allow-Origin: *` at edge (`TrustedTypes-Cheatsheet`).
- [x] **aroundtheworld.javan.de** — Referrer/XFO via Worker; `og:image` PNG injected when missing (existing travel PNG).
- [x] **luna.javan.de** — PNG `og:image` + `/favicon.ico` (`Luna/web`).
- [x] **flights.javan.de** — real `/favicon.ico`; probe paths hard 404 (`FlightMap`).
- [x] **conference-tracker.javan.de** — Referrer/XFO via Worker; root `/favicon.ico`.
- [x] **cf-relay.javan.de** — real PNG OG; framing/Referrer headers; robots/sitemap. *(own-domain move decided — see below)*
- [x] **oslo-coffee-club.javan.de** — taken offline 2026-08-31 (deleted proxied A record; authoritative NXDOMAIN). Not in sitemaps/catalog. Origin VPS files were not touched.

### Security findings (track)

- [x] No accidental `.env` / `.git` / backup secret dumps across hosts (2026-08-29 probes).
- [x] **High — Move cf-relay off `*.javan.de` to its own domain** (open proxy bypasses zone security protections). Target is **`cf-relay.rasok.at`** on account **`rasok.at - Dev`**. *Done 2026-08-31; re-verified 2026-09-01: new host **200** + proxy, old **301** path+query, Javan route detached; leftover Javan script **`cf-relay` deleted** 2026-09-01.* Details: `~/Projects/*.rasok.at/cf-relay/TODO.md`.
- [x] Warn: WP login / xmlrpc / readme on **javan.de** + **aroundtheworld** — by design? Disable xmlrpc / fingerprint files if unused (Medium). *(2026-08-30: edge 404 for `/xmlrpc.php`, `/readme.html`, `/license.txt`, `/wp-admin/install.php`, `/wp-admin/setup-config.php` via `javan-de` Worker + `javan-gh-pages-headers` for ATW. `/wp-login.php` + `/wp-admin/` still origin.)*
- [x] Warn/Low: missing CSP on **blog** / **luna** (optional). *(enforcing CSP shipped 2026-08-30; also tt-cheatsheet + conference-tracker via edge Worker; cf-relay HTML UI only)*
- [x] Low: `Access-Control-Allow-Origin: *` on **flights** — drop if unused. *(FlightMap middleware strips ACAO on `/*`; pages.dev + cache-busted URLs clean. Custom-domain CDN may HIT pre-change `/data/*`/`favicon.ico` until TTL or a Cache Purge — current API tokens lack purge. tt-cheatsheet + conference-tracker + aroundtheworld already stripped via `javan-gh-pages-headers`)*

### Repo TODO paths

| Host | Repo TODO |
|------|-----------|
| javan.de (index) | `~/Projects/*.javan.de/javan.de/TODO.md` |
| tt-cheatsheet | `~/Projects/*.javan.de/tt-cheatsheet.javan.de/TrustedTypes-Cheatsheet/TODO.md` |
| conference-tracker | `~/Projects/ConferenceTracker/TODO.md` |
| luna | `~/Projects/Luna/TODO.md` |
| algocue | `~/Projects/LeetCodeTrainer/TODO.md` |
| flights | `~/Projects/FlightMap/TODO.md` |
| cf-relay | `~/Projects/*.rasok.at/cf-relay/TODO.md` |
| blog / about / projects / newsletter | respective `*/TODO.md` (Pass items already checked) |

## Out of scope

- Merging Dependabot PRs (another agent).
- Changing WordPress content trees (except edge header/OG injection for aroundtheworld).
- Attaching the arcade Worker as a Cloudflare **custom domain** on `javan.de` / `www.javan.de`.
- Silently disabling cf-relay public proxy before the own-domain cutover.