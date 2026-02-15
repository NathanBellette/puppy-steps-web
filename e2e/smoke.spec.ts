import { test, expect } from '@playwright/test';

/**
 * Smoke tests for critical user-facing flows.
 *
 * These tests verify the app loads, renders key pages, and that
 * auth gating works correctly. They do NOT sign in with real
 * credentials — they validate the unauthenticated experience
 * and verify the app doesn't crash on any route.
 */

test.describe('App loads', () => {
  test('renders the auth page at /auth', async ({ page }) => {
    await page.goto('/auth');

    // The sign-in form should be visible
    await expect(page.getByText('Sign in to your account')).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('redirects unauthenticated users from /dashboard to /auth', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to auth page
    await page.waitForURL('**/auth');
    await expect(page.getByText('Sign in to your account')).toBeVisible();
  });

  test('redirects unauthenticated users from / to /auth', async ({ page }) => {
    await page.goto('/');

    // The root URL redirects to /dashboard which then redirects to /auth
    await page.waitForURL('**/auth');
    await expect(page.getByText('Sign in to your account')).toBeVisible();
  });
});

test.describe('Auth page interactions', () => {
  test('toggles between Sign In and Sign Up forms', async ({ page }) => {
    await page.goto('/auth');

    // Initially shows Sign In
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();

    // Click "Don't have an account? Sign up"
    await page.getByText(/don't have an account/i).click();

    // Now shows Sign Up form with display name field
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();

    // Toggle back
    await page.getByText(/already have an account/i).click();
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  });

  test('shows validation errors on empty sign-in submit', async ({ page }) => {
    await page.goto('/auth');

    // Click Sign In without filling in fields
    await page.getByRole('button', { name: /sign in/i }).click();

    // Form validation should show error messages
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('shows validation errors on invalid sign-up submit', async ({ page }) => {
    await page.goto('/auth');

    // Switch to Sign Up
    await page.getByText(/don't have an account/i).click();

    // Click Create Account without filling in fields
    await page.getByRole('button', { name: /create account/i }).click();

    // Form validation should show error messages
    await expect(page.getByText(/at least 2 characters/i)).toBeVisible();
  });
});

test.describe('Protected route gating', () => {
  const protectedRoutes = ['/goals', '/sessions', '/log-exposure', '/calendar', '/resources', '/settings'];

  for (const route of protectedRoutes) {
    test(`redirects unauthenticated user from ${route} to /auth`, async ({ page }) => {
      await page.goto(route);

      await page.waitForURL('**/auth');
      await expect(page.getByText('Sign in to your account')).toBeVisible();
    });
  }
});
