import { Call } from '../entities/call.entity'

export interface CallFilter {
  contactId?: string
  cursor?: string
  limit: number
}

export interface PaginatedCalls {
  data: Call[]
  nextCursor: string | null
}

export abstract class CallRepository {
  abstract findById(tenantId: string, id: string): Promise<Call | null>
  abstract list(tenantId: string, filter: CallFilter): Promise<PaginatedCalls>
  abstract save(call: Call): Promise<void>
}
