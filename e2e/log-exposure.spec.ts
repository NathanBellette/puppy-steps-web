import { test, expect, type Page } from '@playwright/test';
import { clickAndExpectText, describeAuth, expectVisible } from './helpers';

const button = (page: Page, name: RegExp) => page.getByRole('button', { name });
const field = (page: Page, id: string) => page.locator(`#${id}`);
const heading = (page: Page) => page.getByRole('heading', { name: /log exposure/i });
const today = () => new Date().toISOString().split('T')[0];

/** Opens the log exposure form through another page's log button. */
const openFormFrom = async (page: Page, path: string, buttonName: RegExp) => {
  await page.goto(path);
  const logButton = button(page, buttonName);
  await expect(logButton).toBeVisible();
  await logButton.click();
  await expect(page).toHaveURL(/\/log-exposure/);
};

/** Picks the People exposure type and returns the category select it fills. */
const choosePeople = async (page: Page) => {
  await button(page, /people/i).click();
  return field(page, 'category');
};

describeAuth('Log Exposure Flow', () => {
  for (const { from, buttonName } of [
    { from: '/dashboard', buttonName: /log exposure/i },
    { from: '/sessions', buttonName: /log session/i },
  ]) {
    test(`should navigate to log exposure page from ${from}`, async ({ page }) => {
      await openFormFrom(page, from, buttonName);

      await expectVisible(heading(page), field(page, 'date'), field(page, 'category'));
    });
  }

  for (const { title, leave } of [
    // Cancel is the back arrow in the header
    { title: 'should navigate back when cancel button is clicked', leave: (page: Page) => button(page, /cancel/i).click() },
    { title: 'should use browser back button correctly', leave: (page: Page) => page.goBack() },
  ]) {
    test(title, async ({ page }) => {
      await openFormFrom(page, '/dashboard', /log exposure/i);

      await leave(page);

      await expect(page).toHaveURL(/\/dashboard/);
    });
  }

  test.describe('on the form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/log-exposure');
    });

    test('should show all form fields on log exposure page', async ({ page }) => {
      await expectVisible(
        heading(page),
        ...['date', 'category', 'notes', 'photo'].map((id) => field(page, id)),
        // Exposure types, then actions
        ...[/people/i, /dogs/i, /environments/i, /noises/i, /cancel/i, /save/i].map((name) => button(page, name))
      );
    });

    for (const { choice, name, selectedClass } of [
      { choice: 'the Dogs exposure type', name: /dogs/i, selectedClass: /border-primary-500/ },
      { choice: 'the Environments exposure type', name: /environments/i, selectedClass: /border-primary-500/ },
      { choice: 'the Park place type', name: /park/i, selectedClass: /bg-primary-500/ },
      { choice: 'High intensity', name: /high/i, selectedClass: /border-primary-500/ },
    ]) {
      test(`should allow selecting ${choice}`, async ({ page }) => {
        const option = button(page, name);
        await option.click();

        await expect(option).toHaveClass(selectedClass);
      });
    }

    test('should show category options when exposure type is selected', async ({ page }) => {
      const categorySelect = await choosePeople(page);
      await expect(categorySelect).toBeVisible();

      // Should have options beyond the placeholder
      expect(await categorySelect.locator('option').count()).toBeGreaterThan(1);
    });

    test('should show validation error when submitting without category', async ({ page }) => {
      await clickAndExpectText(page, /^save$/i, /please select a category/i);
    });

    test('should show "New to my dog" checkbox for people and dogs only', async ({ page }) => {
      for (const [type, shown] of [
        [/people/i, true],
        [/dogs/i, true],
        [/environments/i, false],
        [/noises/i, false],
      ] as const) {
        await clickAndExpectText(page, type, /new to my dog/i, shown);
      }
    });

    test('should allow selecting reaction emoji', async ({ page }) => {
      // The reaction emojis should be visible
      const reactionSection = page.locator('text=Reaction').locator('..');
      await expect(reactionSection).toBeVisible();

      // Should have 5 reaction options (😰, 😟, 😐, 😊, 😍)
      // Find buttons within the reaction section grid
      const reactionButtons = page.locator('div:has(> label:text("Reaction")) + div button');
      await expect(reactionButtons).toHaveCount(5);
    });

    test('should allow entering notes', async ({ page }) => {
      const notesField = field(page, 'notes');
      const testNote = 'This is a test exposure note';

      await notesField.fill(testNote);
      await expect(notesField).toHaveValue(testNote);
    });

    test('should disable save button while saving', async ({ page }) => {
      const categorySelect = await choosePeople(page);
      await categorySelect.selectOption({ index: 1 }); // Select first non-empty option

      const saveButton = button(page, /^save$/i);

      // Intercept the network request to delay it (to see loading state)
      await page.route('**/api/**', route => {
        setTimeout(() => route.continue(), 1000);
      });

      await saveButton.click();

      await expect(saveButton).toContainText(/saving/i);
    });

    test('should pre-select date to today', async ({ page }) => {
      await expect(field(page, 'date')).toHaveValue(today());
    });

    test('should not allow selecting future dates', async ({ page }) => {
      // Max attribute should be set to today
      await expect(field(page, 'date')).toHaveAttribute('max', today());
    });
  });
});

describeAuth('Log Exposure with Pre-fill', () => {
  test.skip('should pre-fill form when navigating from goal card', async ({ page }) => {
    // Note: This test is skipped because it requires setting up navigation state
    // which depends on your router implementation. Implement this if you need it.

    await page.goto('/goals');

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
    await expect(field(page, 'category')).toHaveValue('Children');
  });
});

describeAuth('Log Exposure Mobile', () => {
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE size
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/log-exposure');
  });

  test('should be mobile responsive', async ({ page }) => {
    // Sticky header, form and action buttons should be visible
    await expectVisible(heading(page), field(page, 'date'), button(page, /cancel/i), button(page, /save/i));
  });

  test('should show save button in sticky header on mobile', async ({ page }) => {
    await expect(button(page, /save/i)).toBeVisible();
  });

  test('should allow scrolling through entire form on mobile', async ({ page }) => {
    // Photo upload is at the bottom of the form
    const photo = field(page, 'photo');
    await photo.scrollIntoViewIfNeeded();

    await expect(photo).toBeVisible();
  });
});
