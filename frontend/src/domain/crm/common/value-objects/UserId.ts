export class UserId {
  private constructor(public readonly value: string) {
    if (!value || typeof value !== "string") {
      throw new Error("UserId must be a non-empty string")
    }
  }

  static create(value: string): UserId {
    return new UserId(value)
  }

  equals(other: UserId): boolean {
    return this.value === other.value
  }
}
