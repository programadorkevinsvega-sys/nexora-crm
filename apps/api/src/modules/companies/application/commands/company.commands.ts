export class CreateCompanyCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly taxId?: string,
    readonly website?: string,
    readonly industry?: string,
    readonly numberOfEmployees?: number,
    readonly annualRevenue?: number,
    readonly description?: string,
    readonly parentCompanyId?: string,
  ) {}
}

export class UpdateCompanyCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
    readonly name?: string,
    readonly taxId?: string,
    readonly website?: string,
    readonly industry?: string,
    readonly numberOfEmployees?: number,
    readonly annualRevenue?: number,
    readonly description?: string,
    readonly parentCompanyId?: string,
  ) {}
}

export class DeleteCompanyCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}
