export class PasswordPolicy {
  constructor(
    readonly tenantId: string,
    readonly minLength: number,
    readonly requireUppercase: boolean,
    readonly requireNumbers: boolean,
    readonly requireSymbols: boolean,
    readonly expireDays: number,
    readonly preventReuseLastN: number,
    readonly updatedAt: Date,
  ) {}

  static default(tenantId: string): PasswordPolicy {
    return new PasswordPolicy(tenantId, 8, true, true, true, 90, 3, new Date())
  }

  update(props: Partial<Omit<PasswordPolicy, 'tenantId' | 'updatedAt'>>): PasswordPolicy {
    return new PasswordPolicy(
      this.tenantId,
      props.minLength ?? this.minLength,
      props.requireUppercase ?? this.requireUppercase,
      props.requireNumbers ?? this.requireNumbers,
      props.requireSymbols ?? this.requireSymbols,
      props.expireDays ?? this.expireDays,
      props.preventReuseLastN ?? this.preventReuseLastN,
      new Date(),
    )
  }

  validate(password: string): string[] {
    const errors: string[] = []
    if (password.length < this.minLength) {
      errors.push(`Password must be at least ${this.minLength} characters`)
    }
    if (this.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    if (this.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    if (this.requireSymbols && !/[^A-Za-z0-9]/.test(password)) {
      errors.push('Password must contain at least one symbol')
    }
    return errors
  }
}
