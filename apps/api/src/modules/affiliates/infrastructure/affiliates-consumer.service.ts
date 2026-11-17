import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { NatsConsumerService, DomainEventEnvelope } from '../../../common/nats/nats-consumer.service'
import { RecordCommissionHandler } from '../application/commands/record-commission.handler'
import { RecordCommissionCommand } from '../application/commands/affiliate.commands'

@Injectable()
export class AffiliatesConsumerService implements OnModuleInit {
  private readonly logger = new Logger(AffiliatesConsumerService.name)

  constructor(
    private readonly natsConsumer: NatsConsumerService,
    private readonly recordCommissionHandler: RecordCommissionHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    const queueGroup = 'affiliates-deal-commission-engine'

    await this.natsConsumer.subscribe(
      'crm.deal.won',
      queueGroup,
      this.handleDealWonCommission.bind(this),
    )

    await this.natsConsumer.subscribe(
      'crm.deals.won',
      queueGroup,
      this.handleDealWonCommission.bind(this),
    )

    this.logger.log('AffiliatesConsumerService subscribed to deal won events for commission calculation')
  }

  private async handleDealWonCommission(
    envelope: DomainEventEnvelope<Record<string, unknown>>,
  ): Promise<void> {
    const p = envelope.payload || {}
    const dealId = String(p.dealId || p.id || envelope.aggregateId || '')
    const tenantId = String(p.tenantId || '00000000-0000-0000-0000-000000000001')
    const affiliateId = String(p.affiliateId || p.affiliateCode || '')
    const amount = Number(p.amount || 0)

    if (!dealId || !affiliateId || amount <= 0) return

    try {
      this.logger.log(`Recording affiliate commission for affiliate ${affiliateId} on won deal ${dealId}`)
      // Standard 10% commission calculation for direct referral
      const commissionAmount = Math.round(amount * 0.1)

      await this.recordCommissionHandler.execute(
        new RecordCommissionCommand(
          tenantId,
          affiliateId,
          dealId,
          commissionAmount,
          1,
          'APPROVED',
          new Date(),
        ),
      )
    } catch (error) {
      this.logger.error(`Failed to record commission for deal ${dealId}: ${error}`)
    }
  }
}
