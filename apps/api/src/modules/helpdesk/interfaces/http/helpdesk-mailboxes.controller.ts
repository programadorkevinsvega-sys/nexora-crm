import { Controller, Get, Post, Body, Param } from '@nestjs/common'
import {
  CreateMailboxHandler,
} from '../../application/commands/helpdesk.handlers'
import {
  GetAgentProfileHandler,
  ListMailboxesHandler,
} from '../../application/queries/helpdesk.handlers'
import {
  CreateMailboxCommand,
} from '../../application/commands/helpdesk.commands'
import {
  GetAgentProfileQuery,
  ListMailboxesQuery,
} from '../../application/queries/helpdesk.queries'
import {
  CreateMailboxDto,
} from './dto/helpdesk.dto'
import { TenantId } from '../../../../common/decorators/tenant-id.decorator'
import { MailboxMapper } from '../../infrastructure/mappers/mailbox.mapper'
import { AgentProfileMapper } from '../../infrastructure/mappers/agent-profile.mapper'

@Controller()
export class HelpdeskMailboxesController {
  constructor(
    private readonly createMailboxHandler: CreateMailboxHandler,
    private readonly getAgentProfileHandler: GetAgentProfileHandler,
    private readonly listMailboxesHandler: ListMailboxesHandler,
  ) {}

  @Get('mailboxes')
  async listMailboxes(@TenantId() tenantId: string) {
    const mailboxes = await this.listMailboxesHandler.execute(
      new ListMailboxesQuery(tenantId),
    )
    return mailboxes.map(MailboxMapper.toResponse)
  }

  @Post('mailboxes')
  async createMailbox(
    @Body() dto: CreateMailboxDto,
    @TenantId() tenantId: string,
  ) {
    const result = await this.createMailboxHandler.execute(
      new CreateMailboxCommand(tenantId, dto.name, dto.emailAddress, dto.isActive),
    )
    return result
  }

  @Get('agents/:userId')
  async getAgentProfile(
    @Param('userId') userId: string,
    @TenantId() tenantId: string,
  ) {
    const profile = await this.getAgentProfileHandler.execute(
      new GetAgentProfileQuery(tenantId, userId),
    )
    return AgentProfileMapper.toResponse(profile)
  }
}
