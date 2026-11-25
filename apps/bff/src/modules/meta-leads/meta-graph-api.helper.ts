import { Logger } from '@nestjs/common'
import type { MetaLeadForm } from '@crm/contracts'

interface MetaPage {
  id: string
  name: string
  access_token?: string
  category?: string
}

interface MetaAdAccount {
  id: string
  name: string
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function dataRows(value: unknown): unknown[] {
  return isRecord(value) && Array.isArray(value.data) ? value.data : []
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export class MetaGraphApiHelper {
  private static readonly logger = new Logger(MetaGraphApiHelper.name)

  static async fetchPagesAndAccounts(accessToken: string): Promise<{
    pages: MetaPage[]
    adAccounts: MetaAdAccount[]
  }> {
    try {
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v20.0/me/accounts?access_token=${encodeURIComponent(accessToken)}&fields=id,name,access_token,category`,
      )
      if (!pagesResponse.ok) throw new Error(`Meta pages request failed with HTTP ${pagesResponse.status}`)
      const pagesData: unknown = await pagesResponse.json()
      const pages = dataRows(pagesData).flatMap((page): MetaPage[] => {
        if (!isRecord(page) || typeof page.id !== 'string' || typeof page.name !== 'string') return []
        return [{
          id: page.id,
          name: page.name,
          ...(typeof page.access_token === 'string' ? { access_token: page.access_token } : {}),
          ...(typeof page.category === 'string' ? { category: page.category } : {}),
        }]
      })

      const accountsResponse = await fetch(
        `https://graph.facebook.com/v20.0/me/adaccounts?access_token=${encodeURIComponent(accessToken)}&fields=id,name,account_id`,
      )
      if (!accountsResponse.ok) throw new Error(`Meta ad accounts request failed with HTTP ${accountsResponse.status}`)
      const accountsData: unknown = await accountsResponse.json()
      const adAccounts = dataRows(accountsData).flatMap((account): MetaAdAccount[] => {
        if (!isRecord(account)) return []
        const id = typeof account.id === 'string' ? account.id : typeof account.account_id === 'string' ? account.account_id : null
        if (!id) return []
        return [{ id, name: typeof account.name === 'string' ? account.name : `Cuenta Ads ${id}` }]
      })

      return { pages, adAccounts }
    } catch (error: unknown) {
      this.logger.error(`Error querying Meta Graph API: ${errorMessage(error)}`)
      return { pages: [], adAccounts: [] }
    }
  }

  static async fetchLeadGenForms(pageId: string, pageAccessToken: string): Promise<MetaLeadForm[]> {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v20.0/${pageId}/leadgen_forms?access_token=${encodeURIComponent(pageAccessToken)}&fields=id,name,status,leads_count`,
      )
      if (!response.ok) throw new Error(`Meta lead forms request failed with HTTP ${response.status}`)
      const responseData: unknown = await response.json()
      return dataRows(responseData).flatMap((form): MetaLeadForm[] => {
        if (!isRecord(form) || typeof form.id !== 'string' || typeof form.name !== 'string') return []
        const status = typeof form.status === 'string' ? form.status : 'ACTIVE'
        const leadsCount = typeof form.leads_count === 'number' && Number.isFinite(form.leads_count)
          ? form.leads_count
          : 0
        return [{ formId: form.id, formName: form.name, status, leadsCount, defaultLeadStatus: 'NEW' }]
      })
    } catch (error: unknown) {
      this.logger.warn(`Could not fetch leadgen forms: ${errorMessage(error)}`)
      return []
    }
  }
}
