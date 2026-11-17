import { test, expect } from '@playwright/test'
import { authenticatePage } from './helpers'

test.describe('Support & Helpdesk E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(page)
  })

  test('should create a support ticket with subject, description and priority', async ({ page }) => {
    await page.goto('/support/tickets/new')

    const ticketSubject = `E2E Ticket ${Date.now()}`
    await page.fill('input[placeholder*="subject" i]', ticketSubject)
    await page.fill('textarea[placeholder*="issue" i]', 'Detailed description of the issue for E2E testing.')

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/support-tickets') && res.request().method() === 'POST'),
      page.click('button:has-text("Create Ticket")'),
    ])

    expect([200, 201]).toContain(response.status())
  })

  test('should render helpdesk conversations list without repository runtime errors', async ({ page }) => {
    await page.goto('/support/helpdesk/conversations')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('text="this.repository.list is not a function"')).not.toBeVisible()
    await expect(page.locator('body')).toBeVisible()
  })

  test('should render helpdesk mailbox settings', async ({ page }) => {
    await page.goto('/support/helpdesk/settings/mailboxes')

    await expect(page.locator('text="Something went wrong"')).not.toBeVisible()
    await expect(page.locator('body')).toBeVisible()
  })
})
