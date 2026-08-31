export class MetaLeadLog {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly metaIntegrationId: string | null,
    readonly leadgenId: string,
    readonly formId: string | null,
    readonly formName: string | null,
    readonly adId: string | null,
    readonly adName: string | null,
    readonly campaignName: string | null,
    readonly contactId: string | null,
    readonly dealId: string | null,
    readonly leadData: Record<string, any>,
    readonly status: string,
    readonly errorMessage: string | null,
    readonly receivedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    metaIntegrationId?: string | null
    leadgenId: string
    formId?: string | null
    formName?: string | null
    adId?: string | null
    adName?: string | null
    campaignName?: string | null
    contactId?: string | null
    dealId?: string | null
    leadData?: Record<string, any>
    status?: string
    errorMessage?: string | null
  }): MetaLeadLog {
    return new MetaLeadLog(
      crypto.randomUUID(),
      props.tenantId,
      props.metaIntegrationId || null,
      props.leadgenId,
      props.formId || null,
      props.formName || null,
      props.adId || null,
      props.adName || null,
      props.campaignName || null,
      props.contactId || null,
      props.dealId || null,
      props.leadData || {},
      props.status || 'PROCESSED',
      props.errorMessage || null,
      new Date(),
    )
  }
}
