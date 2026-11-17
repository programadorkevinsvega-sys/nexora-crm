import { Injectable } from '@nestjs/common'
import { CampaignRepository } from '../../domain/repositories/campaign.repository'
import { Campaign } from '../../domain/entities/campaign.entity'
import { CampaignMember } from '../../domain/entities/campaign-member.entity'
import {
  CreateCampaignCommand,
  UpdateCampaignCommand,
  ChangeCampaignStatusCommand,
  AddMemberCommand,
  UpdateMemberStatusCommand,
  DeleteCampaignCommand,
} from './campaign.commands'
import {
  CampaignCreatedEvent,
  CampaignUpdatedEvent,
  CampaignStatusChangedEvent,
  CampaignMemberAddedEvent,
  CampaignMemberStatusChangedEvent,
} from '../../domain/events/campaign.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError, ConflictError } from '@crm/shared'

@Injectable()
export class CreateCampaignHandler {
  constructor(
    private readonly repo: CampaignRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateCampaignCommand): Promise<{ id: string }> {
    const campaign = Campaign.create({
      tenantId: command.tenantId,
      name: command.name,
      type: command.type,
      status: command.status,
      startDate: command.startDate,
      endDate: command.endDate,
      budgetedCost: command.budgetedCost,
      actualCost: command.actualCost,
      expectedRevenue: command.expectedRevenue,
    })

    await this.repo.save(campaign)
    await this.outbox.publish(new CampaignCreatedEvent(campaign.id, campaign.name))

    return { id: campaign.id }
  }
}

@Injectable()
export class UpdateCampaignHandler {
  constructor(
    private readonly repo: CampaignRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateCampaignCommand): Promise<void> {
    const campaign = await this.repo.findById(command.tenantId, command.id)
    if (!campaign) throw new NotFoundError('Campaign', command.id)

    const updated = campaign.update(command)
    await this.repo.save(updated)
    await this.outbox.publish(new CampaignUpdatedEvent(updated.id, updated.name))
  }
}

@Injectable()
export class ChangeCampaignStatusHandler {
  constructor(
    private readonly repo: CampaignRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: ChangeCampaignStatusCommand): Promise<void> {
    const campaign = await this.repo.findById(command.tenantId, command.id)
    if (!campaign) throw new NotFoundError('Campaign', command.id)

    const previousStatus = campaign.status
    const updated = campaign.update({ status: command.status })
    await this.repo.save(updated)
    await this.outbox.publish(new CampaignStatusChangedEvent(updated.id, previousStatus, command.status))
  }
}

@Injectable()
export class AddMemberHandler {
  constructor(
    private readonly repo: CampaignRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: AddMemberCommand): Promise<{ id: string }> {
    const campaign = await this.repo.findById(command.tenantId, command.campaignId)
    if (!campaign) throw new NotFoundError('Campaign', command.campaignId)

    const member = CampaignMember.create({
      tenantId: command.tenantId,
      campaignId: command.campaignId,
      contactId: command.contactId,
    })

    await this.repo.saveMember(member)
    await this.outbox.publish(new CampaignMemberAddedEvent(member.campaignId, member.id, member.contactId))

    return { id: member.id }
  }
}

@Injectable()
export class UpdateMemberStatusHandler {
  constructor(
    private readonly repo: CampaignRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateMemberStatusCommand): Promise<void> {
    const member = await this.repo.findMemberById(command.tenantId, command.id)
    if (!member) throw new NotFoundError('Campaign Member', command.id)

    const previousStatus = member.status
    const respondedAt = command.status === 'RESPONDED' ? new Date() : null
    await this.repo.updateMemberStatus(command.tenantId, command.id, command.status, respondedAt)
    await this.outbox.publish(
      new CampaignMemberStatusChangedEvent(member.campaignId, member.id, previousStatus, command.status),
    )
  }
}

@Injectable()
export class DeleteCampaignHandler {
  constructor(
    private readonly repo: CampaignRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: DeleteCampaignCommand): Promise<void> {
    await this.repo.delete(command.tenantId, command.id)
  }
}
