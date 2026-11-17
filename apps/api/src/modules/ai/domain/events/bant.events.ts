import { DomainEvent } from '@crm/shared'
import { BantClassification } from '../entities/bant-qualification.entity'

export class LeadBantQualifiedEvent extends DomainEvent {
  readonly aggregateType = 'lead'
  readonly eventName = 'lead.bant_qualified'

  constructor(
    readonly aggregateId: string, // contactId
    readonly tenantId: string,
    readonly totalBantScore: number,
    readonly classification: BantClassification,
    readonly summaryReason: string,
    readonly recommendedAction: string,
    readonly payload: Record<string, unknown> = {},
  ) {
    super()
  }

  toPrimitives() {
    return {
      contactId: this.aggregateId,
      tenantId: this.tenantId,
      totalBantScore: this.totalBantScore,
      classification: this.classification,
      summaryReason: this.summaryReason,
      recommendedAction: this.recommendedAction,
      ...this.payload,
    }
  }
}
