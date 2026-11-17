export class ContactPet {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly contactId: string,
    readonly petCategory: string,
    readonly name: string,
    readonly breed: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    contactId: string
    petCategory: string
    name: string
    breed?: string
  }): ContactPet {
    return new ContactPet(
      crypto.randomUUID(),
      props.tenantId,
      props.contactId,
      props.petCategory,
      props.name,
      props.breed ?? null,
      new Date(),
      new Date(),
    )
  }
}
