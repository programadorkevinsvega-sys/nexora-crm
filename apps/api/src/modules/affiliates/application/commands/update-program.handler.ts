import { Injectable } from '@nestjs/common'
import { AffiliateProgramRepository } from '../../domain/repositories/affiliate-program.repository'
import { UpdateProgramCommand } from './affiliate.commands'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { NotFoundError } from '@crm/shared'

@Injectable()
export class UpdateProgramHandler {
  constructor(
    private readonly repo: AffiliateProgramRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateProgramCommand): Promise<void> {
    const program = await this.repo.findById(command.tenantId, command.id)
    if (!program) throw new NotFoundError('Affiliate Program', command.id)

    const updated = program.update(command)
    await this.repo.save(updated)
  }
}
