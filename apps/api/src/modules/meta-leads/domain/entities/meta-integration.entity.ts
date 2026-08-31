export interface MetaLeadForm {
  formId: string
  formName: string
  status: string
  leadsCount: number
  defaultLeadStatus: string
}

export class MetaIntegration {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly status: string,
    readonly metaAppId: string | null,
    readonly metaUserId: string | null,
    readonly metaUserName: string | null,
    readonly accessToken: string | null,
    readonly tokenExpiresAt: Date | null,
    readonly selectedPageId: string | null,
    readonly selectedPageName: string | null,
    readonly pageAccessToken: string | null,
    readonly adAccountId: string | null,
    readonly adAccountName: string | null,
    readonly webhookSecret: string,
    readonly leadGenForms: MetaLeadForm[],
    readonly autoCreateDeal: boolean,
    readonly targetPipelineId: string | null,
    readonly targetStageId: string | null,
    readonly lastSyncAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    metaAppId?: string | null
    webhookSecret?: string
  }): MetaIntegration {
    const now = new Date()
    return new MetaIntegration(
      crypto.randomUUID(),
      props.tenantId,
      'DISCONNECTED',
      props.metaAppId || null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      props.webhookSecret || `fb_verify_${crypto.randomUUID().slice(0, 8)}`,
      [],
      true,
      null,
      null,
      null,
      now,
      now,
    )
  }
}
