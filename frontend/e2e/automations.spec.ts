import { test, expect } from '@playwright/test'
import { authenticatePage } from './helpers'

test.describe('Workflow Automation Engine E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(page)
  })

  test('should render automations dashboard without errors', async ({ page }) => {
    await page.goto('/automations')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('h1')).toContainText('Automations & Workflows')
  })

  test('should render workflow create designer page', async ({ page }) => {
    await page.goto('/automations/new')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('h1')).toContainText('Create Automation Workflow')
    await expect(page.locator('text="TRIGGER"')).toBeVisible()
    await expect(page.locator('text="Sequence Steps Pipeline"')).toBeVisible()
  })
})
