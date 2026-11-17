export type BantClassification = 'SQL' | 'MQL' | 'NURTURING' | 'DISQUALIFIED'

export interface CreateBantQualificationProps {
  id?: string
  tenantId: string
  contactId: string
  budgetScore: number
  authorityScore: number
  needScore: number
  timelineScore: number
  summaryReason: string
  recommendedAction: string
  suggestedSalesTeamId?: string
  createdAt?: Date
}

export class BantQualification {
  readonly id: string
  readonly tenantId: string
  readonly contactId: string
  readonly budgetScore: number
  readonly authorityScore: number
  readonly needScore: number
  readonly timelineScore: number
  readonly totalBantScore: number
  readonly classification: BantClassification
  readonly summaryReason: string
  readonly recommendedAction: string
  readonly suggestedSalesTeamId?: string
  readonly createdAt: Date

  constructor(props: CreateBantQualificationProps) {
    this.id = props.id || crypto.randomUUID()
    this.tenantId = props.tenantId
    this.contactId = props.contactId
    this.budgetScore = Math.min(25, Math.max(0, props.budgetScore))
    this.authorityScore = Math.min(25, Math.max(0, props.authorityScore))
    this.needScore = Math.min(25, Math.max(0, props.needScore))
    this.timelineScore = Math.min(25, Math.max(0, props.timelineScore))
    this.totalBantScore =
      this.budgetScore + this.authorityScore + this.needScore + this.timelineScore

    if (this.totalBantScore >= 75) {
      this.classification = 'SQL'
    } else if (this.totalBantScore >= 50) {
      this.classification = 'MQL'
    } else if (this.totalBantScore >= 25) {
      this.classification = 'NURTURING'
    } else {
      this.classification = 'DISQUALIFIED'
    }

    this.summaryReason = props.summaryReason
    this.recommendedAction = props.recommendedAction
    this.suggestedSalesTeamId = props.suggestedSalesTeamId
    this.createdAt = props.createdAt || new Date()
  }

  static create(props: CreateBantQualificationProps): BantQualification {
    return new BantQualification(props)
  }
}
