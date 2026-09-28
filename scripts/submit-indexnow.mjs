#!/usr/bin/env node
/**
 * Submit the public production sitemap to IndexNow after a successful deploy.
 * No third-party dependencies are required (Node 22 provides fetch).
 *
 * Required runtime configuration:
 *   INDEXNOW_KEY       Same 8-128 character key configured on Vercel
 *   INDEXNOW_SITE_URL  Optional; defaults to https://allaboutpdfediting.xyz
 *   INDEXNOW_DRY_RUN   Optional; fetch and validate key+sitemap, but do not POST
 */
import { pathToFileURL } from "node:url";

export const DEFAULT_SITE_URL = "https://allaboutpdfediting.xyz";
export const DEFAULT_INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const MAX_URLS_PER_REQUEST = 10_000;
const KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

export function normalizeSiteUrl(value) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("INDEXNOW_SITE_URL must be a valid HTTPS origin.");
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error("INDEXNOW_SITE_URL must be a bare HTTPS origin (for example https://allaboutpdfediting.xyz).");
  }

  return parsed.origin;
}

function decodeXml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

/** Parse and validate <loc> entries, returning unique canonical URLs only. */
export function parseSitemapUrls(xml, siteUrl) {
  const origin = normalizeSiteUrl(siteUrl);
  const locations = [...xml.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi)];
  if (locations.length === 0) throw new Error("The sitemap has no <loc> URLs.");

  const urls = new Set();
  for (const match of locations) {
    const rawUrl = decodeXml(match[1].trim());
    let parsed;
    try {
      parsed = new URL(rawUrl);
    } catch {
      throw new Error(`The sitemap contains an invalid URL: ${rawUrl}`);
    }

    if (
      parsed.protocol !== "https:" ||
      parsed.origin !== origin ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      (parsed.pathname !== "/" && parsed.pathname.endsWith("/"))
    ) {
      throw new Error(`The sitemap URL is not a canonical HTTPS URL on ${origin}: ${rawUrl}`);
    }

    // Normalize the root to the same slash-less form used in this site's
    // canonical metadata. Non-root paths must already be slash-less.
    const canonicalUrl = parsed.pathname === "/" ? origin : parsed.href;
    urls.add(canonicalUrl);
  }

  if (urls.size > MAX_URLS_PER_REQUEST) {
    throw new Error(`The sitemap has ${urls.size} URLs; IndexNow accepts at most ${MAX_URLS_PER_REQUEST} per request.`);
  }
  return [...urls];
}

async function fetchChecked(fetchImpl, url, init, label) {
  let response;
  try {
    response = await fetchImpl(url, {
      ...init,
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new Error(`${label} request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (!response.ok) throw new Error(`${label} request returned HTTP ${response.status}.`);
  return response;
}

export async function submitIndexNow({
  key,
  siteUrl = DEFAULT_SITE_URL,
  endpoint = DEFAULT_INDEXNOW_ENDPOINT,
  dryRun = false,
  fetchImpl = globalThis.fetch,
} = {}) {
  const origin = normalizeSiteUrl(siteUrl);
  if (!key || !KEY_PATTERN.test(key)) {
    throw new Error("INDEXNOW_KEY must contain 8-128 letters, numbers, or hyphens.");
  }
  const api = new URL(endpoint);
  if (api.protocol !== "https:" || api.username || api.password) {
    throw new Error("The IndexNow API endpoint must use HTTPS.");
  }

  const keyLocation = `${origin}/indexnow-key.txt`;
  const keyResponse = await fetchChecked(
    fetchImpl,
    keyLocation,
    { method: "GET", cache: "no-store", redirect: "error" },
    "IndexNow key file",
  );
  const publishedKey = (await keyResponse.text()).trim();
  if (publishedKey !== key) {
    throw new Error(`The key at ${keyLocation} does not match INDEXNOW_KEY. Check the Vercel Production environment and redeploy.`);
  }

  const sitemapUrl = `${origin}/sitemap.xml`;
  const sitemapResponse = await fetchChecked(
    fetchImpl,
    sitemapUrl,
    { method: "GET", cache: "no-store", redirect: "error" },
    "Sitemap",
  );
  const urls = parseSitemapUrls(await sitemapResponse.text(), origin);

  if (dryRun) {
    return { submitted: false, status: null, urlCount: urls.length, keyLocation, sitemapUrl };
  }

  const response = await fetchImpl(api.href, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json",
    },
    body: JSON.stringify({
      host: new URL(origin).host,
      key,
      keyLocation,
      urlList: urls,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow submission returned HTTP ${response.status}.`);
  }

  return { submitted: true, status: response.status, urlCount: urls.length, keyLocation, sitemapUrl };
}

export async function main(env = process.env) {
  const key = env.INDEXNOW_KEY?.trim();
  if (!key) {
    console.warn("[IndexNow] INDEXNOW_KEY is not configured; deploy notification skipped. Add it as a Vercel Production variable and GitHub Actions secret.");
    return { submitted: false, skipped: true };
  }

  const result = await submitIndexNow({
    key,
    siteUrl: env.INDEXNOW_SITE_URL || DEFAULT_SITE_URL,
    dryRun: env.INDEXNOW_DRY_RUN === "true",
  });

  if (result.submitted) {
    console.log(`[IndexNow] Submitted ${result.urlCount} sitemap URLs (HTTP ${result.status}).`);
  } else {
    console.log(`[IndexNow] Dry run OK: verified the key file and found ${result.urlCount} sitemap URLs; no submission sent.`);
  }
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`[IndexNow] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
