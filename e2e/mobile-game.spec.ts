import { expect, test, type Locator, type Page } from '@playwright/test';

function cupLabelFromOrder(orderText: string): string {
  if (orderText.includes('16oz')) return '16oz Cup';
  if (orderText.includes('12oz')) return '12oz Cup';
  if (orderText.includes('8oz')) return '8oz Cup';
  return 'Demitasse Cup';
}

async function startRookieGame(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /coffee cart chronicles/i })).toBeVisible();

  await page.getByRole('button', { name: /rookie barista/i }).tap();
  await expect(page.getByText('CUSTOMER ORDER')).toBeVisible();
  await expect(page.locator('.build-sequence')).toBeVisible();
  await expect(page.locator('.token-grid .token').first()).toBeVisible();
}

async function getCupToken(page: Page): Promise<Locator> {
  const orderText = (await page.locator('.order-text').textContent())?.trim() ?? '';
  const cupLabel = cupLabelFromOrder(orderText);
  return page.locator('.token-grid .token').filter({ hasText: cupLabel });
}

async function expectBuildProgress(page: Page, completedSteps: number) {
  await expect(page.locator('.build-slot')).toHaveCount(completedSteps);
  await expect(page.locator('.step-progress-text')).toContainText(`${completedSteps}/`);
}

test.describe('mobile game flow', () => {
  test('tap-selects token and places via build area', async ({ page }) => {
    await startRookieGame(page);

    const initialProgress = await page.locator('.step-progress-text').textContent();
    expect(initialProgress?.trim()).toMatch(/^0\/\d+ STEPS$/);

    const cupToken = await getCupToken(page);
    await cupToken.tap();
    await expect(cupToken).toHaveClass(/token--selected/);

    await page.locator('.build-sequence').tap();
    await expectBuildProgress(page, 1);
    await expect(page.locator('.build-empty')).toHaveCount(0);
  });

  test('click-selects token and places via build area on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await startRookieGame(page);

    const cupToken = await getCupToken(page);
    await cupToken.click();
    await expect(cupToken).toHaveClass(/token--selected/);

    await page.locator('.build-sequence').click();
    await expectBuildProgress(page, 1);
  });
});