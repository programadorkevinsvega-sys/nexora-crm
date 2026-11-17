import { randomBytes } from 'crypto'

export type WebhookEvent =
  | 'contact.created'
  | 'contact.updated'
  | 'deal.stage_changed'
  | 'deal.won'
  | 'deal.lost'
  | 'quote.accepted'
  | 'quote.rejected'
  | 'contract.signed'
  | 'ticket.created'
  | 'ticket.resolved'
  | 'payment.received'

export class WebhookEndpoint {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly url: string,
    readonly secret: string,
    readonly events: WebhookEvent[],
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static generateSecret(): string {
    return 'whsec_' + randomBytes(32).toString('hex')
  }

  static create(props: {
    tenantId: string
    name: string
    url: string
    events: WebhookEvent[]
  }): WebhookEndpoint {
    const now = new Date()
    return new WebhookEndpoint(
      crypto.randomUUID(),
      props.tenantId,
      props.name,
      props.url,
      WebhookEndpoint.generateSecret(),
      props.events,
      true,
      now,
      now,
    )
  }

  listensTo(event: WebhookEvent): boolean {
    return this.events.includes(event)
  }
}
