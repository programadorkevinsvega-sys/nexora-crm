import { ScoringRuleCategory, ScoringCondition } from '@crm/contracts'

export class LeadScoringRule {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly description: string | null,
    readonly category: ScoringRuleCategory,
    readonly condition: ScoringCondition,
    readonly points: number,
    readonly decayDays: number | null,
    readonly decayPoints: number | null,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    name: string
    description?: string | null
    category: ScoringRuleCategory
    condition: ScoringCondition
    points: number
    decayDays?: number | null
    decayPoints?: number | null
    isActive?: boolean
  }): LeadScoringRule {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Rule name is required')
    }
    if (!props.condition || !props.condition.field) {
      throw new Error('Rule condition field is required')
    }

    return new LeadScoringRule(
      crypto.randomUUID(),
      props.tenantId,
      props.name.trim(),
      props.description ?? null,
      props.category,
      props.condition,
      props.points,
      props.decayDays ?? null,
      props.decayPoints ?? null,
      props.isActive ?? true,
      new Date(),
      new Date(),
    )
  }

  toggleActive(): LeadScoringRule {
    return new LeadScoringRule(
      this.id,
      this.tenantId,
      this.name,
      this.description,
      this.category,
      this.condition,
      this.points,
      this.decayDays,
      this.decayPoints,
      !this.isActive,
      this.createdAt,
      new Date(),
    )
  }
}
