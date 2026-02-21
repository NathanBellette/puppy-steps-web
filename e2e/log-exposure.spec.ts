import { test, expect } from '@playwright/test';

// All tests in this file require an authenticated session (Firebase).
// In CI there is no auth setup, so we skip the entire suite.
// Run locally against Firebase emulators or with test auth configured.
const describeAuth = process.env.CI ? test.describe.skip : test.describe;

describeAuth('Log Exposure Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Note: These tests assume you're running against localhost with Firebase emulators
    // or have test authentication set up
    await page.goto('http://localhost:5173');
  });

  test('should navigate to log exposure page from dashboard', async ({ page }) => {
    // Navigate to dashboard (assuming user is authenticated)
    await page.goto('http://localhost:5173/dashboard');
    
    // Click Log Exposure button
    const logButton = page.getByRole('button', { name: /log exposure/i });
    await expect(logButton).toBeVisible();
    await logButton.click();
    
    // Should navigate to /log-exposure
    await expect(page).toHaveURL(/\/log-exposure/);
    
    // Should show the form heading
    await expect(page.getByRole('heading', { name: /log exposure/i })).toBeVisible();
    
    // Should show form fields
    await expect(page.locator('#date')).toBeVisible();
    await expect(page.locator('#category')).toBeVisible();
  });

  test('should navigate to log exposure page from sessions page', async ({ page }) => {
    await page.goto('http://localhost:5173/sessions');
    
    // Click Log Session button
    const logButton = page.getByRole('button', { name: /log session/i });
    await expect(logButton).toBeVisible();
    await logButton.click();
    
    // Should navigate to /log-exposure
    await expect(page).toHaveURL(/\/log-exposure/);
    await expect(page.getByRole('heading', { name: /log exposure/i })).toBeVisible();
  });

  test('should show all form fields on log exposure page', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /log exposure/i })).toBeVisible();
    
    // Check form fields exist
    await expect(page.locator('#date')).toBeVisible();
    await expect(page.locator('#category')).toBeVisible();
    await expect(page.locator('#notes')).toBeVisible();
    await expect(page.locator('#photo')).toBeVisible();
    
    // Check all exposure type buttons
    await expect(page.getByRole('button', { name: /people/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /dogs/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /environments/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /noises/i })).toBeVisible();
    
    // Check action buttons
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
  });

  test('should allow selecting different exposure types', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    // Click on "Dogs" exposure type
    await page.getByRole('button', { name: /dogs/i }).click();
    
    // Verify the button shows selected state (has primary background)
    const dogsButton = page.getByRole('button', { name: /dogs/i });
    await expect(dogsButton).toHaveClass(/border-primary-500/);
    
    // Click on "Environments"
    await page.getByRole('button', { name: /environments/i }).click();
    const envButton = page.getByRole('button', { name: /environments/i });
    await expect(envButton).toHaveClass(/border-primary-500/);
  });

  test('should show category options when exposure type is selected', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    // Select "People" type
    await page.getByRole('button', { name: /people/i }).click();
    
    // Open category dropdown
    const categorySelect = page.locator('#category');
    await expect(categorySelect).toBeVisible();
    
    // Should have options (check for at least one option beyond the placeholder)
    const options = await categorySelect.locator('option').count();
    expect(options).toBeGreaterThan(1);
  });

  test('should show validation error when submitting without category', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    // Try to submit without selecting category
    await page.getByRole('button', { name: /^save$/i }).click();
    
    // Should show error message
    await expect(page.getByText(/please select a category/i)).toBeVisible();
  });

  test('should navigate back when cancel button is clicked', async ({ page }) => {
    // Start from dashboard
    await page.goto('http://localhost:5173/dashboard');
    
    // Navigate to log exposure
    await page.getByRole('button', { name: /log exposure/i }).click();
    await expect(page).toHaveURL(/\/log-exposure/);
    
    // Click cancel (back arrow in header)
    await page.getByRole('button', { name: /cancel/i }).click();
    
    // Should go back to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should allow selecting different place types', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    // Click on a place type (e.g., "Park")
    const parkButton = page.getByRole('button', { name: /park/i });
    await parkButton.click();
    
    // Should show selected state
    await expect(parkButton).toHaveClass(/bg-primary-500/);
  });

  test('should allow selecting different intensity levels', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    // Click on "High" intensity
    const highButton = page.getByRole('button', { name: /high/i });
    await highButton.click();
    
    // Should show selected state
    await expect(highButton).toHaveClass(/border-primary-500/);
  });

  test('should show "New to my dog" checkbox for people and dogs only', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    // Select "People" - should show checkbox
    await page.getByRole('button', { name: /people/i }).click();
    await expect(page.getByText(/new to my dog/i)).toBeVisible();
    
    // Select "Dogs" - should show checkbox
    await page.getByRole('button', { name: /dogs/i }).click();
    await expect(page.getByText(/new to my dog/i)).toBeVisible();
    
    // Select "Environments" - should hide checkbox
    await page.getByRole('button', { name: /environments/i }).click();
    await expect(page.getByText(/new to my dog/i)).not.toBeVisible();
    
    // Select "Noises" - should hide checkbox
    await page.getByRole('button', { name: /noises/i }).click();
    await expect(page.getByText(/new to my dog/i)).not.toBeVisible();
  });

  test('should allow selecting reaction emoji', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    // The reaction emojis should be visible
    const reactionSection = page.locator('text=Reaction').locator('..');
    await expect(reactionSection).toBeVisible();
    
    // Should have 5 reaction options (😰, 😟, 😐, 😊, 😍)
    // Find buttons within the reaction section grid
    const reactionButtons = page.locator('div:has(> label:text("Reaction")) + div button');
    await expect(reactionButtons).toHaveCount(5);
  });

  test('should allow entering notes', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    const notesField = page.locator('#notes');
    const testNote = 'This is a test exposure note';
    
    await notesField.fill(testNote);
    await expect(notesField).toHaveValue(testNote);
  });

  test('should disable save button while saving', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    // Fill required fields
    await page.getByRole('button', { name: /people/i }).click();
    
    const categorySelect = page.locator('#category');
    await categorySelect.selectOption({ index: 1 }); // Select first non-empty option
    
    const saveButton = page.getByRole('button', { name: /^save$/i });
    
    // Intercept the network request to delay it (to see loading state)
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 1000);
    });
    
    // Click save
    await saveButton.click();
    
    // Button should show loading state
    await expect(saveButton).toContainText(/saving/i);
  });

  test('should use browser back button correctly', async ({ page }) => {
    // Start from dashboard
    await page.goto('http://localhost:5173/dashboard');
    
    // Navigate to log exposure
    await page.getByRole('button', { name: /log exposure/i }).click();
    await expect(page).toHaveURL(/\/log-exposure/);
    
    // Use browser back button
    await page.goBack();
    
    // Should be back on dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should pre-select date to today', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    const dateInput = page.locator('#date');
    const today = new Date().toISOString().split('T')[0];
    
    await expect(dateInput).toHaveValue(today);
  });

  test('should not allow selecting future dates', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    const dateInput = page.locator('#date');
    const today = new Date().toISOString().split('T')[0];
    
    // Max attribute should be set to today
    const maxDate = await dateInput.getAttribute('max');
    expect(maxDate).toBe(today);
  });
});

