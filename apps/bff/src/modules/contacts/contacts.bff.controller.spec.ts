import { CreateContactSchema } from '@crm/contracts'
import { ContactsBffController } from './contacts.bff.controller'
import { ContactsBffService } from './contacts.bff.service'
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator'

describe('ContactsBffController - HTTP REST Gateway E2E Tests', () => {
  let controller: ContactsBffController
  let mockService: jest.Mocked<ContactsBffService>

  beforeEach(() => {
    mockService = {
      list: jest.fn().mockResolvedValue({
        data: [{ id: 'contact-1', firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com' }],
        nextCursor: null,
      }),
      create: jest.fn().mockImplementation((dto: Record<string, unknown>, tenantId: string) =>
        Promise.resolve({
          id: 'contact-new', ...dto, tenantId,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }),
      ),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<ContactsBffService>
    controller = new ContactsBffController(mockService)
  })

  it('validates payload with null optional fields', () => {
    const parsed = CreateContactSchema.parse({
      firstName: 'Alan', lastName: null, email: null, phone: null,
      companyId: null, jobTitle: null, birthDate: null,
    })
    expect(parsed.firstName).toBe('Alan')
    expect(parsed.lastName).toBeNull()
  })

  it('forwards list query with pagination and filters', async () => {
    const user: AuthenticatedUser = {
      tenantId: 'tenant-1', userId: 'user-1', sub: 'user-1', role: 'admin',
    }
    const result = await controller.list(
      undefined, '20', 'Ada', 'LEAD', undefined, 'true', undefined, undefined, user,
    )
    expect(result.data.length).toBe(1)
    expect(mockService.list).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20, search: 'Ada', isStarred: true }),
      'tenant-1',
    )
  })

  it('forwards parsed create contact payload with tenant header', async () => {
    const dto = CreateContactSchema.parse({ firstName: 'Alan', lastName: 'Turing' })
    const result = await controller.create(dto, 'tenant-1')
    expect(result.id).toBe('contact-new')
    expect(mockService.create).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: 'Alan', lastName: 'Turing' }),
      'tenant-1',
    )
  })
})