import type { BiReport, CreateBiReportDto } from '@crm/contracts'

export class ApiBiRepository {
  static async listReports(): Promise<BiReport[]> {
    const res = await fetch('/api/bi/reports', {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al obtener reportes de Power BI')
    return res.json()
  }

  static async createReport(dto: CreateBiReportDto): Promise<BiReport> {
    const res = await fetch('/api/bi/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al conectar reporte de Power BI')
    return res.json()
  }

  static async deleteReport(id: string): Promise<void> {
    const res = await fetch(`/api/bi/reports/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al eliminar reporte de Power BI')
  }

  static getDataFeedUrl(entity: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `${origin}/api/bi/feed/${entity}`
  }
}
