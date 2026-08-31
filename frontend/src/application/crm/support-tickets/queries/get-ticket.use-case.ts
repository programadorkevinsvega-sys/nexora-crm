import type { Result } from "@/src/domain/crm/common/results/result"
import { success, failure } from "@/src/domain/crm/common/results/result"
import type { TicketRepository } from "@/src/domain/crm/support-tickets/ticket.repository"
import type { Ticket } from "@/src/domain/crm/support-tickets/ticket.entity"

export class GetTicketUseCase {
  constructor(private repository: TicketRepository) {}

  async execute(id: string): Promise<Result<Ticket | null>> {
    try {
      const ticket = await this.repository.getById(id)
      return success(ticket)
    } catch (error) {
      return failure(error instanceof Error ? error : new Error(String(error)))
    }
  }
}
