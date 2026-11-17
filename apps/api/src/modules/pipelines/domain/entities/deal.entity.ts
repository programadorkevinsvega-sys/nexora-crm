export type DealStatus = 'OPEN' | 'WON' | 'LOST'

export class Deal {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly pipelineId: string,
    readonly stageId: string,
    readonly contactId: string | null,
    readonly companyId: string | null,
    readonly name: string,
    readonly amount: number,
    readonly expectedCloseDate: string | null,
    readonly status: DealStatus,
    readonly assignedUserId: string | null,
    readonly lostReasonId: string | null,
    readonly lostNotes: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    pipelineId: string
    stageId: string
    contactId?: string
    companyId?: string
    name: string
    amount?: number
    expectedCloseDate?: string
    assignedUserId?: string
  }): Deal {
    return new Deal(
      crypto.randomUUID(),
      props.tenantId,
      props.pipelineId,
      props.stageId,
      props.contactId ?? null,
      props.companyId ?? null,
      props.name,
      props.amount ?? 0,
      props.expectedCloseDate ?? null,
      'OPEN',
      props.assignedUserId ?? null,
      null,
      null,
      new Date(),
      new Date(),
    )
  }

  update(props: Partial<Omit<Deal, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'status' | 'lostReasonId' | 'lostNotes'>>): Deal {
    return new Deal(
      this.id,
      this.tenantId,
      props.pipelineId ?? this.pipelineId,
      props.stageId ?? this.stageId,
      props.contactId !== undefined ? props.contactId : this.contactId,
      props.companyId !== undefined ? props.companyId : this.companyId,
      props.name ?? this.name,
      props.amount ?? this.amount,
      props.expectedCloseDate !== undefined ? props.expectedCloseDate : this.expectedCloseDate,
      this.status,
      props.assignedUserId !== undefined ? props.assignedUserId : this.assignedUserId,
      this.lostReasonId,
      this.lostNotes,
      this.createdAt,
      new Date(),
    )
  }

  move(stageId: string): Deal {
    return new Deal(
      this.id,
      this.tenantId,
      this.pipelineId,
      stageId,
      this.contactId,
      this.companyId,
      this.name,
      this.amount,
      this.expectedCloseDate,
      this.status,
      this.assignedUserId,
      this.lostReasonId,
      this.lostNotes,
      this.createdAt,
      new Date(),
    )
  }

  win(amount?: number): Deal {
    return new Deal(
      this.id,
      this.tenantId,
      this.pipelineId,
      this.stageId,
      this.contactId,
      this.companyId,
      this.name,
      amount ?? this.amount,
      this.expectedCloseDate,
      'WON',
      this.assignedUserId,
      null,
      null,
      this.createdAt,
      new Date(),
    )
  }

  lose(reasonId?: string, notes?: string): Deal {
    return new Deal(
      this.id,
      this.tenantId,
      this.pipelineId,
      this.stageId,
      this.contactId,
      this.companyId,
      this.name,
      this.amount,
      this.expectedCloseDate,
      'LOST',
      this.assignedUserId,
      reasonId ?? null,
      notes ?? null,
      this.createdAt,
      new Date(),
    )
  }
}
