import { test, expect } from '@playwright/test'
import { authenticatePage } from './helpers'

test.describe('Campaigns Management E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(page)
  })

  test('should render campaigns directory', async ({ page }) => {
    await page.goto('/campaigns')
    await expect(page.locator('h1, h2, h3').filter({ hasText: /campaigns/i }).first()).toBeVisible()
  })

  test('should create a new campaign with minimal and optional fields', async ({ page }) => {
    await page.goto('/campaigns/new')

    const campaignName = `E2E Campaign ${Date.now()}`
    await page.fill('input[placeholder="Campaign name"]', campaignName)
    await page.fill('input[placeholder*="Email" i]', 'Email Marketing')

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/campaigns') && res.request().method() === 'POST'),
      page.click('button:has-text("Create Campaign")'),
    ])

    expect([200, 201]).toContain(response.status())
  })
})
