import { CreateContactSchema } from '@crm/contracts'
import { ContactsBffController } from './contacts.bff.controller'

describe('ContactsBffController - HTTP REST Gateway E2E Tests', () => {
  let controller: ContactsBffController
  let mockService: any

  beforeEach(() => {
    mockService = {
      list: jest.fn().mockResolvedValue({
        data: [{ id: 'contact-1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' }],
        nextCursor: null,
      }),
      create: jest.fn().mockImplementation((dto, tenantId) =>
        Promise.resolve({
          id: 'contact-new',
          ...dto,
          tenantId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      ),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }

    controller = new ContactsBffController(mockService)
  })

  it('should validate and parse payload with null optional fields without throwing validation error', () => {
    const rawPayload = {
      firstName: 'Alan',
      lastName: null,
      email: null,
      phone: null,
      companyId: null,
      jobTitle: null,
      birthDate: null,
    }
    const parsed = CreateContactSchema.parse(rawPayload)
    expect(parsed.firstName).toBe('Alan')
    expect(parsed.lastName).toBeNull()
  })

  it('should forward list contacts query with pagination and filters to gRPC service', async () => {
    const result = await controller.list(
      undefined,
      '20',
      'Ada',
      'LEAD',
      undefined,
      'true',
      undefined,
      undefined,
      'tenant-1',
    )

    expect(result.data.length).toBe(1)
    expect(mockService.list).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20, search: 'Ada', isStarred: true }),
      'tenant-1',
    )
  })

  it('should forward create contact payload with tenant header to gRPC service', async () => {
    const dto = { firstName: 'Alan', lastName: 'Turing' } as any
    const result = await controller.create(dto, 'tenant-1')

    expect(result.id).toBe('contact-new')
    expect(mockService.create).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Alan', lastName: 'Turing' }),
      'tenant-1',
    )
  })
})
