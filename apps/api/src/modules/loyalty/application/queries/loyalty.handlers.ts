import { Injectable } from '@nestjs/common'
import { LoyaltyRepository, SegmentRepository, MetricsRepository } from '../../domain/repositories/loyalty.repository'
import { GetProfileQuery, GetSegmentsQuery, GetMetricsQuery } from './loyalty.queries'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class GetProfileHandler {
  constructor(private readonly repo: LoyaltyRepository) {}

  async execute(query: GetProfileQuery) {
    const profile = await this.repo.findProfileByContactId(query.tenantId, query.contactId)
    if (!profile) throw new NotFoundError('Loyalty Profile', query.contactId)
    return profile
  }
}

@Injectable()
export class GetSegmentsHandler {
  constructor(private readonly repo: SegmentRepository) {}

  async execute(query: GetSegmentsQuery) {
    return this.repo.list(query.tenantId)
  }
}

@Injectable()
export class GetMetricsHandler {
  constructor(private readonly repo: MetricsRepository) {}

  async execute(query: GetMetricsQuery) {
    const metrics = await this.repo.findByContactId(query.tenantId, query.contactId)
    if (!metrics) throw new NotFoundError('Customer Metrics', query.contactId)
    return metrics
  }
}
