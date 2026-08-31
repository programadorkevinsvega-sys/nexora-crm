import { CreateCompanyHandler, UpdateCompanyHandler, DeleteCompanyHandler } from '../../application/commands/company.handlers'
import { Company } from '../../domain/entities/company.entity'
import { NotFoundError } from '@crm/shared'

describe('Companies Module - Unit Tests', () => {
  let mockRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    }
    mockOutbox = {
      publish: jest.fn().mockResolvedValue(undefined),
    }
  })

  describe('CreateCompanyHandler', () => {
    it('should create and persist a new company with outbox event', async () => {
      const handler = new CreateCompanyHandler(mockRepo, mockOutbox)
      const command = {
        tenantId: 'tenant-1',
        name: 'Initech Systems',
        industry: 'Software',
        website: 'https://initech.example.com',
      }

      const result = await handler.execute(command)

      expect(result.id).toBeDefined()
      expect(mockRepo.save).toHaveBeenCalledTimes(1)
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })

  describe('UpdateCompanyHandler', () => {
    it('should update company attributes and publish event', async () => {
      const company = Company.create({ tenantId: 'tenant-1', name: 'Old Company' })
      mockRepo.findById.mockResolvedValue(company)

      const handler = new UpdateCompanyHandler(mockRepo, mockOutbox)
      await handler.execute({
        tenantId: 'tenant-1',
        id: company.id,
        name: 'New Company LLC',
        industry: 'Consulting',
      })

      expect(mockRepo.save).toHaveBeenCalled()
      expect(mockOutbox.publish).toHaveBeenCalled()
    })

    it('should throw NotFoundError if company not found', async () => {
      mockRepo.findById.mockResolvedValue(null)
      const handler = new UpdateCompanyHandler(mockRepo, mockOutbox)

      await expect(handler.execute({
        tenantId: 'tenant-1',
        id: 'missing-id',
        name: 'Name',
      })).rejects.toThrow(NotFoundError)
    })
  })

  describe('DeleteCompanyHandler', () => {
    it('should delete existing company and emit event', async () => {
      const company = Company.create({ tenantId: 'tenant-1', name: 'To Delete' })
      mockRepo.findById.mockResolvedValue(company)

      const handler = new DeleteCompanyHandler(mockRepo, mockOutbox)
      await handler.execute({ tenantId: 'tenant-1', id: company.id })

      expect(mockRepo.delete).toHaveBeenCalledWith('tenant-1', company.id)
      expect(mockOutbox.publish).toHaveBeenCalled()
    })
  })
})
