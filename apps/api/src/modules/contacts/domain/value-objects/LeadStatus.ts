export type LeadStatusValue = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CUSTOMER' | 'CHURNED'

export class LeadStatus {
  private static readonly VALID_STATUSES: LeadStatusValue[] = [
    'NEW',
    'CONTACTED',
    'QUALIFIED',
    'CUSTOMER',
    'CHURNED',
  ]

  readonly value: LeadStatusValue

  constructor(value: string = 'NEW') {
    const upper = value.toUpperCase() as LeadStatusValue
    if (!LeadStatus.VALID_STATUSES.includes(upper)) {
      throw new Error(`Invalid LeadStatus: ${value}`)
    }
    this.value = upper
  }

  static fromString(value?: string | null): LeadStatus {
    return new LeadStatus(value || 'NEW')
  }

  equals(other: LeadStatus): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
