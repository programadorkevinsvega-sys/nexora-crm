import { Injectable } from '@nestjs/common'
import { AffiliateProgramRepository } from '../../domain/repositories/affiliate-program.repository'
import { AffiliateRepository } from '../../domain/repositories/affiliate.repository'
import { CommissionRepository } from '../../domain/repositories/commission.repository'
import { AffiliateProgram } from '../../domain/entities/affiliate-program.entity'
import { Affiliate } from '../../domain/entities/affiliate.entity'
import { AffiliateCommission } from '../../domain/entities/affiliate-commission.entity'
import { AffiliatePayout } from '../../domain/entities/affiliate-payout.entity'
import {
  CreateProgramCommand,
  UpdateProgramCommand,
  RegisterAffiliateCommand,
  RecordCommissionCommand,
  ProcessPayoutCommand,
} from './affiliate.commands'
import {
  AffiliateCreatedEvent,
  CommissionEarnedEvent,
  PayoutProcessedEvent,
} from '../../domain/events/affiliate.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError, ConflictError } from '@crm/shared'

@Injectable()
export class CreateProgramHandler {
  constructor(
    private readonly repo: AffiliateProgramRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateProgramCommand): Promise<{ id: string }> {
    const program = AffiliateProgram.create({
      tenantId: command.tenantId,
      name: command.name,
      commissionType: command.commissionType,
      commissionValue: command.commissionValue,
      cookieDurationDays: command.cookieDurationDays,
      isMultiLevel: command.isMultiLevel,
      maxMlmLevels: command.maxMlmLevels,
      isActive: command.isActive,
    })

    await this.repo.save(program)

    return { id: program.id }
  }
}

@Injectable()
export class UpdateProgramHandler {
  constructor(
    private readonly repo: AffiliateProgramRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateProgramCommand): Promise<void> {
    const program = await this.repo.findById(command.tenantId, command.id)
    if (!program) throw new NotFoundError('Affiliate Program', command.id)

    const updated = program.update(command)
    await this.repo.save(updated)
  }
}

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
    await this.outbox.publish(new AffiliateCreatedEvent(affiliate.id, affiliate.programId, affiliate.customerId, affiliate.referralCode))

    return { id: affiliate.id }
  }
}

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
    await this.outbox.publish(new CommissionEarnedEvent(commission.id, commission.affiliateId, commission.sourceOrderId, commission.commissionAmount, commission.mlmLevelEarned ?? 0))

    return { id: commission.id }
  }
}

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
    await this.outbox.publish(new PayoutProcessedEvent(payout.id, payout.affiliateId, payout.amount, payout.paymentMethod, payout.status ?? 'PROCESSING'))

    return { id: payout.id }
  }
}
