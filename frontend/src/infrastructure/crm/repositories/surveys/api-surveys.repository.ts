import type {
  CustomerSurvey,
  CreateCustomerSurveyDto,
  SurveyResponse,
  RecordSurveyResponseDto,
  SurveyAnalyticsSummary,
} from '@crm/contracts'
import { api } from '../../api/api-client'

export class ApiSurveysRepository {
  static async listSurveys(): Promise<CustomerSurvey[]> {
    return api.get<CustomerSurvey[]>('/api/surveys')
  }

  static async createSurvey(dto: CreateCustomerSurveyDto): Promise<CustomerSurvey> {
    return api.post<CustomerSurvey>('/api/surveys', dto)
  }

  static async recordResponse(dto: RecordSurveyResponseDto): Promise<SurveyResponse> {
    return api.post<SurveyResponse>('/api/surveys/responses', dto)
  }

  static async getAnalytics(): Promise<SurveyAnalyticsSummary> {
    return api.get<SurveyAnalyticsSummary>('/api/surveys/analytics')
  }
}
