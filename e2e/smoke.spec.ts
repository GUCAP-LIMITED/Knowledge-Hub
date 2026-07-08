import { expect, test } from '@playwright/test';

test.describe('smoke', () => {
  test('login screen renders the sign-in UI', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });
});
