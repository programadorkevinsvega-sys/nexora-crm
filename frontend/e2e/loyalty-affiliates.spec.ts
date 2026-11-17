import { test, expect } from '@playwright/test'
import { authenticatePage } from './helpers'

test.describe('Loyalty & Affiliates E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(page)
  })

  test('should render loyalty segments without repository errors', async ({ page }) => {
    await page.goto('/loyalty/segments')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('text="this.repository.list is not a function"')).not.toBeVisible()
    await expect(page.locator('body')).toBeVisible()
  })

  test('should render affiliates directory without repository errors', async ({ page }) => {
    await page.goto('/affiliates')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('text="this.repository.list is not a function"')).not.toBeVisible()
    await expect(page.locator('body')).toBeVisible()
  })

  test('should render affiliate programs without repository errors', async ({ page }) => {
    await page.goto('/affiliates/programs')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('text="this.repository.list is not a function"')).not.toBeVisible()
    await expect(page.locator('body')).toBeVisible()
  })
})
