export class TenantBranding {
  constructor(
    readonly tenantId: string,
    readonly logoUrl: string | null,
    readonly faviconUrl: string | null,
    readonly primaryColor: string,
    readonly secondaryColor: string,
    readonly customDomain: string | null,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    logoUrl?: string
    faviconUrl?: string
    primaryColor?: string
    secondaryColor?: string
    customDomain?: string
  }): TenantBranding {
    return new TenantBranding(
      props.tenantId,
      props.logoUrl ?? null,
      props.faviconUrl ?? null,
      props.primaryColor ?? '#3B82F6',
      props.secondaryColor ?? '#1E293B',
      props.customDomain ?? null,
      new Date(),
    )
  }
}
