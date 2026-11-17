export class TenantId {
  private constructor(public readonly value: string) {
    if (!value || typeof value !== "string") {
      throw new Error("TenantId must be a non-empty string")
    }
  }

  static create(value: string): TenantId {
    return new TenantId(value)
  }

  equals(other: TenantId): boolean {
    return this.value === other.value
  }
}
