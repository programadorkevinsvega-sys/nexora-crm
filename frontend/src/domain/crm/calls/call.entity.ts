import { Entity } from "../common/entities/base.entity"

export interface CallProps {
  tenantId: string
  contactId: string | null
  callType: "INBOUND" | "OUTBOUND" | "MEETING"
  durationSeconds: number | null
  summary: string | null
  happenedAt: string
  authorUserId: string
}

export class Call extends Entity<CallProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get contactId(): string | null {
    return this.props.contactId
  }

  get callType(): "INBOUND" | "OUTBOUND" | "MEETING" {
    return this.props.callType
  }

  get durationSeconds(): number | null {
    return this.props.durationSeconds
  }

  get summary(): string | null {
    return this.props.summary
  }

  get happenedAt(): string {
    return this.props.happenedAt
  }

  get authorUserId(): string {
    return this.props.authorUserId
  }

  static create(
    props: CallCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Call {
    return new Call(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      contactId: props.contactId ?? null,
      callType: props.callType,
      durationSeconds: props.durationSeconds ?? null,
      summary: props.summary ?? null,
      happenedAt: props.happenedAt,
      authorUserId: props.authorUserId,
    })
  }

  update(input: CallUpdateInput): void {
    if (input.callType !== undefined) {
      this.props.callType = input.callType
    }
    if (input.durationSeconds !== undefined) {
      this.props.durationSeconds = input.durationSeconds
    }
    if (input.summary !== undefined) {
      this.props.summary = input.summary
    }
    if (input.happenedAt !== undefined) {
      this.props.happenedAt = input.happenedAt
    }
    this.touch()
  }
}

export interface CallCreateInput {
  tenantId: string
  callType: "INBOUND" | "OUTBOUND" | "MEETING"
  happenedAt: string
  authorUserId: string
  contactId?: string | null
  durationSeconds?: number | null
  summary?: string | null
}

export interface CallUpdateInput {
  callType?: "INBOUND" | "OUTBOUND" | "MEETING"
  durationSeconds?: number | null
  summary?: string | null
  happenedAt?: string
}
