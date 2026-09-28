import { describe, expect, it, vi } from "vitest";
import { parseSitemapUrls, submitIndexNow } from "./submit-indexnow.mjs";

const KEY = "0123456789abcdef0123456789abcdef";
const SITE = "https://example.test";

function response(status, text) {
  return { ok: status >= 200 && status < 300, status, text: async () => text };
}

describe("IndexNow deployment submitter", () => {
  it("extracts unique canonical same-host sitemap URLs and decodes XML entities", () => {
    const xml = `
      <urlset>
        <url><loc>https://example.test</loc></url>
        <url><loc>https://example.test/compress</loc></url>
        <url><loc>https://example.test/compress</loc></url>
      </urlset>`;

    expect(parseSitemapUrls(xml, SITE)).toEqual([
      "https://example.test",
      "https://example.test/compress",
    ]);
  });

  it.each([
    ["another host", "https://outside.test/page"],
    ["a non-HTTPS URL", "http://example.test/page"],
    ["a trailing-slash duplicate", "https://example.test/page/"],
    ["a query URL", "https://example.test/page?preview=1"],
  ])("rejects sitemap entries that are not canonical (%s)", (_reason, url) => {
    expect(() => parseSitemapUrls(`<urlset><url><loc>${url}</loc></url></urlset>`, SITE)).toThrow(/canonical HTTPS URL/);
  });

  it("checks the key file, reads the sitemap, and submits only its URLs", async () => {
    const requests = [];
    const fetchImpl = vi.fn(async (url, init) => {
      requests.push({ url, init });
      if (url === `${SITE}/indexnow-key.txt`) return response(200, `${KEY}\n`);
      if (url === `${SITE}/sitemap.xml`) {
        return response(200, "<urlset><url><loc>https://example.test</loc></url><url><loc>https://example.test/new-guide</loc></url></urlset>");
      }
      if (url === "https://api.indexnow.test/indexnow") return response(202, "");
      throw new Error(`Unexpected request: ${url}`);
    });

    const result = await submitIndexNow({
      key: KEY,
      siteUrl: SITE,
      endpoint: "https://api.indexnow.test/indexnow",
      fetchImpl,
    });

    expect(result).toMatchObject({ submitted: true, status: 202, urlCount: 2 });
    expect(requests).toHaveLength(3);
    const payload = JSON.parse(requests[2].init.body);
    expect(payload).toEqual({
      host: "example.test",
      key: KEY,
      keyLocation: `${SITE}/indexnow-key.txt`,
      urlList: ["https://example.test", "https://example.test/new-guide"],
    });
  });

  it("fails closed when the deployed key file does not match", async () => {
    const fetchImpl = vi.fn(async () => response(200, "a-different-key"));

    await expect(submitIndexNow({ key: KEY, siteUrl: SITE, fetchImpl })).rejects.toThrow(/does not match INDEXNOW_KEY/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("supports a validation-only dry run without posting to IndexNow", async () => {
    const fetchImpl = vi.fn(async (url) => {
      if (url === `${SITE}/indexnow-key.txt`) return response(200, KEY);
      if (url === `${SITE}/sitemap.xml`) return response(200, "<urlset><url><loc>https://example.test/one</loc></url></urlset>");
      throw new Error(`Unexpected request: ${url}`);
    });

    const result = await submitIndexNow({ key: KEY, siteUrl: SITE, dryRun: true, fetchImpl });

    expect(result).toMatchObject({ submitted: false, status: null, urlCount: 1 });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
