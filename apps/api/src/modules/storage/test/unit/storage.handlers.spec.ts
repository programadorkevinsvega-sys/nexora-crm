import { UploadFileHandler, UploadFileCommand } from '../../application/handlers'
import { File } from '../../domain/entities/file.entity'

describe('Storage Module - Unit Tests', () => {
  let mockRepo: any
  let mockR2: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = { save: jest.fn().mockResolvedValue(undefined), findById: jest.fn() }
    mockR2 = { upload: jest.fn().mockResolvedValue('https://storage.crm.example/file.pdf') }
    mockOutbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  describe('UploadFileHandler', () => {
    it('should upload file binary to S3/R2 and save metadata record', async () => {
      const handler = new UploadFileHandler(mockRepo, mockR2, mockOutbox)
      const command = new UploadFileCommand(
        'contract-2026.pdf',
        'application/pdf',
        Buffer.from('dummy-pdf-content'),
        'tenant-1',
        'user-1',
        'contracts',
        'contract-123',
      )

      const result = await handler.execute(command)

      expect(result).toBeInstanceOf(File)
      expect(result.originalName).toBe('contract-2026.pdf')
      expect(mockR2.upload).toHaveBeenCalled()
      expect(mockRepo.save).toHaveBeenCalledWith(result)
      expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
    })
  })
})
