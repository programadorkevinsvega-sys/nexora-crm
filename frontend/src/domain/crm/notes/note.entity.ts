import { Entity } from "../common/entities/base.entity"

export interface NoteProps {
  tenantId: string
  contactId: string | null
  companyId: string | null
  dealId: string | null
  content: string
  authorUserId: string
}

export class Note extends Entity<NoteProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get contactId(): string | null {
    return this.props.contactId
  }

  get companyId(): string | null {
    return this.props.companyId
  }

  get dealId(): string | null {
    return this.props.dealId
  }

  get content(): string {
    return this.props.content
  }

  get authorUserId(): string {
    return this.props.authorUserId
  }

  static create(
    props: NoteCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Note {
    return new Note(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      contactId: props.contactId ?? null,
      companyId: props.companyId ?? null,
      dealId: props.dealId ?? null,
      content: props.content,
      authorUserId: props.authorUserId,
    })
  }

  update(input: NoteUpdateInput): void {
    if (input.content !== undefined) {
      this.props.content = input.content
    }
    if (input.contactId !== undefined) {
      this.props.contactId = input.contactId
    }
    if (input.companyId !== undefined) {
      this.props.companyId = input.companyId
    }
    if (input.dealId !== undefined) {
      this.props.dealId = input.dealId
    }
    this.touch()
  }
}

export interface NoteCreateInput {
  tenantId: string
  content: string
  authorUserId: string
  contactId?: string | null
  companyId?: string | null
  dealId?: string | null
}

export interface NoteUpdateInput {
  content?: string
  contactId?: string | null
  companyId?: string | null
  dealId?: string | null
}
