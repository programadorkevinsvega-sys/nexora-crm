import type { LoyaltyProfile } from "./loyalty-profile.entity"

export interface LoyaltyProfileRepository {
  getByContactId(contactId: string): Promise<LoyaltyProfile | null>
  earnPoints(contactId: string, points: number): Promise<LoyaltyProfile>
  redeemPoints(contactId: string, points: number): Promise<LoyaltyProfile>
}
