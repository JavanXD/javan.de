const sitemapUrls = [
  "https://www.javan.de/sitemap.xml",
  "https://www.javan.de/sitemap-main.xml",
  "https://www.javan.de/sitemap-subdomains.xml",
  "https://www.javan.de/sitemap-projects.xml",
].filter((value, index, array) => array.indexOf(value) === index);

const endpoints = [
  {
    name: "Google",
    url: (sitemap) =>
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
  },
  {
    name: "Bing",
    url: (sitemap) =>
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
  },
];

for (const sitemap of sitemapUrls) {
  for (const endpoint of endpoints) {
    const target = endpoint.url(sitemap);
    const response = await fetch(target, { method: "GET", redirect: "follow" });
    if (!response.ok) {
      throw new Error(
        `${endpoint.name} sitemap ping failed for ${sitemap}: ${response.status} ${response.statusText}`,
      );
    }
    console.log(`${endpoint.name} ping OK for ${sitemap}`);
  }
}
