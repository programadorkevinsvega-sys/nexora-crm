export class ListTenantsQuery {
  constructor(readonly search?: string, readonly status?: string, readonly cursor?: string, readonly limit?: number) {}
}
export class GetBrandingQuery { constructor(readonly tenantId: string) {} }
export class ListBranchesQuery { constructor(readonly tenantId: string) {} }
export class ListFeaturesQuery { constructor(readonly tenantId: string) {} }
export class ListDomainsQuery { constructor(readonly tenantId: string) {} }
export class ListMetricsQuery { constructor(readonly tenantId: string) {} }
export class ListSystemModulesQuery { constructor(readonly category?: string) {} }
export class ListInstalledModulesQuery { constructor(readonly tenantId: string) {} }
