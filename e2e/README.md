# E2E Tests

End-to-end tests for PuppySteps using Playwright.

## Running Tests

### Prerequisites

1. **Start the dev server:**
   ```bash
   npm run dev
   ```
   The app should be running on `http://localhost:5173`

2. **Start Firebase emulators (optional but recommended):**
   ```bash
   npm run firebase:emulators
   ```
   This allows you to test without affecting production data.

### Run Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test e2e/log-exposure.spec.ts

# Run tests in UI mode (recommended for development)
npx playwright test --ui

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests in a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug Tests

```bash
# Run in debug mode
npx playwright test --debug

# Show test report
npx playwright show-report
```

## Test Structure

### `log-exposure.spec.ts`
Tests for the log exposure flow, including:
- Navigation from different pages (Dashboard, Sessions, Goals)
- Form field interactions
- Validation
- Mobile responsiveness
- Pre-fill functionality
- Browser back button behavior

### `example.spec.ts`
Default Playwright example tests (can be deleted or replaced)

## Writing New Tests

1. Create a new `.spec.ts` file in the `e2e/` directory
2. Import Playwright test utilities:
   ```typescript
   import { test, expect } from '@playwright/test';
   ```
3. Use `test.describe()` to group related tests
4. Use `test()` to define individual test cases
5. Use `test.beforeEach()` for setup that runs before each test

### Best Practices

- **Use semantic selectors**: Prefer `getByRole()`, `getByLabel()`, `getByText()` over CSS selectors
- **Wait for elements**: Use `expect().toBeVisible()` instead of `waitForTimeout()`
- **Test user flows**: Test complete user journeys, not just individual components
- **Mobile testing**: Use `test.use({ viewport: { width, height } })` to test responsive design
- **Isolation**: Each test should be independent and not rely on other tests
- **Authentication**: Set up test users or use Firebase emulators for consistent test data

## Authentication Setup

For tests that require authentication:

1. **Option 1: Firebase Emulators** (Recommended)
   - Run `npm run firebase:emulators`
   - Tests will use emulated auth data

2. **Option 2: Test User**
   - Create a dedicated test user
   - Use Playwright's storage state to save auth session
   - See: https://playwright.dev/docs/auth

3. **Option 3: Mock Authentication**
   - Mock Firebase auth in test environment
   - Intercept network requests

## CI/CD

These tests can be run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npx playwright test

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Configuration

Playwright configuration is in `playwright.config.ts`. Key settings:

- `testDir`: Location of test files (`./e2e`)
- `fullyParallel`: Run tests in parallel (enabled)
- `retries`: Number of retries on failure (2 on CI, 0 locally)
- `use.trace`: Collect traces for debugging (on first retry)
- `projects`: Browsers to test (Chrome, Firefox, Safari)

## Troubleshooting

### Tests fail with "Cannot find module"
- Make sure all dependencies are installed: `npm install`
- Install Playwright browsers: `npx playwright install`

### Tests can't connect to localhost
- Ensure dev server is running: `npm run dev`
- Check the correct port in test URLs (default: 5173)

### Authentication issues
- Use Firebase emulators for consistent test data
- Check that test user exists and has correct permissions

### Flaky tests
- Add explicit waits with `expect().toBeVisible()`
- Use `test.setTimeout()` for slow operations
- Check for race conditions in async operations

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Selectors](https://playwright.dev/docs/selectors)
- [Test Configuration](https://playwright.dev/docs/test-configuration)
