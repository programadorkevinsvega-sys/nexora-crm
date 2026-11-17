import { Injectable } from '@nestjs/common'
import { AgentRepository } from '../../domain/repositories/agent.repository'
import { MailboxRepository } from '../../domain/repositories/mailbox.repository'
import { AgentProfile } from '../../domain/entities/agent-profile.entity'
import { HelpdeskMailbox } from '../../domain/entities/mailbox.entity'
import { AgentAvailabilityChangedEvent } from '../../domain/events/helpdesk.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import {
  UpdateAgentAvailabilityCommand,
  CreateMailboxCommand,
} from './helpdesk.commands'

@Injectable()
export class UpdateAgentAvailabilityHandler {
  constructor(
    private readonly agentRepo: AgentRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateAgentAvailabilityCommand): Promise<void> {
    let profile = await this.agentRepo.findByUserId(command.tenantId, command.userId)

    if (!profile) {
      profile = AgentProfile.create({
        tenantId: command.tenantId,
        userId: command.userId,
        isAvailable: command.isAvailable,
        agentStatus: command.agentStatus,
      })
    } else {
      profile = profile.updateAvailability(command.isAvailable, command.agentStatus)
    }

    await this.agentRepo.save(profile)
    await this.outbox.publish(
      new AgentAvailabilityChangedEvent(
        profile.id,
        profile.tenantId,
        profile.userId,
        profile.isAvailable,
        profile.agentStatus,
      ),
    )
  }
}

@Injectable()
export class CreateMailboxHandler {
  constructor(
    private readonly mailboxRepo: MailboxRepository,
  ) {}

  async execute(command: CreateMailboxCommand): Promise<{ id: string }> {
    const mailbox = HelpdeskMailbox.create({
      tenantId: command.tenantId,
      name: command.name,
      emailAddress: command.emailAddress,
      isActive: command.isActive,
    })

    await this.mailboxRepo.save(mailbox)
    return { id: mailbox.id }
  }
}
