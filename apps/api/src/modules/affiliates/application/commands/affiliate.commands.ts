export class CreateProgramCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly commissionType: string,
    readonly commissionValue: number,
    readonly cookieDurationDays?: number,
    readonly isMultiLevel?: boolean,
    readonly maxMlmLevels?: number,
    readonly isActive?: boolean,
  ) {}
}

export class UpdateProgramCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly name?: string,
    readonly commissionType?: string,
    readonly commissionValue?: number,
    readonly cookieDurationDays?: number,
    readonly isMultiLevel?: boolean,
    readonly maxMlmLevels?: number,
    readonly isActive?: boolean,
  ) {}
}

export class RegisterAffiliateCommand {
  constructor(
    readonly tenantId: string,
    readonly programId: string,
    readonly customerId: string,
    readonly referralCode: string,
    readonly referralLink: string,
    readonly parentAffiliateId?: string,
    readonly mlmLevel?: number,
    readonly status?: string,
  ) {}
}

export class RecordCommissionCommand {
  constructor(
    readonly tenantId: string,
    readonly affiliateId: string,
    readonly sourceOrderId: string,
    readonly commissionAmount: number,
    readonly mlmLevelEarned?: number,
    readonly status?: string,
    readonly approvedAt?: Date,
  ) {}
}

export class ProcessPayoutCommand {
  constructor(
    readonly tenantId: string,
    readonly affiliateId: string,
    readonly amount: number,
    readonly paymentMethod?: string,
    readonly paymentReference?: string,
    readonly status?: string,
    readonly paidAt?: Date,
  ) {}
}
