// Writes public/utilities/sitemap.xml with one entry per page in pages/utilities.
// The site is served at https://jam.dev/utilities, so that is where the file lands.
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://jam.dev";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const pagesDir = path.join(root, "pages", "utilities");
const outputFile = path.join(root, "public", "utilities", "sitemap.xml");

const urls = readdirSync(pagesDir)
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => file.replace(/\.tsx$/, ""))
  .sort()
  .map((page) => {
    if (page === "index") {
      return `${SITE_URL}/utilities`;
    }
    return `${SITE_URL}/utilities/${page}`;
  });

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((url) => `  <url><loc>${url}</loc></url>`),
  "</urlset>",
  "",
].join("\n");

mkdirSync(path.dirname(outputFile), { recursive: true });
writeFileSync(outputFile, sitemap);
console.log(`Wrote ${urls.length} URLs to ${path.relative(root, outputFile)}`);
