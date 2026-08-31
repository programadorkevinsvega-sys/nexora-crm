import { test, expect } from '@playwright/test'

test.describe('Authentication & Session E2E Flows', () => {
  test('should render login page with email and password fields', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should display validation feedback on invalid credentials submit', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"], input[name="email"]', 'wrong@example.com')
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword123')

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/auth/login') && res.request().method() === 'POST'),
      page.click('button[type="submit"]'),
    ])

    expect(response.status()).toBe(401)
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/login')
    const registerLink = page.locator('a[href*="/register"]').first()
    await expect(registerLink).toBeVisible()
    await registerLink.click()
    await expect(page).toHaveURL(/.*register.*/)
  })
})
