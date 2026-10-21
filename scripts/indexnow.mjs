#!/usr/bin/env node
/**
 * Tell IndexNow search engines (Bing, Yandex, Seznam, Naver…) that SpreadsheetFix's pages changed.
 *
 *   node scripts/indexnow.mjs            submit every URL in the live sitemap
 *   node scripts/indexnow.mjs --dry-run  print what would be submitted, send nothing
 *
 * Run it after a production deploy, never against a preview: the key file must be live at
 * https://spreadsheetfix.com/<KEY>.txt (it ships from public/), and every URL must be on that host.
 * Pass --sitemap <url> to read URLs from a local build instead (submission stays on spreadsheetfix.com).
 */

const HOST = "spreadsheetfix.com";
const KEY = "4f73d82c029d13b8e4e0da14cf738847"; // public/<KEY>.txt holds the same value
const ENDPOINT = "https://api.indexnow.org/indexnow";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const sitemapArg = args.indexOf("--sitemap");
const sitemapUrl = sitemapArg >= 0 ? args[sitemapArg + 1] : `https://${HOST}/sitemap.xml`;

const res = await fetch(sitemapUrl);
if (!res.ok) throw new Error(`Couldn't fetch ${sitemapUrl}: ${res.status}`);
const xml = await res.text();
const urlList = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1]);

const offHost = urlList.filter((u) => new URL(u).host !== HOST);
if (offHost.length) throw new Error(`Sitemap has URLs outside ${HOST}: ${offHost.join(", ")}`);
if (!urlList.length) throw new Error(`No <loc> entries in ${sitemapUrl}`);

const body = { host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList };

if (dryRun) {
  console.log(`Would POST ${urlList.length} URLs to ${ENDPOINT}:`);
  console.log(urlList.join("\n"));
  process.exit(0);
}

const submit = await fetch(ENDPOINT, {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});
// 200 = accepted, 202 = accepted and the key is still being validated
console.log(`IndexNow responded ${submit.status} ${submit.statusText} for ${urlList.length} URLs`);
if (submit.status >= 300) {
  console.error(await submit.text());
  process.exit(1);
}
