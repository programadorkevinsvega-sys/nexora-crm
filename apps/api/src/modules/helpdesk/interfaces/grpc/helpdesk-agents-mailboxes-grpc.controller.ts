import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  UpdateAgentAvailabilityHandler,
  CreateMailboxHandler,
} from '../../application/commands/helpdesk.handlers'
import {
  GetAgentProfileHandler,
  ListMailboxesHandler,
} from '../../application/queries/helpdesk.handlers'
import {
  UpdateAgentAvailabilityCommand,
  CreateMailboxCommand,
} from '../../application/commands/helpdesk.commands'
import {
  GetAgentProfileQuery,
  ListMailboxesQuery,
} from '../../application/queries/helpdesk.queries'
import { MailboxMapper } from '../../infrastructure/mappers/mailbox.mapper'
import { AgentProfileMapper } from '../../infrastructure/mappers/agent-profile.mapper'

@Controller()
export class HelpdeskAgentsMailboxesGrpcController {
  constructor(
    private readonly listMailboxesHandler: ListMailboxesHandler,
    private readonly createMailboxHandler: CreateMailboxHandler,
    private readonly getAgentProfileHandler: GetAgentProfileHandler,
    private readonly updateAgentAvailabilityHandler: UpdateAgentAvailabilityHandler,
  ) {}

  @GrpcMethod('HelpdeskService', 'ListMailboxes')
  async listMailboxes(data: { tenantId: string }) {
    const mailboxes = await this.listMailboxesHandler.execute(
      new ListMailboxesQuery(data.tenantId),
    )
    return {
      jsonItems: mailboxes.map((m) => JSON.stringify(MailboxMapper.toResponse(m))),
    }
  }

  @GrpcMethod('HelpdeskService', 'CreateMailbox')
  async createMailbox(data: {
    tenantId: string
    name: string
    emailAddress: string
    isActive?: boolean
  }) {
    const result = await this.createMailboxHandler.execute(
      new CreateMailboxCommand(data.tenantId, data.name, data.emailAddress, data.isActive),
    )
    return { id: result.id }
  }

  @GrpcMethod('HelpdeskService', 'GetAgentProfile')
  async getAgentProfile(data: { tenantId: string; userId: string }) {
    const profile = await this.getAgentProfileHandler.execute(
      new GetAgentProfileQuery(data.tenantId, data.userId),
    )
    return { json: JSON.stringify(AgentProfileMapper.toResponse(profile)) }
  }

  @GrpcMethod('HelpdeskService', 'UpdateAgentAvailability')
  async updateAgentAvailability(data: {
    tenantId: string
    userId: string
    isAvailable: boolean
    agentStatus?: string
  }) {
    await this.updateAgentAvailabilityHandler.execute(
      new UpdateAgentAvailabilityCommand(data.tenantId, data.userId, data.isAvailable, data.agentStatus),
    )
    return {}
  }
}
