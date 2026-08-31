export abstract class DomainError extends Error {
  abstract code: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class NotFoundError extends DomainError {
  code = 'NOT_FOUND'
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`)
  }
}

export class ConflictError extends DomainError {
  code = 'CONFLICT'
  constructor(message: string) {
    super(message)
  }
}

export class UnauthorizedError extends DomainError {
  code = 'UNAUTHORIZED'
  constructor(message = 'Unauthorized') {
    super(message)
  }
}

export class ForbiddenError extends DomainError {
  code = 'FORBIDDEN'
  constructor(message = 'Forbidden') {
    super(message)
  }
}

export class ConfigError extends DomainError {
  code = 'CONFIG_ERROR'
  constructor(key: string) {
    super(`${key} is required`)
  }
}
