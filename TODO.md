# javan.de

Working queue for the arcade landing Worker that sits in front of WordPress on `javan.de` / `www.javan.de`.

## Current / next / ops

- **Now:** P1 quota-free edge is live (2026-09-01). Arcade `/` + `_headers` are Static Assets (0 Worker quota). Zone Single Redirect `www.javan.de` → apex (rule `78323227…`, **10/10**). Known article/feed/short-link 301s via `_redirects` (also 0 quota; Worker `decide()` is fallback for `?feed=` and unpublished slugs). WP login/admin + scanners still Worker. Cloudflare Worker script renamed `www-javan` → **`javan-de`** (2026-08-30); GitHub repo renamed `www.javan.de` → **`javan.de`** (2026-08-31).
- **Next (cost / abuse):** Bulk Redirect list when a token has **Account Filter Lists Edit** (`npm run sync:bulk-redirects`) — covers www copies + `newsletter.javan.de`/`digest.javan.de` homepages. Optional permalink rate-limit / Bot Fight. Playbook: `~/Projects/rasok.at/docs/CLOUDFLARE-COST-OPTIMIZATION.md`.
- **Later:** Search Console — submit apex sitemap. Refresh Facebook Sharing Debugger / WhatsApp cache after OG change. Dependabot merges (handled separately); WordPress privacy / publish webhook for blog sync stays in `blog.javan.de`. Cross-host SEO/favicon follow-ups from 2026-08-29 audit (other repos — see below).
- **Ops:** Always land on `main`. No feature branches or PRs for this repo except Dependabot. Never attach this Worker as a Cloudflare **custom domain** on apex/www. Cloudflare spend: keep this zone **Free**; do not buy Pro for extra Single Redirects (**Bulk Redirects** / zone rules first; Worker only as slot workaround). Umbrella 2026-09-01: **no Workers Paid**; **quota-free is better** (this checklist P1). Cross-account playbook: `~/Projects/rasok.at/docs/CLOUDFLARE-COST-OPTIMIZATION.md`.

## Cloudflare cost — WP scan / request-pool hygiene (Javan account)

**Why:** Every **Worker invocation** counts against the **account-wide** Free 100k requests/day (shared with blog, about, unagentic, leftover labs, Ferienhaus). That is **not** origin bandwidth. Scanners probing `/wp-login.php`, `/wp-admin/`, and invented permalinks all go `decide` → `origin` → `fetch(request)` **and still count** even if Cache API later avoids a second WordPress hit. **Static Assets are free and unlimited only when the Worker does not run.** Landing files under `dist/` skip the Worker. Unknown permalinks and `/wp-*` still invoke it. Do **not** buy Workers Paid on Javan to absorb scans; fix routing / edge instead.

**Static vs Worker (quota):**

- **Workers Static Assets** (file in `dist/`, and `run_worker_first` does **not** match that path) → **$0, 0 Worker quota**. Landing arcade + `_headers` / `_redirects` use this. `run_worker_first` is **off** (2026-09-01).
- **Cache API / CDN cache in front of WP origin** → still a **Worker request** whenever this script runs. Saves origin CPU, **not** the 100k cap.
- **WordPress HTML cannot become Static Assets** on this Worker unless those pages are files in `dist/` (that is already `blog.javan.de`). Remaining `/wp-*` + unknown slugs are inherently origin passthrough → Worker.
- Zone WAF / Bot Fight **before** the Worker can 403 scanners with **no** Worker invocation (saves quota). Edge 404 **inside** the Worker still counts.

P1 is the viral-isolation plan (decided 2026-09-01). Cache API stays for leftover WP origin hits; it does not protect training.javan.de from a 100k clip.

### P0 — Cut origin load (implement soon)

- [x] **Cache public WordPress GET HTML** via Cache API / `caches.default` in front of origin passthrough. TTL **24h** (`ORIGIN_CACHE_MAX_AGE` in `src/origin-cache.js`). Cache key: GET + URL (no Cookie on request).
- [x] **Never cache:** `/wp-login.php`, `/wp-admin/*`, Cookie/Authorization, POST+, preview/nonce query params, non-2xx, non-HTML, Set-Cookie — enforced in `isOriginCacheableRequest` / `isOriginCacheableResponse`.
- [x] **Expand edge 404 blocklist** — `isWpBlockedPath()` in `src/routing.js`: xmlrpc/readme/license/install/setup-config plus `.env`, `phpmyadmin`, `wlwmanifest.xml`, `wp-config.php`, `wp-json/wp/v2/users`, `wp-includes/*.php`, `wp-content/plugins/*` readme/.php probes, `debug.log`. `/wp-login.php` + `/wp-admin/` still origin.
- [x] **Lower Workers Logs sampling** — `observability.head_sampling_rate: 0.1` (10%; matches reward-copilot).

### P1 — Quota-free edge (decided 2026-09-01)

Standing rule: **if it does not consume Worker quota, it is better.** Worker `fetch` only for work that cannot be Rules / Static Assets / `_headers`.

