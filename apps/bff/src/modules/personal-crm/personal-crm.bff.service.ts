import { Injectable } from '@nestjs/common'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { CacheService } from '../../common/cache/cache.service'
import type {
  CreateLifeEvent, LifeEvent,
  CreateGift, Gift,
  CreateDebt, Debt,
  CreateReminder, Reminder,
  AddPet, Pet,
} from '@crm/contracts'

export interface PaginatedResult<T> {
  data: T[]
  nextCursor: string | null
}

const CACHE_TTL_MS = 30_000
const CACHE_KEY_PREFIX = 'personal-crm:'

@Injectable()
export class PersonalCrmBffService {
  constructor(
    private readonly api: ApiCoreGrpcClient,
    private readonly cache: CacheService,
  ) {}

  async createLifeEvent(dto: CreateLifeEvent, tenantId: string): Promise<LifeEvent> {
    const event = await this.api.createLifeEvent({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return event
  }

  async listLifeEvents(contactId: string | undefined, tenantId: string): Promise<PaginatedResult<LifeEvent>> {
    const cacheKey = `${CACHE_KEY_PREFIX}lifeEvents:${contactId || 'all'}:${tenantId}`
    return this.cache.getOrSet<PaginatedResult<LifeEvent>>(
      cacheKey,
      () => this.api.listLifeEvents({ tenantId, contactId: contactId || '' }),
      CACHE_TTL_MS,
    )
  }

  async createGift(dto: CreateGift, tenantId: string): Promise<Gift> {
    const gift = await this.api.createGift({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return gift
  }

  async listGifts(contactId: string | undefined, tenantId: string): Promise<PaginatedResult<Gift>> {
    const cacheKey = `${CACHE_KEY_PREFIX}gifts:${contactId || 'all'}:${tenantId}`
    return this.cache.getOrSet<PaginatedResult<Gift>>(
      cacheKey,
      () => this.api.listGifts({ tenantId, contactId: contactId || '' }),
      CACHE_TTL_MS,
    )
  }

  async createDebt(dto: CreateDebt, tenantId: string): Promise<Debt> {
    const debt = await this.api.createDebt({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return debt
  }

  async listDebts(contactId: string | undefined, tenantId: string): Promise<PaginatedResult<Debt>> {
    const cacheKey = `${CACHE_KEY_PREFIX}debts:${contactId || 'all'}:${tenantId}`
    return this.cache.getOrSet<PaginatedResult<Debt>>(
      cacheKey,
      () => this.api.listDebts({ tenantId, contactId: contactId || '' }),
      CACHE_TTL_MS,
    )
  }

  async settleDebt(id: string, tenantId: string): Promise<void> {
    await this.api.settleDebt(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async createReminder(dto: CreateReminder, tenantId: string): Promise<Reminder> {
    const reminder = await this.api.createReminder({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return reminder
  }

  async listReminders(contactId: string | undefined, tenantId: string): Promise<PaginatedResult<Reminder>> {
    const cacheKey = `${CACHE_KEY_PREFIX}reminders:${contactId || 'all'}:${tenantId}`
    return this.cache.getOrSet<PaginatedResult<Reminder>>(
      cacheKey,
      () => this.api.listReminders({ tenantId, contactId: contactId || '' }),
      CACHE_TTL_MS,
    )
  }

  async toggleReminder(id: string, tenantId: string): Promise<void> {
    await this.api.toggleReminder(tenantId, id)
    this.cache.invalidate(CACHE_KEY_PREFIX)
  }

  async addPet(dto: AddPet, tenantId: string): Promise<Pet> {
    const pet = await this.api.addPet({ tenantId, ...dto })
    this.cache.invalidate(CACHE_KEY_PREFIX)
    return pet
  }

  async listPets(contactId: string | undefined, tenantId: string): Promise<PaginatedResult<Pet>> {
    const cacheKey = `${CACHE_KEY_PREFIX}pets:${contactId || 'all'}:${tenantId}`
    return this.cache.getOrSet<PaginatedResult<Pet>>(
      cacheKey,
      () => this.api.listPets({ tenantId, contactId: contactId || '' }),
      CACHE_TTL_MS,
    )
  }
}
