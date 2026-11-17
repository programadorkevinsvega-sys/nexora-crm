import { PartnerTierCodeSchema, DealRegistrationStatusSchema } from '@crm/contracts'

describe('PRM Contracts & Logic', () => {
  it('should validate partner tier codes', () => {
    expect(PartnerTierCodeSchema.parse('SILVER')).toBe('SILVER')
    expect(PartnerTierCodeSchema.parse('GOLD')).toBe('GOLD')
    expect(PartnerTierCodeSchema.parse('PLATINUM')).toBe('PLATINUM')
  })

  it('should validate deal registration lifecycle statuses', () => {
    expect(DealRegistrationStatusSchema.parse('SUBMITTED')).toBe('SUBMITTED')
    expect(DealRegistrationStatusSchema.parse('APPROVED')).toBe('APPROVED')
    expect(DealRegistrationStatusSchema.parse('CONVERTED')).toBe('CONVERTED')
  })
})
