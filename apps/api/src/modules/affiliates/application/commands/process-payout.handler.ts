import { Injectable } from '@nestjs/common'
import { CommissionRepository } from '../../domain/repositories/commission.repository'
import { AffiliatePayout } from '../../domain/entities/affiliate-payout.entity'
import { ProcessPayoutCommand } from './affiliate.commands'
import { PayoutProcessedEvent } from '../../domain/events/affiliate.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class ProcessPayoutHandler {
  constructor(
    private readonly repo: CommissionRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: ProcessPayoutCommand): Promise<{ id: string }> {
    const payout = AffiliatePayout.create({
      tenantId: command.tenantId,
      affiliateId: command.affiliateId,
      amount: command.amount,
      paymentMethod: command.paymentMethod,
      paymentReference: command.paymentReference,
      status: command.status,
      paidAt: command.paidAt,
    })

    await this.repo.savePayout(payout)
    await this.outbox.publish(
      new PayoutProcessedEvent(
        payout.id,
        payout.affiliateId,
        payout.amount,
        payout.paymentMethod,
        payout.status ?? 'PROCESSING',
      ),
    )

    return { id: payout.id }
  }
}
