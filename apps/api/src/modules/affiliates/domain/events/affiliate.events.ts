import { DomainEvent } from '@crm/shared'

export class AffiliateCreatedEvent extends DomainEvent {
  readonly aggregateType = 'affiliate'
  readonly eventName = 'affiliate.created'

  constructor(
    readonly aggregateId: string,
    readonly programId: string,
    readonly customerId: string,
    readonly referralCode: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      affiliateId: this.aggregateId,
      programId: this.programId,
      customerId: this.customerId,
      referralCode: this.referralCode,
    }
  }
}

export class CommissionEarnedEvent extends DomainEvent {
  readonly aggregateType = 'affiliate_commission'
  readonly eventName = 'affiliate.commission.earned'

  constructor(
    readonly aggregateId: string,
    readonly affiliateId: string,
    readonly sourceOrderId: string,
    readonly commissionAmount: number,
    readonly mlmLevelEarned: number,
  ) {
    super()
  }

  toPrimitives() {
    return {
      commissionId: this.aggregateId,
      affiliateId: this.affiliateId,
      sourceOrderId: this.sourceOrderId,
      commissionAmount: this.commissionAmount,
      mlmLevelEarned: this.mlmLevelEarned,
    }
  }
}

export class PayoutProcessedEvent extends DomainEvent {
  readonly aggregateType = 'affiliate_payout'
  readonly eventName = 'affiliate.payout.processed'

  constructor(
    readonly aggregateId: string,
    readonly affiliateId: string,
    readonly amount: number,
    readonly paymentMethod: string | null,
    readonly status: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      payoutId: this.aggregateId,
      affiliateId: this.affiliateId,
      amount: this.amount,
      paymentMethod: this.paymentMethod,
      status: this.status,
    }
  }
}

export class ReferralUsedEvent extends DomainEvent {
  readonly aggregateType = 'affiliate'
  readonly eventName = 'affiliate.referral.used'

  constructor(
    readonly aggregateId: string,
    readonly referralCode: string,
    readonly referredCustomerId: string,
    readonly sourceOrderId: string,
  ) {
    super()
  }

  toPrimitives() {
    return {
      affiliateId: this.aggregateId,
      referralCode: this.referralCode,
      referredCustomerId: this.referredCustomerId,
      sourceOrderId: this.sourceOrderId,
    }
  }
}
