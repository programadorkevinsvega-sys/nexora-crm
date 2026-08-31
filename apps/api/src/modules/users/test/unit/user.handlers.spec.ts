/* eslint-disable @typescript-eslint/no-explicit-any */
import { CreateUserHandler } from '../../application/commands/user.handlers'
import { GetUserHandler } from '../../application/queries/user.handlers'
import { CreateUserCommand } from '../../application/commands/user.commands'
import { GetUserQuery } from '../../application/queries/user.queries'
import { User } from '../../domain/entities/user.entity'

const TENANT_ID = '00000000-0000-0000-0000-000000000001'

describe('CreateUserHandler', () => {
  let handler: CreateUserHandler
  let mockRepo: any
  let mockOutbox: any

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined),
      saveNaturalPersonProfile: jest.fn().mockResolvedValue(undefined),
      saveLegalEntityProfile: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn().mockResolvedValue(null),
    }
    mockOutbox = {
      publish: jest.fn().mockResolvedValue(undefined),
    }
    handler = new CreateUserHandler(mockRepo, mockOutbox)
  })

  it('should create a natural person user', async () => {
    const result = await handler.execute(new CreateUserCommand(
      TENANT_ID, 'john@example.com', undefined, 'NATURAL_PERSON',
      'John', 'Doe',
    ))

    expect(result.id).toBeDefined()
    expect(mockRepo.findByEmail).toHaveBeenCalledWith(TENANT_ID, 'john@example.com')
    expect(mockRepo.saveNaturalPersonProfile).toHaveBeenCalledTimes(1)
    expect(mockRepo.save).toHaveBeenCalledTimes(1)
    expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
  })

  it('should create a legal entity user', async () => {
    const result = await handler.execute(new CreateUserCommand(
      TENANT_ID, 'company@example.com', undefined, 'LEGAL_ENTITY',
      undefined, undefined, undefined, undefined, undefined,
      undefined, undefined, undefined,
      'Acme Corp', undefined, 'NIT123456789',
    ))

    expect(result.id).toBeDefined()
    expect(mockRepo.saveLegalEntityProfile).toHaveBeenCalledTimes(1)
    expect(mockRepo.save).toHaveBeenCalledTimes(1)
    expect(mockOutbox.publish).toHaveBeenCalledTimes(1)
  })

  it('should throw ConflictError when email already exists', async () => {
    mockRepo.findByEmail.mockResolvedValue(
      User.create({ tenantId: TENANT_ID, email: 'existing@example.com', profileType: 'NATURAL_PERSON' }),
    )

    await expect(handler.execute(new CreateUserCommand(
      TENANT_ID, 'existing@example.com', undefined, 'NATURAL_PERSON',
      'John', 'Doe',
    ))).rejects.toThrow('Email already registered')
  })

  it('should throw when natural person fields are missing', async () => {
    await expect(handler.execute(new CreateUserCommand(
      TENANT_ID, 'test@example.com', undefined, 'NATURAL_PERSON',
    ))).rejects.toThrow('firstName and lastName are required')
  })

  it('should throw when legal entity fields are missing', async () => {
    await expect(handler.execute(new CreateUserCommand(
      TENANT_ID, 'test@example.com', undefined, 'LEGAL_ENTITY',
    ))).rejects.toThrow('legalName and taxId are required')
  })
})

describe('GetUserHandler', () => {
  let handler: GetUserHandler
  let mockRepo: any

  beforeEach(() => {
    mockRepo = { findById: jest.fn() }
    handler = new GetUserHandler(mockRepo)
  })

  it('should return user when found', async () => {
    const user = User.create({ tenantId: TENANT_ID, email: 'test@example.com', profileType: 'NATURAL_PERSON' })
    mockRepo.findById.mockResolvedValue(user)

    const result = await handler.execute(new GetUserQuery(TENANT_ID, user.id))
    expect(result).toBe(user)
    expect(result.email).toBe('test@example.com')
  })

  it('should throw NotFoundError when user not found', async () => {
    mockRepo.findById.mockResolvedValue(null)

    await expect(handler.execute(new GetUserQuery(TENANT_ID, crypto.randomUUID())))
      .rejects.toThrow('User with id')
  })
})
