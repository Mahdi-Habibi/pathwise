import { test, expect } from '@playwright/test';

async function useLocale(page: import('@playwright/test').Page, locale: 'en' | 'fa') {
  await page.context().addCookies([
    {
      name: 'pathwise-locale',
      value: locale,
      url: 'http://localhost:3000',
    },
  ]);
}

test.describe('Learner journey', () => {
  test.beforeEach(async ({ page }) => {
    await useLocale(page, 'en');
  });

  test('landing page shows assessment CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('roadmap');
    await expect(page.getByRole('link', { name: /Start Your Free Assessment/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Start Your Free Assessment/i })).toHaveAttribute(
      'href',
      '/assessment',
    );
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Sign in to Pathwise/i })).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign in/i })).toBeVisible();
  });

  test('register form validates required fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /Create your account/i })).toBeVisible();

    await page.getByRole('button', { name: /Create account/i }).click();

    const nameInput = page.getByLabel('Full name');
    const emailInput = page.getByLabel('Email');
    const passwordInput = page.getByLabel('Password');

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    const nameValid = await nameInput.evaluate((el: HTMLInputElement) => el.validity.valueMissing);
    const emailValid = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validity.valueMissing,
    );
    const passwordValid = await passwordInput.evaluate(
      (el: HTMLInputElement) => el.validity.valueMissing,
    );

    expect(nameValid).toBe(true);
    expect(emailValid).toBe(true);
    expect(passwordValid).toBe(true);
  });

  test('protected checkout redirects to login without session cookie', async ({ page }) => {
    await page.goto('/checkout?product=ROADMAP_BUNDLE&roadmapId=rm-demo');
    await expect(page).toHaveURL(/\/login\?.*next=%2Fcheckout/);
  });

  test('assessment wizard advances after selecting a goal', async ({ page }) => {
    await page.goto('/assessment');
    await expect(page.getByText(/Stage 1 of 6/i)).toBeVisible();
    await page.getByRole('button', { name: /Get a Job/i }).click();
    await expect(page.getByRole('button', { name: /Continue/i })).toBeEnabled();
    await page.getByRole('button', { name: /Continue/i }).click();
    await expect(page.getByText(/Stage 2 of 6/i)).toBeVisible();
  });
});

test.describe('Multilingual UI', () => {
  test('Persian enables RTL and keeps email inputs LTR', async ({ page }) => {
    await useLocale(page, 'fa');
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'fa');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('link', { name: /ارزیابی رایگان را شروع کنید/i })).toBeVisible();

    await page.goto('/login');
    const email = page.getByLabel('ایمیل');
    await expect(email).toBeVisible();
    await expect(email).toHaveAttribute('dir', 'ltr');
  });

  test('switches to English and persists across reload', async ({ page }) => {
    await useLocale(page, 'fa');
    await page.goto('/');
    await page.locator('.lang-toggle').click();
    await page.locator('.lang-menu button', { hasText: 'English' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByRole('link', { name: /Start Your Free Assessment/i })).toBeVisible();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('link', { name: /Start Your Free Assessment/i })).toBeVisible();
  });

  test('language selector remains usable at compact widths', async ({ page }) => {
    await useLocale(page, 'en');
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto('/');
    const toggle = page.locator('.lang-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveCSS('display', 'inline-flex');
    await expect(toggle).not.toHaveCSS('background-image', 'none');
    await expect(toggle).toHaveCSS('border-radius', '999px');
    await toggle.click();
    await expect(page.locator('.lang-menu button', { hasText: 'فارسی' })).toBeVisible();
  });
});
