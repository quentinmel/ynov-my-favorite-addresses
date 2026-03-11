import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {

  test('should display Signup button on home page and navigate to signup', async ({ page }) => {
    await page.goto('/');

    const signupButton = page.getByRole('link', { name: 'Signup' });
    await expect(signupButton).toBeVisible();

    await signupButton.click();

    await expect(page).toHaveURL('/signup');
  });

  test('should fill signup form and show success toast', async ({ page }) => {
    const testEmail = `signup-test-${Date.now()}@example.com`;
    const testPassword = 'password123';

    await page.goto('/signup');

    await page.getByPlaceholder('User email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);

    await page.getByRole('button', { name: 'Signup' }).click();

    await expect(page.getByText('User created, you can signin')).toBeVisible({ timeout: 10000 });

    await expect(page).toHaveURL('/');
  });

  test('should login with created account and display Dashboard', async ({ page, request }) => {
    const testEmail = `login-test-${Date.now()}@example.com`;
    const testPassword = 'password123';

    // Créer l'utilisateur via API
    await request.post('/api/users', {
      data: { email: testEmail, password: testPassword }
    });

    await page.goto('/signin');

    await page.getByPlaceholder('User email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);

    await page.getByRole('button', { name: 'Signin' }).click();

    // ✅ Vérifier le toast (maintenant visible grâce au délai dans SigninPage)
    await expect(page.getByText('You are connected')).toBeVisible({ timeout: 10000 });

    // ✅ Attendre la navigation vers le dashboard
    await page.waitForURL('/', { timeout: 15000 });
    await expect(page.getByText('Welcome on your dashboard')).toBeVisible({ timeout: 10000 });
  });

});