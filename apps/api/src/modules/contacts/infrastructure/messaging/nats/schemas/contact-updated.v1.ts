export interface ContactUpdatedEventV1 {
  eventId: string
  eventType: 'crm.contact.updated'
  eventVersion: 1
  occurredAt: string
  producerModule: 'contacts'
  payload: {
    contactId: string
    firstName: string
    lastName: string | null
  }
}
