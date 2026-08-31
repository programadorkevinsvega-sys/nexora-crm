import { Entity } from "../common/entities/base.entity"

export interface PetProps {
  tenantId: string
  contactId: string
  petCategory: string
  name: string
  breed: string | null
}

export class Pet extends Entity<PetProps> {
  get tenantId(): string {
    return this.props.tenantId
  }

  get contactId(): string {
    return this.props.contactId
  }

  get petCategory(): string {
    return this.props.petCategory
  }

  get name(): string {
    return this.props.name
  }

  get breed(): string | null {
    return this.props.breed
  }

  static create(
    props: PetCreateInput,
    id: string,
    createdAt: Date | string,
    updatedAt: Date | string,
  ): Pet {
    return new Pet(id, createdAt, updatedAt, {
      tenantId: props.tenantId,
      contactId: props.contactId,
      petCategory: props.petCategory,
      name: props.name,
      breed: props.breed ?? null,
    })
  }
}

export interface PetCreateInput {
  tenantId: string
  contactId: string
  petCategory: string
  name: string
  breed?: string | null
}
