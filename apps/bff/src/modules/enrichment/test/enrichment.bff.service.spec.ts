import { EnrichmentBffService } from '../enrichment.bff.service'

describe('EnrichmentBffService', () => {
  let service: EnrichmentBffService

  beforeEach(() => {
    service = new EnrichmentBffService()
  })

  it('should validate a corporate email as deliverable', async () => {
    const res = await service.validateEmail('carlos.mendoza@google.com')
    expect(res.isValid).toBe(true)
    expect(res.deliverabilityScore).toBeGreaterThanOrEqual(80)
    expect(res.isDisposable).toBe(false)
  })

  it('should flag a disposable email domain', async () => {
    const res = await service.validateEmail('temp123@mailinator.com')
    expect(res.isDisposable).toBe(true)
    expect(res.deliverabilityScore).toBeLessThan(50)
  })
})
