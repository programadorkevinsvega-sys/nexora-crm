import { test, expect } from '@playwright/test'
import { authenticatePage } from './helpers'

test.describe('Lead Scoring & Prioritization E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(page)
  })

  test('should render lead scoring dashboard with temperature cards and rules list', async ({ page }) => {
    await page.goto('/scoring')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('h1')).toContainText('Lead Scoring & Prioritization')
    await expect(page.locator('text="HOT LEADS"')).toBeVisible()
    await expect(page.locator('text="WARM LEADS"')).toBeVisible()
    await expect(page.locator('text="COLD LEADS"')).toBeVisible()
    await expect(page.locator('text="Scoring Rules"')).toBeVisible()
    await expect(page.locator('text="Prioritized Leads Radar"')).toBeVisible()
  })
})
