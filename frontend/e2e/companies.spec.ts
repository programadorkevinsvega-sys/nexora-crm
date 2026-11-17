import { test, expect } from '@playwright/test'
import { authenticatePage } from './helpers'

test.describe('Companies Management E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(page)
  })

  test('should load companies directory with search and table headers', async ({ page }) => {
    await page.goto('/companies')
    await expect(page.locator('h1, h2, h3').filter({ hasText: /companies/i }).first()).toBeVisible()
    const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]')
    await expect(searchInput).toBeVisible()
  })

  test('should create a company with minimal fields', async ({ page }) => {
    await page.goto('/companies')

    const addBtn = page.locator('button:has-text("Add Company"), button:has-text("Create Company")').first()
    await expect(addBtn).toBeVisible()
    await addBtn.click()

    const modal = page.locator('[role="dialog"], .modal, div:has-text("Create Company")').first()
    await expect(modal).toBeVisible()

    const testName = `E2E Company ${Date.now()}`
    await page.fill('input[name="name"]', testName)

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/companies') && res.request().method() === 'POST'),
      page.click('button[type="submit"]:has-text("Create")'),
    ])

    expect([200, 201]).toContain(response.status())
    await expect(page.locator(`text=${testName}`).first()).toBeVisible()
  })
})
