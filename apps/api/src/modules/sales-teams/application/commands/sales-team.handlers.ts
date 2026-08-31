import { Injectable } from '@nestjs/common'
import { SalesTeamRepository } from '../../domain/repositories/sales-team.repository'
import { SalesQuotaRepository } from '../../domain/repositories/sales-quota.repository'
import { SalesTeam } from '../../domain/entities/sales-team.entity'
import { SalesQuota } from '../../domain/entities/sales-quota.entity'
import {
  CreateTeamCommand, UpdateTeamCommand, DeleteTeamCommand,
  AddMemberCommand, RemoveMemberCommand,
  SetQuotaCommand, UpdateAchievedCommand,
} from './sales-team.commands'
import {
  SalesTeamCreatedEvent, SalesTeamUpdatedEvent, SalesTeamDeletedEvent,
  TeamMemberAddedEvent, TeamMemberRemovedEvent,
  QuotaAssignedEvent, QuotaAchievedUpdatedEvent,
} from '../../domain/events/sales-team.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError, ConflictError } from '@crm/shared'

@Injectable()
export class CreateTeamHandler {
  constructor(
    private readonly repo: SalesTeamRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateTeamCommand): Promise<{ id: string }> {
    const team = SalesTeam.create({
      tenantId: command.tenantId,
      name: command.name,
      managerUserId: command.managerUserId,
      monthlyTarget: command.monthlyTarget,
    })

    await this.repo.save(team)
    await this.outbox.publish(
      new SalesTeamCreatedEvent(team.id, team.name, team.managerUserId, team.monthlyTarget),
    )

    return { id: team.id }
  }
}

@Injectable()
export class UpdateTeamHandler {
  constructor(
    private readonly repo: SalesTeamRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateTeamCommand): Promise<void> {
    const team = await this.repo.findById(command.tenantId, command.id)
    if (!team) throw new NotFoundError('Sales Team', command.id)

    const updated = team.update(command)
    await this.repo.save(updated)
    await this.outbox.publish(new SalesTeamUpdatedEvent(updated.id, updated.name))
  }
}

@Injectable()
export class DeleteTeamHandler {
  constructor(
    private readonly repo: SalesTeamRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: DeleteTeamCommand): Promise<void> {
    await this.repo.delete(command.tenantId, command.id)
    await this.outbox.publish(new SalesTeamDeletedEvent(command.id))
  }
}

@Injectable()
export class AddMemberHandler {
  constructor(
    private readonly repo: SalesTeamRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: AddMemberCommand): Promise<void> {
    const team = await this.repo.findById(command.tenantId, command.teamId)
    if (!team) throw new NotFoundError('Sales Team', command.teamId)

    await this.repo.addMember(command.teamId, command.userId, command.tenantId)
    await this.outbox.publish(new TeamMemberAddedEvent(command.teamId, command.userId))
  }
}

@Injectable()
export class RemoveMemberHandler {
  constructor(
    private readonly repo: SalesTeamRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RemoveMemberCommand): Promise<void> {
    const team = await this.repo.findById(command.tenantId, command.teamId)
    if (!team) throw new NotFoundError('Sales Team', command.teamId)

    await this.repo.removeMember(command.teamId, command.userId)
    await this.outbox.publish(new TeamMemberRemovedEvent(command.teamId, command.userId))
  }
}

@Injectable()
export class SetQuotaHandler {
  constructor(
    private readonly quotaRepo: SalesQuotaRepository,
    private readonly teamRepo: SalesTeamRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: SetQuotaCommand): Promise<{ id: string }> {
    const team = await this.teamRepo.findById(command.tenantId, command.teamId)
    if (!team) throw new NotFoundError('Sales Team', command.teamId)

    const quota = SalesQuota.create({
      tenantId: command.tenantId,
      userId: command.userId,
      teamId: command.teamId,
      periodMonth: command.periodMonth,
      periodYear: command.periodYear,
      targetAmount: command.targetAmount,
    })

    await this.quotaRepo.save(quota)
    await this.outbox.publish(
      new QuotaAssignedEvent(quota.id, quota.userId, quota.teamId, quota.periodMonth, quota.periodYear, quota.targetAmount),
    )

    return { id: quota.id }
  }
}

@Injectable()
export class UpdateAchievedHandler {
  constructor(
    private readonly quotaRepo: SalesQuotaRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateAchievedCommand): Promise<void> {
    const quota = await this.quotaRepo.findById(command.tenantId, command.quotaId)
    if (!quota) throw new NotFoundError('Sales Quota', command.quotaId)

    const updated = quota.updateAchieved(command.achievedAmount)
    await this.quotaRepo.save(updated)
    await this.outbox.publish(new QuotaAchievedUpdatedEvent(updated.id, updated.achievedAmount))
  }
}
