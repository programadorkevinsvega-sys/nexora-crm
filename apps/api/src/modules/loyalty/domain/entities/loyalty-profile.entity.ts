import { ConflictError } from '@crm/shared'

export class LoyaltyProfile {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly contactId: string,
    readonly loyaltyPointsBalance: number,
    readonly tierLevel: string,
    readonly totalLifetimeValue: number,
    readonly totalPurchasesCount: number,
    readonly averageOrderValue: number,
    readonly lastPurchaseDate: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    contactId: string
    loyaltyPointsBalance?: number
    tierLevel?: string
    totalLifetimeValue?: number
    totalPurchasesCount?: number
    averageOrderValue?: number
    lastPurchaseDate?: Date
  }): LoyaltyProfile {
    return new LoyaltyProfile(
      crypto.randomUUID(),
      props.tenantId,
      props.contactId,
      props.loyaltyPointsBalance ?? 0,
      props.tierLevel ?? 'BRONZE',
      props.totalLifetimeValue ?? 0,
      props.totalPurchasesCount ?? 0,
      props.averageOrderValue ?? 0,
      props.lastPurchaseDate ?? null,
      new Date(),
      new Date(),
    )
  }

  earnPoints(points: number): LoyaltyProfile {
    const newBalance = this.loyaltyPointsBalance + points
    const newTier = this.calculateTier(newBalance)
    return new LoyaltyProfile(
      this.id,
      this.tenantId,
      this.contactId,
      newBalance,
      newTier,
      this.totalLifetimeValue,
      this.totalPurchasesCount,
      this.averageOrderValue,
      this.lastPurchaseDate,
      this.createdAt,
      new Date(),
    )
  }

  redeemPoints(points: number): LoyaltyProfile {
    if (this.loyaltyPointsBalance < points) {
      throw new ConflictError('Insufficient loyalty points')
    }
    return new LoyaltyProfile(
      this.id,
      this.tenantId,
      this.contactId,
      this.loyaltyPointsBalance - points,
      this.tierLevel,
      this.totalLifetimeValue,
      this.totalPurchasesCount,
      this.averageOrderValue,
      this.lastPurchaseDate,
      this.createdAt,
      new Date(),
    )
  }

  updateLifetimeValue(total: number, purchasesCount: number): LoyaltyProfile {
    const aov = purchasesCount > 0 ? total / purchasesCount : 0
    return new LoyaltyProfile(
      this.id,
      this.tenantId,
      this.contactId,
      this.loyaltyPointsBalance,
      this.tierLevel,
      total,
      purchasesCount,
      aov,
      new Date(),
      this.createdAt,
      new Date(),
    )
  }

  private calculateTier(balance: number): string {
    if (balance >= 10000) return 'PLATINUM'
    if (balance >= 5000) return 'GOLD'
    if (balance >= 1000) return 'SILVER'
    return 'BRONZE'
  }
}
