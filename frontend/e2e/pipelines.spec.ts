import { test, expect } from '@playwright/test'
import { authenticatePage } from './helpers'

test.describe('Pipelines & Deals E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(page)
  })

  test('should load pipelines list and create a new pipeline', async ({ page }) => {
    await page.goto('/pipelines')
    await expect(page.locator('h1, h2, h3').filter({ hasText: /pipelines/i }).first()).toBeVisible()

    const addBtn = page.locator('button:has-text("Add Pipeline"), button:has-text("Create Pipeline")').first()
    await expect(addBtn).toBeVisible()
    await addBtn.click()

    const modal = page.locator('[role="dialog"], .modal, div:has-text("Create Pipeline")').first()
    await expect(modal).toBeVisible()

    const testName = `E2E Pipeline ${Date.now()}`
    await page.fill('input[name="name"]', testName)

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/pipelines') && res.request().method() === 'POST'),
      page.click('button[type="submit"]:has-text("Create")'),
    ])

    expect([200, 201]).toContain(response.status())
    await expect(page.locator(`text=${testName}`).first()).toBeVisible()
  })
})
