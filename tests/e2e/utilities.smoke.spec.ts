import { test, expect } from "@playwright/test";
import { gotoUtility } from "../helpers/playwright";

const utilities = [
  "base-64-encoder",
  "base64-to-image",
  "cam",
  "css-inliner-for-email",
  "css-units-converter",
  "csv-to-json",
  "curl-to-javascript-fetch",
  "env-to-netlify-toml",
  "har-file-viewer",
  "hash-generator",
  "hex-to-rgb",
  "image-resizer",
  "image-to-base64",
  "internet-speed-test",
  "json-formatter",
  "json-to-csv",
  "json-to-yaml",
  "jwt-parser",
  "lorem-ipsum-generator",
  "number-base-changer",
  "query-params-to-json",
  "random-string-generator",
  "regex-tester",
  "rgb-to-hex",
  "sql-minifier",
  "svg-viewer",
  "timestamp-to-date",
  "url-encoder",
  "uuid-generator",
  "wcag-color-contrast-checker",
  "webp-converter",
  "xml-to-json",
  "yaml-to-json",
];

test.describe("utilities smoke", () => {
  for (const slug of utilities) {
    test(`renders ${slug}`, async ({ page }) => {
      await gotoUtility(page, slug);
      await expect(page.locator("text=Application error")).toHaveCount(0);
    });
  }
});
