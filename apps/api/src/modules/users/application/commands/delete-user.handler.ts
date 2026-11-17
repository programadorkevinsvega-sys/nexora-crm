import { Injectable } from '@nestjs/common'
import { NotFoundError } from '@crm/shared'
import { UserRepository } from '../../domain/repositories/user.repository'
import { DeleteUserCommand } from './user.commands'
import { UserDeletedEvent } from '../../domain/events/user.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class DeleteUserHandler {
  constructor(
    private readonly repo: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.repo.findById(command.tenantId, command.id)
    if (!user) throw new NotFoundError('User', command.id)

    const updated = user.update({ status: 'INACTIVE' })
    await this.repo.save(updated)
    await this.outbox.publish(new UserDeletedEvent(updated.id))
  }
}
