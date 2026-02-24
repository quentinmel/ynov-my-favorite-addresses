import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  
  test('should display Signup button on home page and navigate to signup', async ({ page }) => {
    await page.goto('/');
    
    // Verify the Signup button is present
    const signupButton = page.getByRole('link', { name: 'Signup' });
    await expect(signupButton).toBeVisible();
    
    // Click on Signup button
    await signupButton.click();
    
    // Verify we navigated to signup page
    await expect(page).toHaveURL('/signup');
  });

  test('should fill signup form and show success toast', async ({ page }) => {
    const testEmail = `signup-test-${Date.now()}@example.com`;
    const testPassword = 'password123';

    await page.goto('/signup');
    
    // Fill the signup form
    await page.getByPlaceholder('User email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    
    // Submit the form
    await page.getByRole('button', { name: 'Signup' }).click();
    
    // Verify success toast appears
    await expect(page.getByText('User created, you can signin')).toBeVisible({ timeout: 10000 });
    
    // Verify redirect to home page
    await expect(page).toHaveURL('/');
  });

  test('should login with created account and display Dashboard', async ({ page, request }) => {
    const testEmail = `login-test-${Date.now()}@example.com`;
    const testPassword = 'password123';

    // First create a user via API
    await request.post('/api/users', {
      data: { email: testEmail, password: testPassword }
    });

    await page.goto('/signin');
    
    // Fill the signin form
    await page.getByPlaceholder('User email').fill(testEmail);
    await page.getByPlaceholder('Password').fill(testPassword);
    
    // Submit the form
    await page.getByRole('button', { name: 'Signin' }).click();
    
    // Verify success toast appears
    await expect(page.getByText('You are connected')).toBeVisible({ timeout: 10000 });

    // Wait for full page reload and dashboard to appear
    await page.waitForURL('/', { timeout: 10000 });
    await expect(page.getByText('Welcome on your dashboard')).toBeVisible({ timeout: 10000 });
  });

});
