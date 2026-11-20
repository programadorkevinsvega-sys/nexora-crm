import { BadRequestException, Injectable } from '@nestjs/common'
import { createHash } from 'crypto'
import * as bcrypt from 'bcrypt'
import { UserInvitationRepository } from '../../domain/repositories/user-invitation.repository'

export class PrepareInvitationAcceptanceCommand {
  constructor(
    readonly token: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly password: string,
  ) {}
}

@Injectable()
export class PrepareInvitationAcceptanceHandler {
  constructor(private readonly invitations: UserInvitationRepository) {}

  async execute(command: PrepareInvitationAcceptanceCommand) {
    if (!/^[A-Za-z0-9_-]{43}$/.test(command.token)) {
      throw new BadRequestException('Invitation token is invalid')
    }
    const firstName = command.firstName.trim()
    const lastName = command.lastName.trim()
    if (!firstName || !lastName || firstName.length > 100 || lastName.length > 100) {
      throw new BadRequestException('First name and last name are required and must be at most 100 characters')
    }
    if (
      command.password.length < 12 ||
      Buffer.byteLength(command.password, 'utf8') > 72 ||
      !/[a-z]/.test(command.password) ||
      !/[A-Z]/.test(command.password) ||
      !/[0-9]/.test(command.password) ||
      !/[^A-Za-z0-9]/.test(command.password)
    ) {
      throw new BadRequestException(
        'Password must have 12 to 72 UTF-8 bytes and include uppercase, lowercase, number, and symbol',
      )
    }

    const tokenHash = createHash('sha256').update(command.token).digest('hex')
    const invitation = await this.invitations.findByTokenHash(tokenHash)
    if (!invitation) throw new BadRequestException('Invitation token is invalid or has already been used')

    const passwordHash = await bcrypt.hash(command.password, 12)
    return this.invitations.prepareAcceptance(
      invitation.id,
      tokenHash,
      firstName,
      lastName,
      passwordHash,
    )
  }
}
