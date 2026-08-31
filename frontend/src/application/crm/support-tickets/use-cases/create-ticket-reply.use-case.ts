import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { TicketReply, TicketReplyCreateInput } from "@/src/domain/crm/support-tickets/ticket-reply.entity"

export interface TicketReplyRepository {
  create(data: TicketReplyCreateInput): Promise<TicketReply>
}

export class CreateTicketReplyUseCase {
  constructor(private repository: TicketReplyRepository) {}

  async execute(data: TicketReplyCreateInput): Promise<Result<TicketReply>> {
    try {
      const reply = await this.repository.create(data)
      return success(reply)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
