export class ContactEmail {
  readonly value: string

  constructor(value: string) {
    const trimmed = value.trim().toLowerCase()
    if (!ContactEmail.isValid(trimmed)) {
      throw new Error(`Invalid email address: ${value}`)
    }
    this.value = trimmed
  }

  static create(value?: string | null): ContactEmail | null {
    if (!value || value.trim() === '') return null
    return new ContactEmail(value)
  }

  static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  equals(other: ContactEmail): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