- [x] **Zone Single Redirect** `www.javan.de` → `https://javan.de` + path + query. *(2026-09-01; rule `78323227…`; zone **10/10**. Worker www 301 is fallback.)*
- [x] **Article / feed / short-link 301s off the Worker** via Static Assets **`_redirects`** (generated from `article-slugs.json` + `SHORT_LINKS`; live 301s carry asset `_headers`). Worker `decide()` remains fallback for `?feed=` and unpublished slugs. **Bulk Redirects** still preferred for www copies + newsletter aliases — blocked until a token has Account Filter Lists Edit (`npm run sync:bulk-redirects`). Canonical/share **`blog.javan.de`**.
- [x] **Landing asset-first** — `run_worker_first` omitted (default false). `dist/` arcade + `_headers` = free unlimited. Unmatched paths hit the Worker.
- [x] **Keep Worker** for `/wp-login.php`, `/wp-admin/*`, scanner 404s, unpublished/unknown slugs (WP drafts). Optional later: drop catch-all `javan.de/*` so admin is the only origin route.
- [x] **about.javan.de** — assets-only (no `main`); CSP/XFO/cache in **`_headers`**. Trailing-slash XML via `_redirects`. See `about.javan.de/TODO.md`.
- [x] **unagentic.javan.de** — `run_worker_first: ["/api/*", "/privacy", "/privacy/"]`; static HTML/icons via assets + **`_headers`**. Worker stays for signup/D1. `newsletter.javan.de` / `digest.javan.de` **homepage is 200** (canonical still unagentic) until Bulk exists. See `unagentic.javan.de/TODO.md`.
- [ ] **`javan-gh-pages-headers`** — retire header-only Worker; per-host Transform Rules (or `_headers` after leaving GH Pages). **Blocked:** general API token has no Zone Transform Rules write (403). Keep Worker on `tt-cheatsheet` + `aroundtheworld`. `conference-tracker.javan.de` already 301s to rasok (stale route).
- [x] **SHORT_LINKS** (`/zoom` etc.) — on **`_redirects`** (0 Worker quota). Zone slots stay for lab host 301s (now 10/10 including www). Worker copy is fallback.
- [ ] **Optional — rate-limit unknown permalinks** (paths that are not landing assets, not known article slugs, not `/wp-login.php`/`/wp-admin/`): per-IP cap via CF Rate Limiting binding or DO so a single scanner IP cannot burn tens of thousands of origin fetches/day. Return 429 (or edge 404) when exceeded.
- [ ] **Optional — Bot Fight / WAF custom rules** on zone `javan.de` for obvious scanner UAs / high-rate 404 bursts (Free Bot Fight Mode if not already on). Prefer edge challenge over Paid WAF.
- [ ] **Confirm leftover lab Workers** on Javan are deleted after rasok cutovers (umbrella Javan cleanup) so scans of old hosts cannot steal from this same 100k pool.

### Done when

- [x] Repeat GET of a public WP page within TTL is a Cache API hit (no second origin fetch). *(deploy to verify live)*
- [x] Login/admin and cookie/POST still uncached and usable.
- [x] Known scanner paths 404 at the Worker without origin.
- [x] Log sample &lt; 100% in wrangler.
- [x] Document behavior briefly in README (what is cached / what is not).

## Needs your decision

- [x] **Viral blog vs shared Javan 100k Worker cap → isolate (B).** Decided 2026-09-01: **quota-free is better.** Bulk Redirect / `_redirects` for `javan.de/<slug>` 301s; zone www→apex; canonical/share `blog.javan.de`; Worker only for WP admin/login/unknown. Do **not** buy Paid to absorb a viral post. Implement: P1.
- [x] **Headers without a Worker.** Decided 2026-09-01: **anything that does not consume Worker quota is fine and better.** Per-app **`_headers`** (preferred, in git) or zone **Transform Rules** (Free 10, 0 quota; one rule can set many headers). Worker `fetch` headers only when the Worker already generates the response (`/api`, training HTML). Implement: P1 + about / unagentic TODOs.
- [X] Search Console: submit `https://javan.de/sitemap.xml` (and/or keep www if already registered). Prefer apex to match canonical tags.
- [x] `training.javan.de` is `noindex` + `robots.txt` Disallow — **leave as-is.** Confirmed intentional soft-private: training hub delivers class-code / attendee-pack materials (`~/Training/training-hub`, private `javan-training/training.javan.de`); README + Worker set `X-Robots-Tag` / meta robots / `Disallow: /` by design. Do not open for indexing without an explicit product decision.
- [x] **High — `cf-relay.javan.de` open proxy on `*.javan.de`.** Decision (2026-08-30): **Move cf-relay off `*.javan.de` to its own domain**. Done: `cf-relay.rasok.at` + old host **301**. Details: `~/Projects/*.rasok.at/cf-relay/TODO.md`.
- [x] **`javan-gh-pages-headers` → `_headers` / Transform (quota-free).** Decided 2026-09-01: do not keep a header-only Worker on the shared 100k pool. Migrate tt-cheatsheet / aroundtheworld (conference-tracker already on rasok). Source: `workers/javan-gh-pages-headers/`.
- [x] **SHORT_LINKS — prefer quota-free Rules.** Decided 2026-09-01: zone Single Redirect or Bulk when a slot exists (0 Worker quota). Shipped on **`_redirects`** (zone slots full with lab 301s + www). Worker `SHORT_LINKS` is fallback.

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
- [ ] Optional: `projects.javan.de/sitemap.xml` still lists stale apex article paths (`/pihole-…`, `/condition-injection/`) — fix in the projects repo, not here.
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