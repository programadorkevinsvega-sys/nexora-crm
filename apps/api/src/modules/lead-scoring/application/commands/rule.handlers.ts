import { Injectable } from '@nestjs/common'
import {
  CreateScoringRuleCommand,
  ToggleRuleStatusCommand,
} from './lead-scoring.commands'
import { LeadScoringRuleRepository } from '../../domain/repositories/lead-scoring.repository'
import { LeadScoringRule } from '../../domain/entities/lead-scoring-rule.entity'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class CreateScoringRuleHandler {
  constructor(private readonly repo: LeadScoringRuleRepository) {}

  async execute(command: CreateScoringRuleCommand): Promise<{ id: string }> {
    const rule = LeadScoringRule.create({
      tenantId: command.tenantId,
      name: command.name,
      description: command.description,
      category: command.category,
      condition: command.condition,
      points: command.points,
      decayDays: command.decayDays,
      decayPoints: command.decayPoints,
    })
    await this.repo.save(rule)
    return { id: rule.id }
  }
}

@Injectable()
export class ToggleRuleStatusHandler {
  constructor(private readonly repo: LeadScoringRuleRepository) {}

  async execute(command: ToggleRuleStatusCommand): Promise<LeadScoringRule> {
    const rule = await this.repo.findById(command.tenantId, command.ruleId)
    if (!rule) throw new NotFoundError('LeadScoringRule', command.ruleId)
    const toggled = rule.toggleActive()
    await this.repo.save(toggled)
    return toggled
  }
}
