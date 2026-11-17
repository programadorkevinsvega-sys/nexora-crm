import { test, expect } from '@playwright/test'
import { authenticatePage } from './helpers'

test.describe('CPQ and E-Signature E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(page)
  })

  test('should render products catalog page with CPQ header and table', async ({ page }) => {
    await page.goto('/products')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('h1')).toContainText('Products & Price Books (CPQ)')
    await expect(page.locator('text="New Product"')).toBeVisible()
  })

  test('should render margin and discount approvals governance dashboard', async ({ page }) => {
    await page.goto('/approvals')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('h1')).toContainText('CPQ Margin & Discount Approvals')
    await expect(page.locator('text="Pending Approvals"')).toBeVisible()
    await expect(page.locator('text="Governance Policy"')).toBeVisible()
  })
})
