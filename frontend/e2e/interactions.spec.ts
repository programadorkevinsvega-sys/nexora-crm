import { test, expect } from '@playwright/test'
import { authenticatePage } from './helpers'

test.describe('Interactions Timeline E2E Flows', () => {
  test.beforeEach(async ({ page }) => {
    await authenticatePage(page)
  })

  test('should create a note and verify on notes stream', async ({ page }) => {
    await page.goto('/notes')

    const addBtn = page.locator('button:has-text("Add Note")').first()
    await expect(addBtn).toBeVisible()
    await addBtn.click()

    const modal = page.locator('[role="dialog"], .modal, div:has-text("Create Note")').first()
    await expect(modal).toBeVisible()

    const noteContent = `E2E Note Content ${Date.now()}`
    await page.fill('input[name="content"], textarea[name="content"]', noteContent)

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/notes') && res.request().method() === 'POST'),
      page.click('button[type="submit"]:has-text("Create")'),
    ])

    expect([200, 201]).toContain(response.status())
    await expect(page.locator(`text=${noteContent}`).first()).toBeVisible()
  })

  test('should create a task with date picker and verify in tasks list', async ({ page }) => {
    await page.goto('/tasks')

    const addBtn = page.locator('button:has-text("Add Task")').first()
    await expect(addBtn).toBeVisible()
    await addBtn.click()

    const modal = page.locator('[role="dialog"], .modal, div:has-text("Create Task")').first()
    await expect(modal).toBeVisible()

    const taskTitle = `E2E Task Title ${Date.now()}`
    await page.fill('input[name="title"]', taskTitle)
    await page.fill('input[name="dueDate"]', '2026-09-30')

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/tasks') && res.request().method() === 'POST'),
      page.click('button[type="submit"]:has-text("Create")'),
    ])

    expect([200, 201]).toContain(response.status())
    await expect(page.locator(`text=${taskTitle}`).first()).toBeVisible()
  })

  test('should log a call and verify on calls dashboard', async ({ page }) => {
    await page.goto('/calls')

    const logBtn = page.locator('button:has-text("Log Call")').first()
    await expect(logBtn).toBeVisible()
    await logBtn.click()

    const modal = page.locator('[role="dialog"], .modal, div:has-text("Log Call")').first()
    await expect(modal).toBeVisible()

    const callSummary = `E2E Call Summary ${Date.now()}`
    await page.selectOption('select[name="callType"]', 'OUTBOUND')
    await page.fill('input[name="happenedAt"]', '2026-08-29')
    await page.fill('input[name="summary"]', callSummary)

    const [response] = await Promise.all([
      page.waitForResponse((res) => res.url().includes('/api/calls') && res.request().method() === 'POST'),
      page.click('button[type="submit"]:has-text("Save")'),
    ])

    expect([200, 201]).toContain(response.status())
    await expect(page.locator(`text=${callSummary}`).first()).toBeVisible()
  })
})
