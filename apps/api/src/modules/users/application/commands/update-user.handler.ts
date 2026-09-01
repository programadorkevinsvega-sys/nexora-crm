import { Injectable } from '@nestjs/common'
import { NotFoundError, ConflictError } from '@crm/shared'
import { UserRepository } from '../../domain/repositories/user.repository'
import { UpdateUserCommand } from './user.commands'
import { UserUpdatedEvent } from '../../domain/events/user.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class UpdateUserHandler {
  constructor(
    private readonly repo: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateUserCommand): Promise<void> {
    const user = await this.repo.findById(command.tenantId, command.id)
    if (!user) throw new NotFoundError('User', command.id)

    if (command.email && command.email !== user.email) {
      const existing = await this.repo.findByEmail(command.tenantId, command.email)
      if (existing) throw new ConflictError('Email already in use')
    }

    const updated = user.update({
      email: command.email,
      passwordHash: command.passwordHash,
      status: command.status,
      managerId: command.managerId,
    })

    await this.repo.save(updated)
    await this.outbox.publish(new UserUpdatedEvent(updated.id))
  }
}
