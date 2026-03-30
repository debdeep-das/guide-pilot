import { test, expect } from '@playwright/test';

test.describe('GuidePilot — full tour flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the modal to appear (tour auto-starts)
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  });

  test('auto-starts with welcome modal on load', async ({ page }) => {
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Welcome to GuidePilot!')).toBeVisible();
  });

  test('modal has correct aria attributes', async ({ page }) => {
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  test('progress indicator shows 1 / 5', async ({ page }) => {
    await expect(page.getByText('1 / 5')).toBeVisible();
  });

  test('navigates to tooltip step on Next', async ({ page }) => {
    await page.getByText("Let's go!").click();
    await expect(page.getByRole('tooltip')).toBeVisible();
    await expect(page.getByText('Create a project')).toBeVisible();
    await expect(page.getByText('2 / 5')).toBeVisible();
  });

  test('navigates through all 5 steps', async ({ page }) => {
    // Step 1 — Modal
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByText("Let's go!").click();

    // Step 2 — Tooltip
    await expect(page.getByRole('tooltip')).toBeVisible();
    await page.getByText('Next →').click();

    // Step 3 — Spotlight
    await expect(page.getByText('Your analytics')).toBeVisible();
    await page.getByText('Next →').click();

    // Step 4 — Interactive Spotlight
    await expect(page.getByText('Try searching')).toBeVisible();
    await page.getByText('Next →').click();

    // Step 5 — InlineHint
    await expect(page.getByText('Need help?')).toBeVisible();
    await expect(page.getByText('5 / 5')).toBeVisible();
  });

  test('Back button returns to previous step', async ({ page }) => {
    await page.getByText("Let's go!").click();
    await expect(page.getByText('2 / 5')).toBeVisible();
    await page.getByText('← Back').click();
    await expect(page.getByText('Welcome to GuidePilot!')).toBeVisible();
    await expect(page.getByText('1 / 5')).toBeVisible();
  });

  test('Skip button dismisses the tour', async ({ page }) => {
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('tooltip')).not.toBeVisible();
  });

  test('Finish on last step completes the tour', async ({ page }) => {
    await page.getByText("Let's go!").click();
    await page.getByText('Next →').click();
    await page.getByText('Next →').click();
    await page.getByText('Next →').click();
    await page.getByText('Finish').click();
    // Tour UI should be gone
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByRole('tooltip')).not.toBeVisible();
  });
});

test.describe('GuidePilot — keyboard navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
  });

  test('Escape key skips the tour', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('ArrowRight advances to next step', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tooltip')).toBeVisible();
  });

  test('ArrowLeft goes back to previous step', async ({ page }) => {
    await page.keyboard.press('ArrowRight');
    await expect(page.getByText('2 / 5')).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByText('1 / 5')).toBeVisible();
  });
});

test.describe('GuidePilot — Restart Tour', () => {
  test('Restart Tour button restarts from step 1', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Skip the tour
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Restart
    await page.getByRole('button', { name: 'Restart Tour' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('1 / 5')).toBeVisible();
  });
});

test.describe('GuidePilot — interactive spotlight', () => {
  test('search input is interactive during spotlight step', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    // Navigate to interactive spotlight step (step 4)
    await page.getByText("Let's go!").click();
    await page.getByText('Next →').click();
    await page.getByText('Next →').click();

    await expect(page.getByText('Try searching')).toBeVisible();

    // Type in the search input while spotlight is active
    await page.getByPlaceholder('Search projects...').fill('hello');
    await expect(page.getByPlaceholder('Search projects...')).toHaveValue('hello');
  });
});
