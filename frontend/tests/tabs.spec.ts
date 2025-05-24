import { test, expect } from '@playwright/test';

test.describe('TabsContainer', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto('/'); // baseURL is used from playwright.config.ts
    await page.waitForLoadState('networkidle');
  });

  test('should display all tabs and allow switching between them', async ({ page }) => {
    // Check for the presence of all tabs
    await expect(page.getByRole('tab', { name: 'Silver Game' })).toBeVisible();
    await expect(page.getByRole('tab', { name: "Silver's Story" })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Word Scramble' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Hangman' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Word Search' })).toBeVisible();

    // Click on "Silver's Story" tab and check for some unique content
    await page.getByRole('tab', { name: "Silver's Story" }).click();
    await expect(page.getByText('Silver\'s origins were humble')).toBeVisible(); // Assuming this text is in SilverChallengeContent

    // Click on "Word Scramble" tab and check for some unique content
    await page.getByRole('tab', { name: 'Word Scramble' }).click();
    await expect(page.getByRole('heading', { name: 'Word Scramble' })).toBeVisible(); // Or some other element unique to WordScrambleGame

    // Click on "Hangman" tab and check for unique content
    await page.getByRole('tab', { name: 'Hangman' }).click();
    await expect(page.getByRole('heading', { name: 'Hangman' })).toBeVisible(); // Or some other element unique to HangmanGame

    // Click on "Word Search" tab and check for unique content
    await page.getByRole('tab', { name: 'Word Search' }).click();
    await expect(page.getByRole('heading', { name: 'Word Search' })).toBeVisible(); // Or some other element unique to WordSearchGame

    // Click back to "Silver Game" tab and check for unique content
    await page.getByRole('tab', { name: 'Silver Game' }).click();
    await expect(page.getByRole('button', { name: 'Absorb Power' })).toBeVisible(); // Or some other element unique to SilverGame
  });
});
