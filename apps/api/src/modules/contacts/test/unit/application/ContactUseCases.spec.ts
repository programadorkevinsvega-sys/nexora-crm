import { GetContactUseCase } from '../../../application/use-cases/GetContactUseCase'
import { UpdateContactUseCase } from '../../../application/use-cases/UpdateContactUseCase'
import { DeleteContactUseCase } from '../../../application/use-cases/DeleteContactUseCase'
import { Contact } from '../../../domain/entities/Contact'
import { ContactNotFoundError } from '../../../domain/errors/ContactNotFoundError'

describe('Contacts Application Use Cases', () => {
  let mockRepo: any
  let mockPublisher: any

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      findAll: jest.fn(),
    }
    mockPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    }
  })

  describe('GetContactUseCase', () => {
    it('should return contact output DTO when contact exists', async () => {
      const contact = Contact.create({
        tenantId: 'tenant-1',
        firstName: 'Sarah',
        lastName: 'Connor',
        email: 'sarah@skynet.test',
        phone: '+15550100',
        isStarred: true,
      })
      mockRepo.findById.mockResolvedValue(contact)

      const useCase = new GetContactUseCase(mockRepo)
      const result = await useCase.execute({ tenantId: 'tenant-1', id: contact.id })

      expect(result.id).toBe(contact.id)
      expect(result.firstName).toBe('Sarah')
      expect(result.lastName).toBe('Connor')
    })

    it('should throw ContactNotFoundError when not found', async () => {
      mockRepo.findById.mockResolvedValue(null)

      const useCase = new GetContactUseCase(mockRepo)
      await expect(useCase.execute({ tenantId: 'tenant-1', id: 'missing' })).rejects.toThrow(ContactNotFoundError)
    })
  })

  describe('UpdateContactUseCase', () => {
    it('should update contact details and publish domain event', async () => {
      const contact = Contact.create({
        tenantId: 'tenant-1',
        firstName: 'Sarah',
        lastName: 'Connor',
        email: 'sarah@skynet.test',
      })
      mockRepo.findById.mockResolvedValue(contact)

      const useCase = new UpdateContactUseCase(mockRepo, mockPublisher)
      await useCase.execute({
        tenantId: 'tenant-1',
        id: contact.id,
        firstName: 'Sarah J.',
        leadStatus: 'QUALIFIED',
      })

      expect(mockRepo.save).toHaveBeenCalled()
      expect(mockPublisher.publish).toHaveBeenCalled()
    })
  })

  describe('DeleteContactUseCase', () => {
    it('should delete contact and publish event', async () => {
      const contact = Contact.create({
        tenantId: 'tenant-1',
        firstName: 'Sarah',
        lastName: 'Connor',
        email: 'sarah@skynet.test',
      })
      mockRepo.findById.mockResolvedValue(contact)

      const useCase = new DeleteContactUseCase(mockRepo, mockPublisher)
      await useCase.execute({ tenantId: 'tenant-1', id: contact.id })

      expect(mockRepo.delete).toHaveBeenCalledWith('tenant-1', contact.id)
      expect(mockPublisher.publish).toHaveBeenCalled()
    })
  })
})
