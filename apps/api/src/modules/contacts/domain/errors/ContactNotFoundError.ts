import { NotFoundError } from '@crm/shared'

export class ContactNotFoundError extends NotFoundError {
  constructor(id: string) {
    super('Contact', id)
  }
}
