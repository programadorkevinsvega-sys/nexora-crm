export class ListLifeEventsQuery {
  constructor(readonly tenantId: string, readonly contactId?: string) {}
}

export class ListGiftsQuery {
  constructor(readonly tenantId: string, readonly contactId?: string) {}
}

export class ListDebtsQuery {
  constructor(readonly tenantId: string, readonly contactId?: string) {}
}

export class ListRemindersQuery {
  constructor(readonly tenantId: string, readonly contactId?: string) {}
}

export class ListPetsQuery {
  constructor(readonly tenantId: string, readonly contactId?: string) {}
}
