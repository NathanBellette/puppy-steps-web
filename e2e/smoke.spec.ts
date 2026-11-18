import { test, expect, type Page } from '@playwright/test';
import { clickAndExpectText, expectVisible } from './helpers';

/**
 * Smoke tests for critical user-facing flows.
 *
 * These tests verify the app loads, renders key pages, and that
 * auth gating works correctly. They do NOT sign in with real
 * credentials — they validate the unauthenticated experience
 * and verify the app doesn't crash on any route.
 */

const signInTitle = 'Sign in to your account';

/** Clicks the link-style toggle between the forms and expects the other form's heading. */
const toggleForm = async (page: Page, toggleText: RegExp, headingName: string) => {
  await page.getByText(toggleText).click();
  await expect(page.getByRole('heading', { name: headingName })).toBeVisible();
};

test.describe('App loads', () => {
  test('renders the auth page at /auth', async ({ page }) => {
    await page.goto('/auth');

    // The sign-in form should be visible
    await expectVisible(
      page.getByText(signInTitle),
      page.getByLabel(/email address/i),
      page.getByLabel(/password/i),
      page.getByRole('button', { name: /sign in/i })
    );
  });
});

test.describe('Auth page interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  test('toggles between Sign In and Sign Up forms', async ({ page }) => {
    // Initially shows Sign In
    await expect(page.getByRole('heading', { name: signInTitle })).toBeVisible();

    // Sign Up adds a display name field
    await toggleForm(page, /don't have an account/i, 'Create your account');
    await expect(page.getByLabel(/full name/i)).toBeVisible();

    await toggleForm(page, /already have an account/i, signInTitle);
  });

  test('shows validation errors on empty sign-in submit', async ({ page }) => {
    await clickAndExpectText(page, /sign in/i, /valid email/i);
  });

  test('shows validation errors on invalid sign-up submit', async ({ page }) => {
    await toggleForm(page, /don't have an account/i, 'Create your account');

    await clickAndExpectText(page, /create account/i, /at least 2 characters/i);
  });
});

test.describe('Protected route gating', () => {
  // The root URL redirects to /dashboard, which then redirects to /auth
  const protectedRoutes = ['/', '/dashboard', '/goals', '/sessions', '/log-exposure', '/calendar', '/resources', '/settings'];

  for (const route of protectedRoutes) {
    test(`redirects unauthenticated user from ${route} to /auth`, async ({ page }) => {
      await page.goto(route);

      await page.waitForURL('**/auth');
      await expect(page.getByText(signInTitle)).toBeVisible();
    });
  }
});
