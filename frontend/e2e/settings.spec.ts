import { test, expect } from '@playwright/test'
import { authenticatePage } from './helpers'

test.describe('Settings & Profile E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(page)
  })

  test('should render profile settings view without errors', async ({ page }) => {
    await page.goto('/settings/profile')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('body')).toBeVisible()
  })

  test('should render tags manager view without errors', async ({ page }) => {
    await page.goto('/settings/tags')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('body')).toBeVisible()
  })
})
