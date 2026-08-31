export class Result<T, E extends Error = Error> {
  private constructor(
    private readonly _value: T | null,
    private readonly _error: E | null,
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(value, null)
  }

  static fail<T, E extends Error>(error: E): Result<T, E> {
    return new Result<T, E>(null, error)
  }

  get isOk(): boolean {
    return this._error === null
  }

  get isFail(): boolean {
    return this._error !== null
  }

  get value(): T | null {
    return this._value
  }

  get error(): E | null {
    return this._error
  }

  unwrap(): T {
    if (this._error) throw this._error
    return this._value!
  }

  unwrapOr(defaultValue: T): T {
    if (this._error) return defaultValue
    return this._value!
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isFail) return Result.fail<U, E>(this._error!)
    return Result.ok(fn(this._value!)) as Result<U, E>
  }
}
