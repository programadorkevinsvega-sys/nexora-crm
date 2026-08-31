import { Injectable, Logger } from '@nestjs/common'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { IpRestriction } from '../../domain/entities/ip-restriction.entity'
import { CreateIpRestrictionCommand } from './auth.commands'

@Injectable()
export class CreateIpRestrictionHandler {
  private readonly logger = new Logger(CreateIpRestrictionHandler.name)

  constructor(private readonly repo: AuthRepository) {}

  async execute(command: CreateIpRestrictionCommand) {
    const restriction = IpRestriction.create({
      tenantId: command.tenantId,
      userId: command.userId,
      ipAddress: command.ipAddress,
      type: command.type,
      description: command.description,
    })
    await this.repo.saveIpRestriction(restriction)
    this.logger.log(`IP restriction ${command.type} for ${command.ipAddress} created`)
    return { id: restriction.id }
  }
}
