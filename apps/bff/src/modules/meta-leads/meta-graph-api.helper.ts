/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from '@nestjs/common'
import type { MetaLeadForm } from '@crm/contracts'

export class MetaGraphApiHelper {
  private static readonly logger = new Logger(MetaGraphApiHelper.name)

  static async fetchPagesAndAccounts(accessToken: string): Promise<{
    pages: Array<{ id: string; name: string; access_token?: string; category?: string }>
    adAccounts: Array<{ id: string; name: string }>
  }> {
    try {
      const pagesRes = await fetch(
        `https://graph.facebook.com/v20.0/me/accounts?access_token=${encodeURIComponent(accessToken)}&fields=id,name,access_token,category`,
      )
      const pagesData = await pagesRes.json()
      const pages = Array.isArray(pagesData.data)
        ? pagesData.data.map((p: any) => ({
            id: p.id,
            name: p.name,
            access_token: p.access_token,
            category: p.category,
          }))
        : []

      const adsRes = await fetch(
        `https://graph.facebook.com/v20.0/me/adaccounts?access_token=${encodeURIComponent(accessToken)}&fields=id,name,account_id`,
      )
      const adsData = await adsRes.json()
      const adAccounts = Array.isArray(adsData.data)
        ? adsData.data.map((a: any) => ({
            id: a.id || a.account_id,
            name: a.name || `Cuenta Ads ${a.id}`,
          }))
        : []

      return { pages, adAccounts }
    } catch (err: any) {
      this.logger.error(`Error querying Meta Graph API: ${err.message}`)
      return { pages: [], adAccounts: [] }
    }
  }

  static async fetchLeadGenForms(pageId: string, pageAccessToken: string): Promise<MetaLeadForm[]> {
    try {
      const formsRes = await fetch(
        `https://graph.facebook.com/v20.0/${pageId}/leadgen_forms?access_token=${encodeURIComponent(pageAccessToken)}&fields=id,name,status,leads_count`,
      )
      const formsData = await formsRes.json()
      if (Array.isArray(formsData.data)) {
        return formsData.data.map((f: any) => ({
          formId: f.id,
          formName: f.name,
          status: f.status || 'ACTIVE',
          leadsCount: f.leads_count || 0,
          defaultLeadStatus: 'NEW',
        }))
      }
    } catch (err: any) {
      this.logger.warn(`Could not fetch leadgen forms: ${err.message}`)
    }
    return []
  }
}
