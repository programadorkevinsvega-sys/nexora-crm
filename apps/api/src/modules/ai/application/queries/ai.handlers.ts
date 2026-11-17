import { Injectable } from '@nestjs/common'
import {
  GetDealWinProbabilityQuery,
  GetContactExecutiveSummaryQuery,
  GetChurnRiskPredictionQuery,
} from './ai.queries'
import { AiRepository } from '../../domain/repositories/ai.repository'
import { DealWinPrediction } from '../../domain/entities/deal-win-prediction.entity'
import { ContactExecutiveSummary } from '../../domain/entities/contact-summary.entity'
import { ChurnRiskPrediction } from '../../domain/entities/churn-prediction.entity'

@Injectable()
export class GetDealWinProbabilityHandler {
  constructor(private readonly repo: AiRepository) {}

  async execute(query: GetDealWinProbabilityQuery): Promise<DealWinPrediction> {
    return this.repo.predictDealWinProbability(query.tenantId, query.dealId)
  }
}

@Injectable()
export class GetContactExecutiveSummaryHandler {
  constructor(private readonly repo: AiRepository) {}

  async execute(query: GetContactExecutiveSummaryQuery): Promise<ContactExecutiveSummary> {
    return this.repo.generateContactExecutiveSummary(query.tenantId, query.contactId)
  }
}

@Injectable()
export class GetChurnRiskPredictionHandler {
  constructor(private readonly repo: AiRepository) {}

  async execute(query: GetChurnRiskPredictionQuery): Promise<ChurnRiskPrediction> {
    return this.repo.predictChurnRisk(query.tenantId, query.contactId)
  }
}
