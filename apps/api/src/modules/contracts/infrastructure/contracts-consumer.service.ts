import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { NatsConsumerService, DomainEventEnvelope } from '../../../common/nats/nats-consumer.service'
import { CreateContractHandler } from '../application/commands/contract.handlers'
import { CreateContractCommand } from '../application/commands/contract.commands'

@Injectable()
export class ContractsConsumerService implements OnModuleInit {
  private readonly logger = new Logger(ContractsConsumerService.name)

  constructor(
    private readonly natsConsumer: NatsConsumerService,
    private readonly createContractHandler: CreateContractHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    const queueGroup = 'contracts-deal-won-engine'

    await this.natsConsumer.subscribe(
      'crm.deal.won',
      queueGroup,
      this.handleDealWonEvent.bind(this),
    )

    await this.natsConsumer.subscribe(
      'crm.deals.won',
      queueGroup,
      this.handleDealWonEvent.bind(this),
    )

    this.logger.log('ContractsConsumerService subscribed to deal won events')
  }

  private async handleDealWonEvent(
    envelope: DomainEventEnvelope<Record<string, unknown>>,
  ): Promise<void> {
    const p = envelope.payload || {}
    const dealId = String(p.dealId || p.id || envelope.aggregateId || '')
    const tenantId = String(p.tenantId || '00000000-0000-0000-0000-000000000001')
    const companyId = String(p.companyId || '00000000-0000-0000-0000-000000000001')
    const dealName = String(p.name || `Contrato Comercial - Trato #${dealId.slice(0, 8)}`)
    const amount = Number(p.amount || 0)

    if (!dealId) return

    try {
      this.logger.log(`Auto-generating contract draft for won deal ${dealId} (tenant ${tenantId})`)
      const today = new Date().toISOString().split('T')[0]
      const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      await this.createContractHandler.execute(
        new CreateContractCommand(
          tenantId,
          companyId,
          dealId,
          `Contrato: ${dealName}`,
          today,
          nextYear,
          true,
          amount > 0 ? Math.round(amount / 12) : 0,
          '00000000-0000-0000-0000-000000000001',
        ),
      )
    } catch (error) {
      this.logger.error(`Failed to auto-create contract for deal ${dealId}: ${error}`)
    }
  }
}
