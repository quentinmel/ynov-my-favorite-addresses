import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

  test('should display Signup button on home page and navigate to signup', async ({ page }) => {
    await page.goto('/');

    const signupButton = page.getByRole('link', { name: 'Create account' });
    await expect(signupButton).toBeVisible();

    await signupButton.click();

    await expect(page).toHaveURL('/signup');
  });

  test('should fill signup form and show success toast', async ({ page }) => {
    const testEmail = `signup-test-${Date.now()}@example.com`;
    const testPassword = 'password123';

    await page.goto('/signup');

    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);

    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Welcome')).toBeVisible({ timeout: 10000 });
  });

  test('should login with created account and display Dashboard', async ({ page, request }) => {
    const testEmail = `login-test-${Date.now()}@example.com`;
    const testPassword = 'password123';

    // Créer l'utilisateur via API
    await request.post('/api/users', {
      data: { email: testEmail, password: testPassword }
    });

    await page.goto('/signin');

    await page.getByPlaceholder('Email address').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);

    await page.getByRole('button', { name: 'Sign in' }).click();

    // ✅ Attendre la navigation vers le dashboard
    await page.waitForURL('/dashboard', { timeout: 15000 });
    await expect(page.getByText('Your saved places and verification status.')).toBeVisible({ timeout: 10000 });
  });

});
