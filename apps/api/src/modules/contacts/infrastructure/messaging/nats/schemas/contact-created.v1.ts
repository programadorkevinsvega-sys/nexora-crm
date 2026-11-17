export interface ContactCreatedEventV1 {
  eventId: string
  eventType: 'crm.contact.created'
  eventVersion: 1
  occurredAt: string
  producerModule: 'contacts'
  payload: {
    contactId: string
    firstName: string
    lastName: string | null
  }
}
