import { PaymentsBffService } from '../payments.bff.service'
import { StripeDispatcher } from '../../integrations/dispatchers/stripe.dispatcher'

describe('PaymentsBffService', () => {
  let service: PaymentsBffService
  let mockStripeDispatcher: jest.Mocked<Partial<StripeDispatcher>>

  beforeEach(() => {
    mockStripeDispatcher = {
      createPaymentLink: jest.fn().mockResolvedValue({
        id: 'plink_123',
        url: 'https://buy.stripe.com/test_123',
      }),
    }
    service = new PaymentsBffService(mockStripeDispatcher as StripeDispatcher)
  })

  it('should format transaction objects properly', () => {
    const tx = (service as any).mapTx({
      id: 'tx-1',
      tenantId: 'tenant-1',
      resourceType: 'QUOTE',
      resourceId: 'quote-1',
      gateway: 'STRIPE',
      amount: '250.00',
      currency: 'USD',
      status: 'PENDING',
      paymentUrl: 'https://buy.stripe.com/test_123',
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    expect(tx.amount).toBe(250)
    expect(tx.status).toBe('PENDING')
    expect(tx.resourceType).toBe('QUOTE')
  })
})
