import { test, expect } from '@playwright/test';
import { describeAuth } from './helpers';

describeAuth('App icon home link', () => {
  for (const { title, viewport } of [
    { title: 'sidebar logo links to dashboard', viewport: undefined },
    // A mobile viewport hides the sidebar and shows the header icon instead
    { title: 'mobile header logo links to dashboard', viewport: { width: 375, height: 667 } },
  ]) {
    test(title, async ({ page }) => {
      if (viewport) {
        await page.setViewportSize(viewport);
      }
      await page.goto('/goals');

      const homeLink = page.getByRole('link', { name: /go to home page/i }).first();
      await expect(homeLink).toBeVisible();
      await expect(homeLink).toHaveAttribute('href', '/dashboard');

      // Clicking the logo should navigate to the dashboard
      await homeLink.click();
      await expect(page).toHaveURL(/\/dashboard/);
    });
  }
});
