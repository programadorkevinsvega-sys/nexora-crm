import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { TicketRepository } from "@/src/domain/crm/support-tickets/ticket.repository"
import type { Ticket, TicketUpdateInput } from "@/src/domain/crm/support-tickets/ticket.entity"

export class UpdateTicketUseCase {
  constructor(private repository: TicketRepository) {}

  async execute(id: string, data: TicketUpdateInput): Promise<Result<Ticket>> {
    try {
      const ticket = await this.repository.update(id, data)
      return success(ticket)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
