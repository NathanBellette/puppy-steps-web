import { test, expect } from '@playwright/test';

// All tests in this file require an authenticated session (Firebase).
// In CI there is no auth setup, so we skip the entire suite.
// Run locally against Firebase emulators or with test auth configured.
const describeAuth = process.env.CI ? test.describe.skip : test.describe;

describeAuth('App icon home link', () => {
  test('sidebar logo links to dashboard', async ({ page }) => {
    await page.goto('http://localhost:5173/goals');

    // The sidebar home link should point to /dashboard
    const homeLink = page.getByRole('link', { name: /go to home page/i }).first();
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/dashboard');

    // Clicking the logo should navigate to the dashboard
    await homeLink.click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('mobile header logo links to dashboard', async ({ page }) => {
    // Use a mobile viewport so the header icon is visible
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5173/goals');

    const homeLink = page.getByRole('link', { name: /go to home page/i });
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveAttribute('href', '/dashboard');

    await homeLink.click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
