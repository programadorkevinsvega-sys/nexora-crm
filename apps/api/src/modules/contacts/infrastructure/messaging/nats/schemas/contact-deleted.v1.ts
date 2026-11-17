export interface ContactDeletedEventV1 {
  eventId: string
  eventType: 'crm.contact.deleted'
  eventVersion: 1
  occurredAt: string
  producerModule: 'contacts'
  payload: {
    contactId: string
  }
}
