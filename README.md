# www.javan.de sitemap automation

This repository hosts the root sitemap index for `javan.de`/`www.javan.de` and
automates sitemap submission to search engines.

## What this setup does

- Generates:
  - `public/sitemap.xml` (sitemap index)
  - `public/sitemap-main.xml` (root pages)
  - `public/sitemap-subdomains.xml` (subdomains and major sites)
  - `public/sitemap-projects.xml` (project and historical pages)
  - `public/robots.txt` with sitemap reference
- Runs a weekly + manual GitHub Action to refresh and submit sitemap pings to
  Google and Bing.

### Dynamic data, not just a date stamp

`scripts/generate-sitemaps.mjs` doesn't just stamp every URL with today's
date. For each URL in `config/sitemap-links.json` it makes a live HTTP
request and:

- follows redirects, then reads the page's own
  `<link rel="canonical" href="...">` tag and uses that URL instead, so a
  URL that now canonicalizes elsewhere (e.g. a mirrored article, or a
  `www` redirecting to the apex domain) is listed under its real canonical
  address instead of the stale one in config;
- drops any entry whose (canonical) URL was already listed by an earlier
  section — `rootPages` > `subdomainPages` > `projectAndHistoricPages` —
  so the same page never appears twice in the sitemap just because it's
  referenced from more than one list, or because a redirect/mirror made
  two entries resolve to the same place;
- uses the real `Last-Modified` response header as `<lastmod>` when the
  server provides one, falling back to today's date otherwise;
- drops subdomain and project URLs that come back non-2xx or unreachable,
  so dead links fall out of the sitemap automatically instead of lingering;
- always keeps `rootPages` (javan.de / www.javan.de) even on a transient
  failure, since this is the site the workflow itself runs from.

The list of *which* URLs to check is still maintained by hand in
`config/sitemap-links.json` — there's no API access configured to
auto-discover subdomains (e.g. via DNS/Cloudflare or GitHub Pages custom
domains), so adding a new subdomain still requires a config edit.

## Local usage

```bash
npm install
npm run build
npm run submit:sitemap
```

## Updating URLs

Edit the URL lists in `config/sitemap-links.json`:

- `rootPages`
- `subdomainPages`
- `projectAndHistoricPages`
- `externalSitemaps`

Each is a plain array of URL strings — `lastmod` is resolved automatically
at build time, so there's nothing else to edit. Then run `npm run build`
and commit changes.
