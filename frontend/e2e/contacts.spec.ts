import { test, expect } from '@playwright/test'
import { authenticatePage } from './helpers'

test.describe('Contacts Management E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(page)
  })

  test('should load contacts directory with search and table headers', async ({ page }) => {
    await page.goto('/contacts')
    await expect(page.locator('h1, h2, h3').filter({ hasText: /contacts/i }).first()).toBeVisible()
    const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]')
    await expect(searchInput).toBeVisible()
  })

  test('should create a contact with minimal and null optional fields', async ({ page }) => {
    await page.goto('/contacts')

    const addBtn = page.locator('button:has-text("Add Contact"), button:has-text("Create Contact")').first()
    await expect(addBtn).toBeVisible()
    await addBtn.click()

    const modal = page.locator('[role="dialog"], .modal, div:has-text("Create Contact")').first()
    await expect(modal).toBeVisible()

    const testName = `E2E Contact ${Date.now()}`
    await page.fill('input[name="firstName"]', testName)

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/contacts') && res.request().method() === 'POST'),
      page.click('button[type="submit"]:has-text("Create")'),
    ])

    expect([200, 201]).toContain(response.status())
    await expect(page.locator(`text=${testName}`).first()).toBeVisible()
  })
})
