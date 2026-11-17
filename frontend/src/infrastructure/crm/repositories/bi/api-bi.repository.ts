import type { BiReport, CreateBiReportDto } from '@crm/contracts'
import { api } from '../../api/api-client'

export class ApiBiRepository {
  static async listReports(): Promise<BiReport[]> {
    return api.get<BiReport[]>('/api/bi/reports')
  }

  static async createReport(dto: CreateBiReportDto): Promise<BiReport> {
    return api.post<BiReport>('/api/bi/reports', dto)
  }

  static async deleteReport(id: string): Promise<void> {
    await api.delete<void>(`/api/bi/reports/${id}`)
  }

  static getDataFeedUrl(entity: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/api/bi/feed/${entity}`
  }
}
