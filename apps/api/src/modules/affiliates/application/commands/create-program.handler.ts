import { Injectable } from '@nestjs/common'
import { AffiliateProgramRepository } from '../../domain/repositories/affiliate-program.repository'
import { AffiliateProgram } from '../../domain/entities/affiliate-program.entity'
import { CreateProgramCommand } from './affiliate.commands'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class CreateProgramHandler {
  constructor(
    private readonly repo: AffiliateProgramRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateProgramCommand): Promise<{ id: string }> {
    const program = AffiliateProgram.create({
      tenantId: command.tenantId,
      name: command.name,
      commissionType: command.commissionType,
      commissionValue: command.commissionValue,
      cookieDurationDays: command.cookieDurationDays,
      isMultiLevel: command.isMultiLevel,
      maxMlmLevels: command.maxMlmLevels,
      isActive: command.isActive,
    })

    await this.repo.save(program)

    return { id: program.id }
  }
}
