import { test, expect } from '@playwright/test'
import { authenticatePage } from './helpers'

test.describe('Contracts & Quotes E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(page)
  })

  test('should render contracts dashboard without errors', async ({ page }) => {
    await page.goto('/contracts')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('h1, h2, h3').filter({ hasText: /contracts/i }).first()).toBeVisible()
  })

  test('should render quotes list without errors', async ({ page }) => {
    await page.goto('/quotes')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('h1, h2, h3').filter({ hasText: /quotes/i }).first()).toBeVisible()
  })
})
