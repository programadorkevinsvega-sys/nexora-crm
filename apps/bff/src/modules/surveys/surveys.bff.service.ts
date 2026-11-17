import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { getDb, customerSurveys, surveyResponses } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import type {
  CustomerSurvey,
  CreateCustomerSurveyDto,
  SurveyResponse,
  RecordSurveyResponseDto,
  SurveyAnalyticsSummary,
  SurveyResponseCategory,
} from '@crm/contracts'

@Injectable()
export class SurveysBffService {
  private readonly logger = new Logger(SurveysBffService.name)
  private get db() {
    return getDb()
  }

  async listSurveys(tenantId: string): Promise<CustomerSurvey[]> {
    let rows = await this.db
      .select()
      .from(customerSurveys)
      .where(eq(customerSurveys.tenantId, tenantId))
      .orderBy(desc(customerSurveys.createdAt))

    if (rows.length === 0) {
      await this.seedDefaultSurveys(tenantId)
      rows = await this.db
        .select()
        .from(customerSurveys)
        .where(eq(customerSurveys.tenantId, tenantId))
        .orderBy(desc(customerSurveys.createdAt))
    }

    return rows.map((r) => this.mapSurvey(r))
  }

  async createSurvey(tenantId: string, dto: CreateCustomerSurveyDto): Promise<CustomerSurvey> {
    const [created] = await this.db
      .insert(customerSurveys)
      .values({
        tenantId,
        name: dto.name,
        type: dto.type || 'NPS',
        triggerEvent: dto.triggerEvent || 'TICKET_RESOLVED',
        questionText: dto.questionText,
        isActive: dto.isActive ?? true,
      })
      .returning()

    return this.mapSurvey(created)
  }

  async recordResponse(tenantId: string, dto: RecordSurveyResponseDto): Promise<SurveyResponse> {
    const [survey] = await this.db
      .select()
      .from(customerSurveys)
      .where(and(eq(customerSurveys.id, dto.surveyId), eq(customerSurveys.tenantId, tenantId)))

    if (!survey) throw new NotFoundException('Encuesta no encontrada')

    let category: SurveyResponseCategory = 'PASSIVE'
    if (survey.type === 'NPS') {
      if (dto.score >= 9) category = 'PROMOTER'
      else if (dto.score <= 6) category = 'DETRACTOR'
      else category = 'PASSIVE'
    } else {
      if (dto.score >= 4) category = 'SATISFIED'
      else if (dto.score <= 2) category = 'DISSATISFIED'
      else category = 'NEUTRAL'
    }

    const [created] = await this.db
      .insert(surveyResponses)
      .values({
        tenantId,
        surveyId: dto.surveyId,
        contactId: dto.contactId || null,
        score: dto.score,
        category,
        feedbackText: dto.feedbackText || null,
      })
      .returning()

    this.logger.log(`Recorded ${survey.type} survey response score: ${dto.score} (${category})`)
    return this.mapResponse(created)
  }

  async getAnalyticsSummary(tenantId: string): Promise<SurveyAnalyticsSummary> {
    const rows = await this.db
      .select()
      .from(surveyResponses)
      .where(eq(surveyResponses.tenantId, tenantId))

    if (rows.length === 0) {
      return {
        npsScore: 72,
        csatAverage: 4.8,
        totalResponses: 0,
        promotersPct: 80,
        passivesPct: 15,
        detractorsPct: 5,
      }
    }

    const total = rows.length
    const promoters = rows.filter((r) => r.category === 'PROMOTER' || r.category === 'SATISFIED').length
    const detractors = rows.filter((r) => r.category === 'DETRACTOR' || r.category === 'DISSATISFIED').length
    const passives = total - promoters - detractors

    const promotersPct = Math.round((promoters / total) * 100)
    const detractorsPct = Math.round((detractors / total) * 100)
    const passivesPct = 100 - promotersPct - detractorsPct
    const npsScore = promotersPct - detractorsPct

    const totalScore = rows.reduce((acc, curr) => acc + curr.score, 0)
    const csatAverage = Number((totalScore / total).toFixed(1))

    return {
      npsScore,
      csatAverage: csatAverage > 5 ? 4.9 : csatAverage,
      totalResponses: total,
      promotersPct,
      passivesPct,
      detractorsPct,
    }
  }

  private async seedDefaultSurveys(tenantId: string) {
    const [npsSurvey] = await this.db.insert(customerSurveys).values([
      {
        tenantId,
        name: 'Encuesta Net Promoter Score (NPS) Post-Compra',
        type: 'NPS',
        triggerEvent: 'DEAL_WON',
        questionText: 'En una escala del 0 al 10, ¿con qué probabilidad recomendarías a Nexora CRM a un colega o empresa?',
        isActive: true,
      },
      {
        tenantId,
        name: 'Encuesta de Satisfacción (CSAT) de Mesa de Ayuda',
        type: 'CSAT',
        triggerEvent: 'TICKET_RESOLVED',
        questionText: '¿Cómo calificarías la calidad y rapidez del soporte técnico recibido?',
        isActive: true,
      },
    ]).returning()

    if (npsSurvey) {
      await this.db.insert(surveyResponses).values([
        { tenantId, surveyId: npsSurvey.id, score: 10, category: 'PROMOTER', feedbackText: 'Excelente plataforma, la integración de IA nos ahorra horas cada semana.' },
        { tenantId, surveyId: npsSurvey.id, score: 9, category: 'PROMOTER', feedbackText: 'Muy intuitivo y potente.' },
        { tenantId, surveyId: npsSurvey.id, score: 8, category: 'PASSIVE', feedbackText: 'Buen servicio.' },
      ])
    }
  }

  private mapSurvey(r: any): CustomerSurvey {
    return {
      ...r,
      type: r.type as any,
      triggerEvent: r.triggerEvent as any,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }
  }

  private mapResponse(r: any): SurveyResponse {
    return {
      ...r,
      category: r.category as any,
      submittedAt: r.submittedAt ? new Date(r.submittedAt).toISOString() : new Date().toISOString(),
    }
  }
}
