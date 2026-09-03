/**
 * Account Bulk Redirect items for asec.app hosts that are not javan.de.
 * Kept out of `javan_de_quota_free` (that list is javan.de + newsletter/digest only).
 *
 * Hostname-wide 301 to the Schulung homepage: old Google Sites paths
 * (`/home`, `/aufgaben/a1-injection`, …) do not map to `/module/m01`.
 * subpath_matching + preserve_path_suffix:false drops the old path.
 * www.secure-coding.asec.app does not exist in DNS — not listed.
 */
export const LIST_NAME = "asec_app_legacy";
export const RULE_REF = "eval_asec_app_legacy";
export const TARGET = "https://secure-coding.javan.de/";

export function asecAppRedirectItems() {
  return [
    {
      redirect: {
        source_url: "https://secure-coding.asec.app/",
        target_url: TARGET,
        status_code: 301,
        include_subdomains: false,
        subpath_matching: true,
        preserve_query_string: false,
        preserve_path_suffix: false,
      },
    },
  ];
}
