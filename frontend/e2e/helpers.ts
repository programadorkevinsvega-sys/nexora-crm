import { Page } from '@playwright/test'

export const TEST_TENANT_ID = '08e74d36-cb43-4de0-b7f2-11234db953b1'
export const TEST_USER_ID = '00000000-0000-0000-0000-000000000002'

export async function authenticatePage(page: Page) {
  await page.addInitScript(
    ({ tenantId, userId }) => {
      sessionStorage.setItem('crm_token', 'mock-valid-token')
      sessionStorage.setItem('crm_tenant_id', tenantId)
      sessionStorage.setItem('crm_user_id', userId)
      sessionStorage.setItem('crm_user_name', 'E2E Test User')
      sessionStorage.setItem('crm_user_email', 'e2e@example.com')
      sessionStorage.setItem('crm_company_name', 'E2E Test Corp')
    },
    { tenantId: TEST_TENANT_ID, userId: TEST_USER_ID },
  )
}
