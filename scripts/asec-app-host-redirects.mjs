/**
 * Account Bulk Redirect items for asec.app hosts that are not javan.de.
 * Kept out of `javan_de_quota_free` (that list is javan.de + newsletter/digest only).
 *
 * Hostname-wide 301s: old Squarespace / Google Sites paths
 * (`/home`, `/aufgaben/a1-injection`, …) do not map 1:1.
 * subpath_matching + preserve_path_suffix:false drops the old path.
 * Do not set include_subdomains on apex — that would steal
 * `secure-coding.asec.app` away from the Schulung target.
 * `test.asec.app` is parked to javan.de (same as apex/www).
 * www.secure-coding.asec.app does not exist in DNS — not listed.
 */
export const LIST_NAME = "asec_app_legacy";
export const RULE_REF = "eval_asec_app_legacy";
export const TARGET = "https://secure-coding.javan.de/";
export const BRAND_TARGET = "https://javan.de/";

function hostWide301(sourceUrl, targetUrl) {
  return {
    redirect: {
      source_url: sourceUrl,
      target_url: targetUrl,
      status_code: 301,
      include_subdomains: false,
      subpath_matching: true,
      preserve_query_string: false,
      preserve_path_suffix: false,
    },
  };
}

export function asecAppRedirectItems() {
  return [
    hostWide301("https://asec.app/", BRAND_TARGET),
    hostWide301("https://www.asec.app/", BRAND_TARGET),
    hostWide301("https://test.asec.app/", BRAND_TARGET),
    hostWide301("https://secure-coding.asec.app/", TARGET),
  ];
}
