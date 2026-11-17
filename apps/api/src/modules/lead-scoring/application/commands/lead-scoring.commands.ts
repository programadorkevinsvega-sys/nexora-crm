import { ScoringRuleCategory, ScoringCondition } from '@crm/contracts'

export class CreateScoringRuleCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly category: ScoringRuleCategory,
    readonly condition: ScoringCondition,
    readonly points: number,
    readonly description?: string,
    readonly decayDays?: number,
    readonly decayPoints?: number,
  ) {}
}

export class ToggleRuleStatusCommand {
  constructor(readonly tenantId: string, readonly ruleId: string) {}
}

export class RecalculateLeadScoreCommand {
  constructor(
    readonly tenantId: string,
    readonly contactId: string,
    readonly contactContext: Record<string, unknown>,
  ) {}
}

export class AdjustLeadScoreCommand {
  constructor(
    readonly tenantId: string,
    readonly contactId: string,
    readonly points: number,
    readonly reason: string,
    readonly ruleId?: string,
  ) {}
}

export class ApplyScoreDecayCommand {
  constructor(
    readonly tenantId: string,
    readonly contactId: string,
    readonly daysWithoutActivity: number,
  ) {}
}
