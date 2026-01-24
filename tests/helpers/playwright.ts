import { expect, Page } from "@playwright/test";

export const gotoUtility = async (page: Page, slug: string) => {
  await page.goto(`/utilities/${slug}`);
  await expect(page.locator("h1")).toHaveText(/.+/);
};

export const fillTextareaByLabel = async (
  page: Page,
  label: string,
  value: string
) => {
  const textarea = page.getByLabel(label);
  await textarea.fill(value);
};

export const expectTextareaNotEmpty = async (page: Page, label: string) => {
  const textarea = page.getByLabel(label);
  await expect(textarea).toHaveValue(/.+/);
};
