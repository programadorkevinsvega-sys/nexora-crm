import { PaymentsBffService } from '../payments.bff.service'
import { StripeDispatcher } from '../../integrations/dispatchers/stripe.dispatcher'
import { paymentTransactions } from '@crm/database'
import type { PaymentTransaction } from '@crm/contracts'

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
    const mapTx = Reflect.get(service, 'mapTx') as (
      row: typeof paymentTransactions.$inferSelect,
    ) => PaymentTransaction
    const tx = mapTx({
      id: '00000000-0000-4000-8000-000000000001',
      tenantId: '00000000-0000-4000-8000-000000000002',
      resourceType: 'QUOTE',
      resourceId: '00000000-0000-4000-8000-000000000003',
      gateway: 'STRIPE',
      externalPaymentId: null,
      paymentUrl: 'https://buy.stripe.com/test_123',
      amount: '250.00',
      currency: 'USD',
      status: 'PENDING',
      customerEmail: null,
      customerName: null,
      paidAt: null,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    expect(tx.amount).toBe(250)
    expect(tx.status).toBe('PENDING')
    expect(tx.resourceType).toBe('QUOTE')
  })
})