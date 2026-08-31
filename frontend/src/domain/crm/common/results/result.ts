export type Result<T, E = Error> = Success<T> | Failure<E>

export class Success<T> {
  readonly success = true as const
  constructor(public readonly value: T) {}
}

export class Failure<E> {
  readonly success = false as const
  constructor(public readonly error: E) {}
}

export function success<T>(value: T): Success<T> {
  return new Success(value)
}

export function failure<E>(error: E): Failure<E> {
  return new Failure(error)
}
