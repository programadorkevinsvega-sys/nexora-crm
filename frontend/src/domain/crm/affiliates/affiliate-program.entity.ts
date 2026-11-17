import { Entity } from "../common/entities/base.entity"

export interface AffiliateProgramProps {
  tenantId: string
  name: string
  commissionType: string
  commissionValue: string
  cookieDurationDays: number | null
  isMultiLevel: boolean
  maxMlmLevels: number | null
  isActive: boolean
}

export class AffiliateProgram extends Entity<AffiliateProgramProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get name(): string {
    return this.props.name
  }

  get commissionType(): string {
    return this.props.commissionType
  }

  get commissionValue(): string {
    return this.props.commissionValue
  }

  get cookieDurationDays(): number | null {
    return this.props.cookieDurationDays
  }

  get isMultiLevel(): boolean {
    return this.props.isMultiLevel
  }

  get maxMlmLevels(): number | null {
    return this.props.maxMlmLevels
  }

  get isActive(): boolean {
    return this.props.isActive
  }

  static create(
    props: ProgramCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): AffiliateProgram {
    return new AffiliateProgram(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      name: props.name,
      commissionType: props.commissionType,
      commissionValue: props.commissionValue,
      cookieDurationDays: props.cookieDurationDays ?? null,
      isMultiLevel: props.isMultiLevel ?? false,
      maxMlmLevels: props.maxMlmLevels ?? null,
      isActive: props.isActive ?? true,
    })
  }

  update(input: ProgramUpdateInput): void {
    if (input.name !== undefined) {
      this.props.name = input.name
    }
    if (input.commissionType !== undefined) {
      this.props.commissionType = input.commissionType
    }
    if (input.commissionValue !== undefined) {
      this.props.commissionValue = input.commissionValue
    }
    if (input.cookieDurationDays !== undefined) {
      this.props.cookieDurationDays = input.cookieDurationDays
    }
    if (input.isMultiLevel !== undefined) {
      this.props.isMultiLevel = input.isMultiLevel
    }
    if (input.maxMlmLevels !== undefined) {
      this.props.maxMlmLevels = input.maxMlmLevels
    }
    if (input.isActive !== undefined) {
      this.props.isActive = input.isActive
    }
    this.touch()
  }
}

export interface ProgramCreateInput {
  tenantId: string
  name: string
  commissionType: string
  commissionValue: string
  cookieDurationDays?: number | null
  isMultiLevel?: boolean
  maxMlmLevels?: number | null
  isActive?: boolean
}

export interface ProgramUpdateInput {
  name?: string
  commissionType?: string
  commissionValue?: string
  cookieDurationDays?: number | null
  isMultiLevel?: boolean
  maxMlmLevels?: number | null
  isActive?: boolean
}
