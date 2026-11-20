import { ConflictException, Injectable } from '@nestjs/common'
import { randomBytes, randomUUID, createHash } from 'crypto'
import { UserRepository } from '../../domain/repositories/user.repository'
import { UserInvitation } from '../../domain/entities/user-invitation.entity'
import { UserInvitationRepository } from '../../domain/repositories/user-invitation.repository'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class CreateInvitationCommand {
  constructor(
    readonly tenantId: string,
    readonly email: string,
    readonly roleId: string,
    readonly invitedBy: string,
  ) {}
}

@Injectable()
export class CreateInvitationHandler {
  constructor(
    private readonly invitations: UserInvitationRepository,
    private readonly users: UserRepository,
  ) {}

  async execute(command: CreateInvitationCommand) {
    const email = command.email.trim().toLowerCase()
    if (!EMAIL_PATTERN.test(email)) throw new ConflictException('A valid email address is required')
    if (await this.users.findByEmail(command.tenantId, email)) {
      throw new ConflictException('This email already belongs to a member of the tenant')
    }

    const token = randomBytes(32).toString('base64url')
    const now = new Date()
    const invitation = new UserInvitation(
      randomUUID(),
      command.tenantId,
      email,
      command.roleId,
      command.invitedBy,
      createHash('sha256').update(token).digest('hex'),
      'PENDING',
      new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      null,
      null,
      null,
      now,
      now,
    )

    try {
      await this.invitations.create(invitation)
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new ConflictException('An active invitation already exists for this email in the tenant')
      }
      throw error
    }

    return { invitation: invitation.toPublicResponse(), token }
  }
}
