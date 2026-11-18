import { test, expect, type Locator, type Page } from '@playwright/test';

/**
 * Describes a suite that needs an authenticated session (Firebase).
 * In CI there is no auth setup, so these suites are skipped.
 * Run them locally against Firebase emulators or with test auth configured.
 */
export const describeAuth = process.env.CI ? test.describe.skip : test.describe;

/** Asserts every locator is visible, in order. */
export const expectVisible = async (...locators: Locator[]) => {
  for (const locator of locators) {
    await expect(locator).toBeVisible();
  }
};

/** Clicks the named button, then expects the text to be shown (or hidden when `visible` is false). */
export const clickAndExpectText = async (page: Page, buttonName: RegExp, text: RegExp, visible = true) => {
  await page.getByRole('button', { name: buttonName }).click();
  await expect(page.getByText(text)).toBeVisible({ visible });
};
