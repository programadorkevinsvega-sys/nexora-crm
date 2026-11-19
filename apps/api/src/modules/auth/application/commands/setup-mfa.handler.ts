import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConflictError } from '@crm/shared'
import * as bcrypt from 'bcrypt'
import { authenticator } from 'otplib'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { MfaMethod } from '../../domain/entities/mfa-method.entity'
import { SetupMfaCommand } from './auth.commands'
import { MfaSetupEvent } from '../../domain/events/auth.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'

@Injectable()
export class SetupMfaHandler {
  private readonly logger = new Logger(SetupMfaHandler.name)

  constructor(
    private readonly repo: AuthRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: SetupMfaCommand) {
    const existing = await this.repo.findMfaMethodsByUser(command.tenantId, command.userId)
    const existingMethod = existing.find((method) => method.type === command.type)
    if (existingMethod?.isActive) {
      throw new ConflictError(`MFA method ${command.type} already active`)
    }

    let secret: string
    let backupCode: string | undefined

    if (command.type === 'TOTP') {
      secret = authenticator.generateSecret()
    } else if (command.type === 'SMS' || command.type === 'EMAIL') {
      backupCode = Math.floor(100000 + Math.random() * 900000).toString()
      secret = await bcrypt.hash(backupCode, 10)
    } else {
      throw new BadRequestException(`Unsupported MFA type: ${command.type}`)
    }

    const method = existingMethod
      ? new MfaMethod(
          existingMethod.id,
          command.tenantId,
          command.userId,
          command.type,
          secret,
          existingMethod.isPrimary,
          false,
          new Date(),
        )
      : MfaMethod.create({
          tenantId: command.tenantId,
          userId: command.userId,
          type: command.type,
          secret,
          isPrimary: existing.length === 0,
        })
    await this.repo.saveMfaMethod(method)
    await this.outbox.publish(new MfaSetupEvent(command.userId, command.type))

    this.logger.log(`MFA ${command.type} set up for user ${command.userId}`)

    return {
      methodId: method.id,
      secret: command.type === 'TOTP' ? secret : undefined,
      qrCode: command.type === 'TOTP' ? authenticator.keyuri(command.userId, 'CRM', secret) : undefined,
      backupCode: command.type === 'SMS' || command.type === 'EMAIL' ? backupCode : undefined,
    }
  }
}
