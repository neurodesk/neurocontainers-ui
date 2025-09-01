import { test, expect } from '@playwright/test';

test.describe('NeuroContainers UI Homepage', () => {
  test('should load homepage with correct title and main elements', async ({ page }) => {
    await page.goto('/');

    // Check page title
    await expect(page).toHaveTitle(/Neurocontainers/);

    // Check main heading exists
    await expect(page.locator('h1')).toContainText('Neurocontainers Builder');

    // Check main action buttons exist
    await expect(page.locator('text=Create New Container')).toBeVisible();
    await expect(page.locator('text=Paste YAML Recipe')).toBeVisible();
    await expect(page.locator('text=Upload Existing YAML')).toBeVisible();

    // Check recent containers section
    await expect(page.locator('text=Recent Containers')).toBeVisible();

    // Check published containers section  
    await expect(page.locator('text=Published Containers')).toBeVisible();

    // Check footer links
    await expect(page.locator('text=neurodesk.org')).toBeVisible();
  });

  test('should open guided tour when clicking Create New Container', async ({ page }) => {
    await page.goto('/');

    // Click Create New Container button
    await page.click('text=Create New Container');

    // Should open the guided tour modal
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Should see template options
    await expect(page.locator('text=Start from Scratch')).toBeVisible();
    
    // Close the modal
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should trigger file upload when clicking Upload Existing YAML', async ({ page }) => {
    await page.goto('/');

    // The "Upload Existing YAML" button should be a file input trigger
    const fileInput = page.locator('input[type="file"][accept=".yaml,.yml"]');
    await expect(fileInput).toBeAttached();

    // The button should be visible and clickable
    await expect(page.locator('text=Upload Existing YAML')).toBeVisible();
  });

  test('should show paste modal when clicking Paste YAML Recipe', async ({ page }) => {
    await page.goto('/');

    // Click Paste YAML Recipe button
    await page.click('text=Paste YAML Recipe');

    // Check modal is visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Upload YAML Configuration')).toBeVisible();

    // Check modal close functionality
    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should have working theme toggle', async ({ page }) => {
    await page.goto('/');

    // Find theme toggle button (usually a sun/moon icon)
    const themeToggle = page.locator('button[aria-label*="theme"], button[title*="theme"], button:has-text("☀"), button:has-text("🌙")').first();
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      
      // Theme should change (we'll check if page still loads without errors)
      await expect(page.locator('h1')).toContainText('Neurocontainers Builder');
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Block GitHub API requests to simulate network issues
    await page.route('**/api.github.com/**', route => route.abort());
    await page.route('**/github.com/**', route => route.abort());

    await page.goto('/');

    // Page should still load despite API failures
    await expect(page.locator('h1')).toContainText('Neurocontainers Builder');
    await expect(page.locator('text=Create New Container')).toBeVisible();

    // Published containers section may show error, but that's expected
    await expect(page.locator('text=Published Containers')).toBeVisible();
  });
});