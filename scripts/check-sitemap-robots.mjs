#!/usr/bin/env node
/**
 * scripts/check-sitemap-robots.mjs
 *
 * Verifies that no URL in the sitemap matches a robots.txt Disallow rule
 * (Google cannot index a URL it is blocked from crawling) and reports the
 * sitemap's URL count + lastModified variance.
 *
 * Usage:
 *   node scripts/check-sitemap-robots.mjs http://localhost:3000
 */
const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");

function disallowPrefixes(robotsTxt) {
  // Minimal robots.txt parser: collect Disallow values for User-Agent: * groups.
  const prefixes = [];
  let inStar = false;
  for (const line of robotsTxt.split("\n")) {
    const l = line.trim();
    if (/^user-agent:/i.test(l)) inStar = /^\*\s*$/i.test(l.split(":")[1].trim());
    else if (inStar && /^disallow:/i.test(l)) {
      const v = l.slice(l.indexOf(":") + 1).trim();
      if (v) prefixes.push(v);
    }
  }
  return prefixes;
}

const robotsTxt = await (await fetch(`${base}/robots.txt`)).text();
const sitemapXml = await (await fetch(`${base}/sitemap.xml`)).text();

const disallow = disallowPrefixes(robotsTxt);
const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const lastmods = [...sitemapXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);

console.log("robots.txt Disallow prefixes:", disallow.join(", ") || "(none)");
console.log("sitemap URL count:", urls.length);
const distinct = [...new Set(lastmods)];
console.log("distinct lastmod values:", distinct.length, distinct.sort().join(", "));
if (distinct.length < 2) {
  console.log("FAIL: lastModified is identical for every URL (spec: never one identical timestamp)");
  process.exitCode = 1;
}

let bad = 0;
for (const u of urls) {
  const path = u.replace(/^https?:\/\/[^/]+/, "");
  for (const d of disallow) {
    if (path === d || (d.endsWith("/") && path.startsWith(d)) || (!d.endsWith("/") && (path === d || path.startsWith(d + "/") || path.startsWith(d + "?")))) {
      console.log(`FAIL: sitemap URL matches Disallow "${d}": ${u}`);
      bad++;
    }
  }
}
if (bad === 0) console.log("OK: no sitemap URL matches a Disallow rule");
else process.exitCode = 1;
