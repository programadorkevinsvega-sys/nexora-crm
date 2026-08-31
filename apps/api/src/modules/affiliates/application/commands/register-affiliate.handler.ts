import { Injectable } from '@nestjs/common'
import { AffiliateRepository } from '../../domain/repositories/affiliate.repository'
import { Affiliate } from '../../domain/entities/affiliate.entity'
import { RegisterAffiliateCommand } from './affiliate.commands'
import { AffiliateCreatedEvent } from '../../domain/events/affiliate.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class RegisterAffiliateHandler {
  constructor(
    private readonly repo: AffiliateRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RegisterAffiliateCommand): Promise<{ id: string }> {
    const affiliate = Affiliate.create({
      tenantId: command.tenantId,
      programId: command.programId,
      customerId: command.customerId,
      referralCode: command.referralCode,
      referralLink: command.referralLink,
      parentAffiliateId: command.parentAffiliateId,
      mlmLevel: command.mlmLevel,
      status: command.status,
    })

    await this.repo.save(affiliate)
    await this.outbox.publish(
      new AffiliateCreatedEvent(
        affiliate.id,
        affiliate.programId,
        affiliate.customerId,
        affiliate.referralCode,
      ),
    )

    return { id: affiliate.id }
  }
}
