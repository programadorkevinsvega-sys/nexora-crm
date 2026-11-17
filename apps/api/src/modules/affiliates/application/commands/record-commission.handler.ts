import { Injectable } from '@nestjs/common'
import { CommissionRepository } from '../../domain/repositories/commission.repository'
import { AffiliateCommission } from '../../domain/entities/affiliate-commission.entity'
import { RecordCommissionCommand } from './affiliate.commands'
import { CommissionEarnedEvent } from '../../domain/events/affiliate.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class RecordCommissionHandler {
  constructor(
    private readonly repo: CommissionRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RecordCommissionCommand): Promise<{ id: string }> {
    const commission = AffiliateCommission.create({
      tenantId: command.tenantId,
      affiliateId: command.affiliateId,
      sourceOrderId: command.sourceOrderId,
      commissionAmount: command.commissionAmount,
      mlmLevelEarned: command.mlmLevelEarned,
      status: command.status,
      approvedAt: command.approvedAt,
    })

    await this.repo.saveCommission(commission)
    await this.outbox.publish(
      new CommissionEarnedEvent(
        commission.id,
        commission.affiliateId,
        commission.sourceOrderId,
        commission.commissionAmount,
        commission.mlmLevelEarned ?? 0,
      ),
    )

    return { id: commission.id }
  }
}
