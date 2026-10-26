/**
 * True for top-level page loads. Prefetches and client-router fetches send
 * `Sec-Fetch-Mode: cors` or `same-origin`; requests without the header (older
 * browsers, curl) count as navigations.
 */
export function isDocumentNavigation(headers: Headers) {
  const mode = headers.get("sec-fetch-mode");
  return mode === null || mode === "navigate";
}
