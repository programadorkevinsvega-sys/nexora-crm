export class SocialAutoResponderRule {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly platform: string,
    readonly triggerKeywords: string[],
    readonly responseMode: string,
    readonly staticReplies: string[],
    readonly aiPrompt: string | undefined,
    readonly sendPrivateDm: boolean,
    readonly autoCreateLead: boolean,
    readonly pipelineId: string | undefined,
    readonly stageId: string | undefined,
    readonly isEnabled: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    name: string
    platform?: string
    triggerKeywords?: string[]
    responseMode?: string
    staticReplies?: string[]
    aiPrompt?: string
    sendPrivateDm?: boolean
    autoCreateLead?: boolean
    pipelineId?: string
    stageId?: string
    isEnabled?: boolean
  }): SocialAutoResponderRule {
    const now = new Date()
    return new SocialAutoResponderRule(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      props.platform || 'ALL',
      props.triggerKeywords || [],
      props.responseMode || 'STATIC_TEMPLATE',
      props.staticReplies || [],
      props.aiPrompt,
      props.sendPrivateDm || false,
      props.autoCreateLead || false,
      props.pipelineId,
      props.stageId,
      props.isEnabled !== undefined ? props.isEnabled : true,
      now,
      now
    )
  }

  update(props: Partial<{
    name: string
    platform: string
    triggerKeywords: string[]
    responseMode: string
    staticReplies: string[]
    aiPrompt: string | null
    sendPrivateDm: boolean
    autoCreateLead: boolean
    pipelineId: string | null
    stageId: string | null
    isEnabled: boolean
  }>): SocialAutoResponderRule {
    return new SocialAutoResponderRule(
      this.id,
      this.tenantId,
      props.name ?? this.name,
      props.platform ?? this.platform,
      props.triggerKeywords ?? this.triggerKeywords,
      props.responseMode ?? this.responseMode,
      props.staticReplies ?? this.staticReplies,
      props.aiPrompt !== undefined ? (props.aiPrompt || undefined) : this.aiPrompt,
      props.sendPrivateDm ?? this.sendPrivateDm,
      props.autoCreateLead ?? this.autoCreateLead,
      props.pipelineId !== undefined ? (props.pipelineId || undefined) : this.pipelineId,
      props.stageId !== undefined ? (props.stageId || undefined) : this.stageId,
      props.isEnabled ?? this.isEnabled,
      this.createdAt,
      new Date()
    )
  }
}
