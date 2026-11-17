import { Injectable } from '@nestjs/common'
import { PersonalCrmRepository } from '../../domain/repositories/personal-crm.repository'
import {
  ListLifeEventsQuery,
  ListGiftsQuery,
  ListDebtsQuery,
  ListRemindersQuery,
  ListPetsQuery,
} from './personal-crm.queries'

@Injectable()
export class ListLifeEventsHandler {
  constructor(private readonly repo: PersonalCrmRepository) {}

  async execute(query: ListLifeEventsQuery) {
    return this.repo.listLifeEvents(query.tenantId, query.contactId)
  }
}

@Injectable()
export class ListGiftsHandler {
  constructor(private readonly repo: PersonalCrmRepository) {}

  async execute(query: ListGiftsQuery) {
    return this.repo.listGifts(query.tenantId, query.contactId)
  }
}

@Injectable()
export class ListDebtsHandler {
  constructor(private readonly repo: PersonalCrmRepository) {}

  async execute(query: ListDebtsQuery) {
    return this.repo.listDebts(query.tenantId, query.contactId)
  }
}

@Injectable()
export class ListRemindersHandler {
  constructor(private readonly repo: PersonalCrmRepository) {}

  async execute(query: ListRemindersQuery) {
    return this.repo.listReminders(query.tenantId, query.contactId)
  }
}

@Injectable()
export class ListPetsHandler {
  constructor(private readonly repo: PersonalCrmRepository) {}

  async execute(query: ListPetsQuery) {
    return this.repo.listPets(query.tenantId, query.contactId)
  }
}
