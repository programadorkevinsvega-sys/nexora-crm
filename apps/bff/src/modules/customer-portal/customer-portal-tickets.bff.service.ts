import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import type { SupportTicket, TicketReply } from '@crm/contracts'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator'
import { resolveCustomerPortalIdentity } from './customer-portal.identity'

export interface PortalTicketReply {
  id: string
  ticketId: string
  authorType: string
  message: string
  createdAt: string
}

@Injectable()
export class CustomerPortalTicketsBffService {
  constructor(private readonly api: ApiCoreGrpcClient) {}

  private async getOwnedTicket(user: AuthenticatedUser | undefined, ticketId: string) {
    const identity = resolveCustomerPortalIdentity(user)
    const ticket = await this.api.getTicket(identity.tenantId, ticketId)

    if (!ticket.contactId || ticket.contactId !== identity.contactId) {
      throw new NotFoundException('Ticket not found')
    }

    return { identity, ticket }
  }

  private toPortalTicket(ticket: SupportTicket) {
    return {
      id: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    }
  }

  private toPortalReply(reply: TicketReply): PortalTicketReply {
    return {
      id: reply.id,
      ticketId: reply.ticketId,
      authorType: reply.authorType,
      message: reply.message,
      createdAt: reply.createdAt,
    }
  }

  async getTicket(user: AuthenticatedUser | undefined, ticketId: string) {
    const { ticket } = await this.getOwnedTicket(user, ticketId)
    return this.toPortalTicket(ticket)
  }

  async listReplies(user: AuthenticatedUser | undefined, ticketId: string): Promise<PortalTicketReply[]> {
    const { identity } = await this.getOwnedTicket(user, ticketId)
    const result = await this.api.getTicketReplies(identity.tenantId, ticketId)

    return result.data
      .filter((reply) => reply.isInternalNote !== true)
      .map((reply) => this.toPortalReply(reply))
  }

  async addReply(user: AuthenticatedUser | undefined, ticketId: string, message: string): Promise<PortalTicketReply> {
    const { identity, ticket } = await this.getOwnedTicket(user, ticketId)
    if (ticket.status === 'CLOSED') {
      throw new ConflictException('This ticket is closed. Please create a new support request.')
    }

    const accountId = user?.sub || user?.userId
    if (!accountId) throw new NotFoundException('Customer portal account not found')

    const reply = await this.api.addTicketReply({
      tenantId: identity.tenantId,
      ticketId,
      authorType: 'CUSTOMER',
      authorId: accountId,
      message: message.trim(),
      isInternalNote: false,
    })

    return this.toPortalReply(reply)
  }
}
