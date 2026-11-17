import { GetCompanyHandler, ListCompaniesHandler } from '../../application/queries/company.handlers'
import { Company } from '../../domain/entities/company.entity'
import { NotFoundError } from '@crm/shared'

describe('Companies Queries - Unit Tests', () => {
  let mockRepo: any

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      list: jest.fn(),
    }
  })

  describe('GetCompanyHandler', () => {
    it('should return company by id when found', async () => {
      const company = Company.create({ tenantId: 'tenant-1', name: 'Acme Corp' })
      mockRepo.findById.mockResolvedValue(company)

      const handler = new GetCompanyHandler(mockRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', id: company.id })

      expect(result).toBe(company)
      expect(mockRepo.findById).toHaveBeenCalledWith('tenant-1', company.id)
    })

    it('should throw NotFoundError when company does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null)

      const handler = new GetCompanyHandler(mockRepo)
      await expect(handler.execute({ tenantId: 'tenant-1', id: 'missing' })).rejects.toThrow(NotFoundError)
    })
  })

  describe('ListCompaniesHandler', () => {
    it('should list companies with filters', async () => {
      const companies = [Company.create({ tenantId: 'tenant-1', name: 'A' })]
      mockRepo.list.mockResolvedValue(companies)

      const handler = new ListCompaniesHandler(mockRepo)
      const result = await handler.execute({ tenantId: 'tenant-1', filter: { search: 'A', limit: 20 } })

      expect(result).toEqual(companies)
      expect(mockRepo.list).toHaveBeenCalledWith('tenant-1', { search: 'A', limit: 20 })
    })
  })
})
