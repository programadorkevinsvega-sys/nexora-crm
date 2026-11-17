import { Entity } from "../common/entities/base.entity"

export interface LoyaltyProfileProps {
  tenantId: string
  contactId: string
  loyaltyPointsBalance: number
  tierLevel: string
  totalLifetimeValue: number
  totalPurchasesCount: number
  averageOrderValue: number
  lastPurchaseDate: string | null
}

export class LoyaltyProfile extends Entity<LoyaltyProfileProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get contactId(): string {
    return this.props.contactId
  }

  get loyaltyPointsBalance(): number {
    return this.props.loyaltyPointsBalance
  }

  get tierLevel(): string {
    return this.props.tierLevel
  }

  get totalLifetimeValue(): number {
    return this.props.totalLifetimeValue
  }

  get totalPurchasesCount(): number {
    return this.props.totalPurchasesCount
  }

  get averageOrderValue(): number {
    return this.props.averageOrderValue
  }

  get lastPurchaseDate(): string | null {
    return this.props.lastPurchaseDate
  }

  static create(
    props: LoyaltyProfileCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): LoyaltyProfile {
    return new LoyaltyProfile(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      contactId: props.contactId,
      loyaltyPointsBalance: props.loyaltyPointsBalance ?? 0,
      tierLevel: props.tierLevel ?? "BRONZE",
      totalLifetimeValue: props.totalLifetimeValue ?? 0,
      totalPurchasesCount: props.totalPurchasesCount ?? 0,
      averageOrderValue: props.averageOrderValue ?? 0,
      lastPurchaseDate: props.lastPurchaseDate ?? null,
    })
  }

  earn(points: number): void {
    this.props.loyaltyPointsBalance += points
    this.touch()
  }

  redeem(points: number): void {
    if (points > this.props.loyaltyPointsBalance) {
      throw new Error("Insufficient loyalty points")
    }
    this.props.loyaltyPointsBalance -= points
    this.touch()
  }
}

export interface LoyaltyProfileCreateInput {
  tenantId: string
  contactId: string
  loyaltyPointsBalance?: number
  tierLevel?: string
  totalLifetimeValue?: number
  totalPurchasesCount?: number
  averageOrderValue?: number
  lastPurchaseDate?: string | null
}
