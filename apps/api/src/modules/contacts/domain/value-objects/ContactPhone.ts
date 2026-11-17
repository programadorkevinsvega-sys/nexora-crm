export class ContactPhone {
  readonly value: string

  constructor(value: string) {
    const trimmed = value.trim()
    if (trimmed.length < 3 || trimmed.length > 30) {
      throw new Error(`Invalid phone number length: ${value}`)
    }
    this.value = trimmed
  }

  static create(value?: string | null): ContactPhone | null {
    if (!value || value.trim() === '') return null
    return new ContactPhone(value)
  }

  equals(other: ContactPhone): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
