import { test, expect } from "@playwright/test";
import { fixturePath, readFixture } from "../helpers/fixtures";
import { gotoUtility } from "../helpers/playwright";

test.describe("utilities happy paths", () => {
  test("csv-to-json converts input", async ({ page }) => {
    await gotoUtility(page, "csv-to-json");
    const csv = readFixture("csv/sample.csv");
    await page.getByPlaceholder("Paste or drag and drop a CSV file").fill(csv);
    const outputs = page.locator("textarea");
    await expect(outputs.nth(1)).toHaveValue(/Name/);
  });

  test("json-formatter formats JSON", async ({ page }) => {
    await gotoUtility(page, "json-formatter");
    const json = readFixture("json/sample.json");
    await page.getByPlaceholder("Paste JSON here").fill(json);
    const outputs = page.locator("textarea");
    await expect(outputs.nth(1)).toHaveValue(/"name":/);
  });

  test("url-encoder encodes text", async ({ page }) => {
    await gotoUtility(page, "url-encoder");
    const raw = readFixture("url/sample.txt");
    await page.getByPlaceholder("Paste here").fill(raw);
    const encoded = encodeURIComponent(raw);
    const outputs = page.locator("textarea");
    await expect(outputs.nth(1)).toHaveValue(encoded);
  });

  test("yaml-to-json converts YAML", async ({ page }) => {
    await gotoUtility(page, "yaml-to-json");
    const yaml = readFixture("yaml/sample.yaml");
    await page.getByPlaceholder("Paste YAML here").fill(yaml);
    const outputs = page.locator("textarea");
    await expect(outputs.nth(1)).toHaveValue(/"name":/);
  });

  test("xml-to-json converts XML", async ({ page }) => {
    await gotoUtility(page, "xml-to-json");
    const xml = readFixture("xml/sample.xml");
    await page.getByPlaceholder("Paste XML here").fill(xml);
    const outputs = page.locator("textarea");
    await expect(outputs.nth(1)).toHaveValue(/"root"/);
  });

  test("env-to-netlify-toml converts env", async ({ page }) => {
    await gotoUtility(page, "env-to-netlify-toml");
    const env = readFixture("env/sample.env");
    await page.getByPlaceholder("Paste here").fill(env);
    const outputs = page.locator("textarea");
    await expect(outputs.nth(1)).toHaveValue(/\[context\.production\]/);
  });

  test("har-file-viewer accepts har upload", async ({ page }) => {
    await gotoUtility(page, "har-file-viewer");
    await page
      .getByTestId("input")
      .setInputFiles(fixturePath("har/sample.har"));
    await expect(
      page.getByText("https://example.com/api/test")
    ).toBeVisible();
  });

  test("svg-viewer accepts svg upload", async ({ page }) => {
    await gotoUtility(page, "svg-viewer");
    await page.getByRole("tab", { name: "Upload SVG File" }).click();
    await page
      .locator('input[type="file"]')
      .setInputFiles(fixturePath("svg/sample.svg"));
    await expect(page.getByLabel("Uploaded SVG code")).toHaveValue(/<svg/);
  });

  test("uuid-generator creates UUID", async ({ page }) => {
    await gotoUtility(page, "uuid-generator");
    const uuidField = page.locator("input[readonly]");
    await expect(uuidField).toHaveValue(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
    );
    const initialValue = await uuidField.inputValue();
    await page.getByRole("button", { name: "Generate New UUID" }).click();
    await expect(uuidField).not.toHaveValue(initialValue);
  });

  test("random-string-generator creates string", async ({ page }) => {
    await gotoUtility(page, "random-string-generator");
    await page.getByRole("button", { name: "Generate" }).click();
    const output = page.getByPlaceholder(
      "Click 'Generate' to create a cryptographically strong random string."
    );
    await expect(output).toHaveValue(/.{4,}/);
  });

  test("lorem-ipsum-generator renders text", async ({ page }) => {
    await gotoUtility(page, "lorem-ipsum-generator");
    const output = page.locator("textarea").first();
    await expect(output).toHaveValue(/.{4,}/);
  });
});
