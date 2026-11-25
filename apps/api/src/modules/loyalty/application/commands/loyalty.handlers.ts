import { Injectable } from '@nestjs/common'
import { LoyaltyRepository, SegmentRepository } from '../../domain/repositories/loyalty.repository'
import { LoyaltyProfile } from '../../domain/entities/loyalty-profile.entity'
import { CustomerSegment } from '../../domain/entities/customer-segment.entity'
import { EarnPointsCommand, RedeemPointsCommand, CreateSegmentCommand, AssignToSegmentCommand } from './loyalty.commands'
import { PointsEarnedEvent, PointsRedeemedEvent, TierChangedEvent } from '../../domain/events/loyalty.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class EarnPointsHandler {
  constructor(
    private readonly repo: LoyaltyRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: EarnPointsCommand): Promise<{ id: string; newBalance: number }> {
    let profile = await this.repo.findProfileByContactId(command.tenantId, command.contactId)

    if (!profile) {
      profile = LoyaltyProfile.create({ tenantId: command.tenantId, contactId: command.contactId })
    }

    const previousTier = profile.tierLevel
    const updated = profile.earnPoints(command.points)

    await this.repo.updatePoints(updated)
    await this.outbox.publish(new PointsEarnedEvent(updated.id, updated.contactId, command.points, updated.loyaltyPointsBalance))

    if (previousTier !== updated.tierLevel) {
      await this.outbox.publish(new TierChangedEvent(updated.id, updated.contactId, previousTier, updated.tierLevel))
    }

    return { id: updated.id, newBalance: updated.loyaltyPointsBalance }
  }
}

@Injectable()
export class RedeemPointsHandler {
  constructor(
    private readonly repo: LoyaltyRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RedeemPointsCommand): Promise<{ id: string; newBalance: number }> {
    const profile = await this.repo.findProfileByContactId(command.tenantId, command.contactId)
    if (!profile) throw new NotFoundError('Loyalty Profile', command.contactId)

    const updated = profile.redeemPoints(command.points)

    await this.repo.updatePoints(updated)
    await this.outbox.publish(new PointsRedeemedEvent(updated.id, updated.contactId, command.points, updated.loyaltyPointsBalance))

    return { id: updated.id, newBalance: updated.loyaltyPointsBalance }
  }
}

@Injectable()
export class CreateSegmentHandler {
  constructor(
    private readonly repo: SegmentRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateSegmentCommand): Promise<{ id: string }> {
    const segment = CustomerSegment.create({
      tenantId: command.tenantId,
      name: command.name,
      description: command.description,
      isDynamic: command.isDynamic,
      rulesJson: command.rulesJson,
    })

    await this.repo.save(segment)

    return { id: segment.id }
  }
}

@Injectable()
export class AssignToSegmentHandler {
  constructor(
    private readonly repo: SegmentRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: AssignToSegmentCommand): Promise<void> {
    const segment = await this.repo.findById(command.tenantId, command.segmentId)
    if (!segment) throw new NotFoundError('Segment', command.segmentId)

    await this.repo.assignContact(command.tenantId, command.segmentId, command.contactId)
  }
}
