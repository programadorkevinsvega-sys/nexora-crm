import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { TicketRepository } from "@/src/domain/crm/support-tickets/ticket.repository"
import type { Ticket, TicketCreateInput } from "@/src/domain/crm/support-tickets/ticket.entity"

export class CreateTicketUseCase {
  constructor(private repository: TicketRepository) {}

  async execute(data: TicketCreateInput): Promise<Result<Ticket>> {
    try {
      const ticket = await this.repository.create(data)
      return success(ticket)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
