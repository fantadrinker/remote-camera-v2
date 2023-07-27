import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Remote Camera/);
});

test('have 2 buttons', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Click the get started link.
  const useAsCamera = page.getByRole('button', { name: 'Use as Camera' });

  await expect(useAsCamera).toBeVisible();

  const seeRecordings = page.getByRole('button', { name: 'See Recordings' });

  await expect(seeRecordings).toBeVisible();

});
