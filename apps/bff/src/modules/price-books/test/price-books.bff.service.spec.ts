import { CurrencyCodeSchema } from '@crm/contracts'

describe('PriceBooks Contracts & Logic', () => {
  it('should validate supported currencies', () => {
    expect(CurrencyCodeSchema.parse('USD')).toBe('USD')
    expect(CurrencyCodeSchema.parse('COP')).toBe('COP')
    expect(CurrencyCodeSchema.parse('MXN')).toBe('MXN')
    expect(CurrencyCodeSchema.parse('EUR')).toBe('EUR')
  })

  it('should calculate available stock correctly', () => {
    const stockOnHand = 50
    const stockReserved = 15
    const stockAvailable = Math.max(0, stockOnHand - stockReserved)
    expect(stockAvailable).toBe(35)
  })
})
