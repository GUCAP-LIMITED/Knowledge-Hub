import { expect, test } from '@playwright/test';

test.describe('smoke', () => {
  test('login screen offers the UAPP sign-in', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /Academy/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with UAPP' })).toBeVisible();
  });

  test('demo portal sign-in lands on the dashboard with a permission-driven sidebar', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign in with UAPP' }).click();
    await page.getByRole('button', { name: /Priya Nair/ }).click();

    await expect(
      page.getByRole('heading', { name: /Welcome back, Priya Nair/ }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Courses', exact: true })).toBeVisible();
    // A consultant has no approval rights, so the Approvals entry must not be offered.
    await expect(page.getByRole('link', { name: 'Approvals' })).toHaveCount(0);
  });

  test('a learner can open a course from the catalogue', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign in with UAPP' }).click();
    await page.getByRole('button', { name: /Priya Nair/ }).click();
    await page.getByRole('link', { name: 'Courses', exact: true }).first().click();

    await expect(page.getByRole('heading', { name: 'Course Catalog' })).toBeVisible();
    await page
      .getByRole('link', { name: /Admissions Fundamentals/ })
      .first()
      .click();
    await expect(
      page.getByRole('heading', { name: 'Admissions Fundamentals' }),
    ).toBeVisible();
  });
});
