/**
 * Shared Person JSON-LD for *.javan.de (@id https://javan.de/#person).
 * about.javan.de emits the full node; other hosts use compact or ref.
 */
import personFull from "./person.json" with { type: "json" };

export const PERSON_ID = "https://javan.de/#person";

const COMPACT_KEYS = [
  "@type",
  "@id",
  "name",
  "alternateName",
  "givenName",
  "familyName",
  "jobTitle",
  "url",
  "email",
  "image",
  "homeLocation",
  "sameAs",
  "knowsLanguage",
];

/**
 * @returns {{ "@id": string }}
 */
export function personRef() {
  return { "@id": PERSON_ID };
}

/**
 * @param {"full"|"compact"|"ref"} [mode]
 * @returns {object}
 */
export function personNode(mode = "full") {
  if (mode === "ref") return personRef();
  if (mode === "compact") {
    const node = { "@type": "Person", "@id": PERSON_ID };
    for (const key of COMPACT_KEYS) {
      if (key === "@type" || key === "@id") continue;
      if (personFull[key] !== undefined) node[key] = personFull[key];
    }
    // Compact uses a single primary image URL.
    if (Array.isArray(node.image)) node.image = node.image[0];
    return node;
  }
  const rest = { ...personFull };
  delete rest["@context"];
  return JSON.parse(JSON.stringify(rest));
}

/**
 * @param {"full"|"compact"|"ref"} [mode]
 * @returns {string} script element HTML
 */
export function personJsonLdScript(mode = "full") {
  const node = personNode(mode);
  const graph = mode === "ref" ? node : { "@context": "https://schema.org", ...node };
  const json = JSON.stringify(graph, null, 2).replaceAll("</", "<\\/");
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

export { personFull };
