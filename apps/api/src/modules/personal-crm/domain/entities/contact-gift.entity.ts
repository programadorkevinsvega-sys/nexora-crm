export type GiftDirection = 'GIVEN' | 'RECEIVED'
export type GiftStatus = 'IDEA' | 'PURCHASED' | 'GIVEN' | 'RECEIVED'

export class ContactGift {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly contactId: string,
    readonly direction: GiftDirection,
    readonly name: string,
    readonly description: string | null,
    readonly url: string | null,
    readonly estimatedValue: number | null,
    readonly status: GiftStatus,
    readonly dateGivenOrReceived: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    contactId: string
    direction?: GiftDirection
    name: string
    description?: string
    url?: string
    estimatedValue?: number
    status?: GiftStatus
    dateGivenOrReceived?: string
  }): ContactGift {
    return new ContactGift(
      crypto.randomUUID(),
      props.tenantId,
      props.contactId,
      props.direction ?? 'GIVEN',
      props.name,
      props.description ?? null,
      props.url ?? null,
      props.estimatedValue ?? null,
      props.status ?? 'IDEA',
      props.dateGivenOrReceived ?? null,
      new Date(),
      new Date(),
    )
  }
}