describeAuth('Log Exposure with Pre-fill', () => {
  test.skip('should pre-fill form when navigating from goal card', async ({ page }) => {
    // Note: This test is skipped because it requires setting up navigation state
    // which depends on your router implementation. Implement this if you need it.
    
    await page.goto('http://localhost:5173/goals');
    
    // Click quick log from a goal (this will depend on your actual UI)
    // For now, we'll navigate directly with state
    await page.evaluate(() => {
      const navigate = (window as any).navigate;
      navigate('/log-exposure', {
        state: {
          prefillType: 'people',
          prefillCategory: 'Children',
        },
      });
    });
    
    await expect(page).toHaveURL(/\/log-exposure/);
    
    // Verify pre-filled values
    const categorySelect = page.locator('#category');
    await expect(categorySelect).toHaveValue('Children');
  });
});

describeAuth('Log Exposure Mobile', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE size
  });

  test('should be mobile responsive', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    // Sticky header should be visible
    await expect(page.getByRole('heading', { name: /log exposure/i })).toBeVisible();
    
    // Form should be visible and scrollable
    await expect(page.locator('#date')).toBeVisible();
    
    // Action buttons should be visible
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /save/i })).toBeVisible();
  });

  test('should show save button in sticky header on mobile', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');

    // Save button in sticky header should be visible
    const saveButton = page.getByRole('button', { name: /save/i });
    await expect(saveButton).toBeVisible();
  });

  test('should allow scrolling through entire form on mobile', async ({ page }) => {
    await page.goto('http://localhost:5173/log-exposure');
    
    // Scroll to bottom of form
    await page.locator('#photo').scrollIntoViewIfNeeded();
    
    // Photo upload should be visible after scroll
    await expect(page.locator('#photo')).toBeVisible();
  });
});
