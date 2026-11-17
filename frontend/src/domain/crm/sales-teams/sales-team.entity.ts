import { Entity } from "../common/entities/base.entity"

export interface SalesTeamProps {
  tenantId: string
  name: string
  managerUserId: string | null
  monthlyTarget: number | null
}

export class SalesTeam extends Entity<SalesTeamProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get name(): string {
    return this.props.name
  }

  get managerUserId(): string | null {
    return this.props.managerUserId
  }

  get monthlyTarget(): number | null {
    return this.props.monthlyTarget
  }

  static create(
    props: SalesTeamCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): SalesTeam {
    return new SalesTeam(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      name: props.name,
      managerUserId: props.managerUserId ?? null,
      monthlyTarget: props.monthlyTarget ?? null,
    })
  }

  update(input: SalesTeamUpdateInput): void {
    if (input.name !== undefined) {
      this.props.name = input.name
    }
    if (input.managerUserId !== undefined) {
      this.props.managerUserId = input.managerUserId
    }
    if (input.monthlyTarget !== undefined) {
      this.props.monthlyTarget = input.monthlyTarget
    }
    this.touch()
  }
}

export interface SalesTeamCreateInput {
  tenantId: string
  name: string
  managerUserId?: string | null
  monthlyTarget?: number | null
}

export interface SalesTeamUpdateInput {
  name?: string
  managerUserId?: string | null
  monthlyTarget?: number | null
}
