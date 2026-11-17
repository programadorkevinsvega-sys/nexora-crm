import type {
  CustomerSurvey,
  CreateCustomerSurveyDto,
  SurveyResponse,
  RecordSurveyResponseDto,
  SurveyAnalyticsSummary,
} from '@crm/contracts'

export class ApiSurveysRepository {
  static async listSurveys(): Promise<CustomerSurvey[]> {
    const res = await fetch('/api/surveys', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al listar encuestas')
    return res.json()
  }

  static async createSurvey(dto: CreateCustomerSurveyDto): Promise<CustomerSurvey> {
    const res = await fetch('/api/surveys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al crear encuesta')
    return res.json()
  }

  static async recordResponse(dto: RecordSurveyResponseDto): Promise<SurveyResponse> {
    const res = await fetch('/api/surveys/responses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al registrar respuesta')
    return res.json()
  }

  static async getAnalytics(): Promise<SurveyAnalyticsSummary> {
    const res = await fetch('/api/surveys/analytics', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al consultar analítica de satisfacción')
    return res.json()
  }
}
