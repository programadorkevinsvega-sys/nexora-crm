export class CreateTenantCommand {
  constructor(
    readonly ownerUserId: string,
    readonly industryType: string,
    readonly name: string,
    readonly legalName?: string, readonly taxId?: string,
    readonly taxRegime?: string, readonly legalAddress?: string, readonly city?: string,
    readonly postalCode?: string, readonly timezone?: string, readonly currencyCode?: string,
  ) {}
}

export class UpdateTenantCommand {
  constructor(
    readonly id: string,
    readonly name?: string, readonly legalName?: string | null,
    readonly taxId?: string | null, readonly taxRegime?: string | null,
    readonly legalAddress?: string | null, readonly city?: string | null,
    readonly postalCode?: string | null, readonly industryType?: string,
    readonly status?: string, readonly timezone?: string, readonly currencyCode?: string,
  ) {}
}

export class DeleteTenantCommand { constructor(readonly id: string) {} }

export class CreateBranchCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly code?: string, readonly address?: string,
    readonly city?: string, readonly country?: string,
    readonly isHeadquarters?: boolean,
  ) {}
}

export class UpdateBranchCommand {
  constructor(
    readonly tenantId: string, readonly id: string, readonly name?: string,
    readonly code?: string | null, readonly address?: string | null,
    readonly city?: string | null, readonly country?: string | null,
    readonly isActive?: boolean, readonly isHeadquarters?: boolean,
  ) {}
}

export class DeleteBranchCommand { constructor(readonly tenantId: string, readonly id: string) {} }

export class UpdateBrandingCommand {
  constructor(
    readonly tenantId: string, readonly logoUrl?: string, readonly faviconUrl?: string,
    readonly primaryColor?: string, readonly secondaryColor?: string,
    readonly customDomain?: string,
  ) {}
}

export class ToggleFeatureCommand {
  constructor(readonly tenantId: string, readonly featureCode: string, readonly isEnabled: boolean) {}
}

export class CreateDomainCommand {
  constructor(readonly tenantId: string, readonly domain: string, readonly isPrimary?: boolean) {}
}

export class DeleteDomainCommand { constructor(readonly tenantId: string, readonly id: string) {} }

export class SetPrimaryDomainCommand {
  constructor(readonly tenantId: string, readonly domainId: string) {}
}

export class UpsertMetricCommand {
  constructor(
    readonly tenantId: string, readonly metricName: string, readonly currentValue: number,
    readonly limitValue?: number, readonly periodStart?: string, readonly periodEnd?: string,
  ) {}
}

export class InstallModuleCommand {
  constructor(readonly tenantId: string, readonly moduleId: string) {}
}

export class UninstallModuleCommand {
  constructor(readonly tenantId: string, readonly moduleId: string) {}
}
