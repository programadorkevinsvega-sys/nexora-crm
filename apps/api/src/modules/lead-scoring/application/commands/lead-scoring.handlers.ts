import { Injectable, Logger } from '@nestjs/common'
import {
  CreateScoringRuleCommand,
  ToggleRuleStatusCommand,
  RecalculateLeadScoreCommand,
  AdjustLeadScoreCommand,
  ApplyScoreDecayCommand,
} from './lead-scoring.commands'
import {
  LeadScoringRuleRepository,
  LeadScoreRepository,
} from '../../domain/repositories/lead-scoring.repository'
import { LeadScoringRule } from '../../domain/entities/lead-scoring-rule.entity'
import { LeadScore } from '../../domain/entities/lead-score.entity'
import { LeadScoreCalculatorService } from '../../domain/services/lead-score-calculator.service'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import {
  LeadScoreUpdatedEvent,
  LeadTemperatureChangedEvent,
  LeadScoreThresholdReachedEvent,
} from '../../domain/events/lead-scoring.events'
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

@Injectable()
export class RecalculateLeadScoreHandler {
  private readonly logger = new Logger(RecalculateLeadScoreHandler.name)

  constructor(
    private readonly ruleRepo: LeadScoringRuleRepository,
    private readonly scoreRepo: LeadScoreRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RecalculateLeadScoreCommand): Promise<LeadScore> {
    const activeRules = await this.ruleRepo.listActive(command.tenantId)
    const calculation = LeadScoreCalculatorService.calculateScore(
      activeRules,
      command.contactContext,
    )

    let currentScore = await this.scoreRepo.findByContactId(
      command.tenantId,
      command.contactId,
    )
    if (!currentScore) {
      currentScore = LeadScore.create(command.tenantId, command.contactId, 0)
    }

    const previousTemp = currentScore.temperature
    const delta = calculation.totalPoints - currentScore.score
    const { updated, temperatureChanged } = currentScore.applyPoints(
      delta,
      `Recalculated with ${calculation.appliedRules.length} active rules matched`,
    )

    await this.scoreRepo.save(updated)
    await this.outbox.publish(
      new LeadScoreUpdatedEvent(
        updated.id,
        updated.contactId,
        updated.score,
        updated.temperature,
      ),
    )

    if (temperatureChanged) {
      await this.outbox.publish(
        new LeadTemperatureChangedEvent(
          updated.id,
          updated.contactId,
          previousTemp,
          updated.temperature,
          updated.score,
        ),
      )
    }

    if (updated.score >= 80 && currentScore.score < 80) {
      await this.outbox.publish(
        new LeadScoreThresholdReachedEvent(
          updated.id,
          updated.contactId,
          updated.score,
          80,
        ),
      )
    }

    return updated
  }
}

@Injectable()
export class AdjustLeadScoreHandler {
  constructor(
    private readonly scoreRepo: LeadScoreRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: AdjustLeadScoreCommand): Promise<LeadScore> {
    let currentScore = await this.scoreRepo.findByContactId(
      command.tenantId,
      command.contactId,
    )
    if (!currentScore) {
      currentScore = LeadScore.create(command.tenantId, command.contactId, 0)
    }

    const { updated, temperatureChanged, previousTemperature } = currentScore.applyPoints(
      command.points,
      command.reason,
      command.ruleId,
    )

    await this.scoreRepo.save(updated)
    await this.outbox.publish(
      new LeadScoreUpdatedEvent(
        updated.id,
        updated.contactId,
        updated.score,
        updated.temperature,
      ),
    )

    if (temperatureChanged) {
      await this.outbox.publish(
        new LeadTemperatureChangedEvent(
          updated.id,
          updated.contactId,
          previousTemperature,
          updated.temperature,
          updated.score,
        ),
      )
    }

    return updated
  }
}

@Injectable()
export class ApplyScoreDecayHandler {
  constructor(
    private readonly scoreRepo: LeadScoreRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: ApplyScoreDecayCommand): Promise<LeadScore> {
    const currentScore = await this.scoreRepo.findByContactId(
      command.tenantId,
      command.contactId,
    )
    if (!currentScore) throw new NotFoundError('LeadScore', command.contactId)

    const previousTemp = currentScore.temperature
    const { updated, temperatureChanged, pointsDecayed } = currentScore.applyDecay(
      command.daysWithoutActivity,
    )

    if (pointsDecayed > 0) {
      await this.scoreRepo.save(updated)
      await this.outbox.publish(
        new LeadScoreUpdatedEvent(
          updated.id,
          updated.contactId,
          updated.score,
          updated.temperature,
        ),
      )

      if (temperatureChanged) {
        await this.outbox.publish(
          new LeadTemperatureChangedEvent(
            updated.id,
            updated.contactId,
            previousTemp,
            updated.temperature,
            updated.score,
          ),
        )
      }
    }

    return updated
  }
}
