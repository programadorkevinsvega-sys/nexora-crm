import { ContractStatus } from '../../domain/entities/contract.entity'

export class CreateContractCommand {
  constructor(
    readonly tenantId: string,
    readonly companyId: string,
    readonly dealId: string | undefined,
    readonly name: string,
    readonly startDate: string,
    readonly endDate: string | undefined,
    readonly autoRenew: boolean | undefined,
    readonly mrrValue: number | undefined,
    readonly ownerUserId: string,
  ) {}
}

export class UpdateContractCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly name?: string,
    readonly startDate?: string,
    readonly endDate?: string,
    readonly autoRenew?: boolean,
    readonly mrrValue?: number,
    readonly status?: ContractStatus,
    readonly ownerUserId?: string,
  ) {}
}

export class RenewContractCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class UpdateContractStatusCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly status: string,
  ) {}
}
