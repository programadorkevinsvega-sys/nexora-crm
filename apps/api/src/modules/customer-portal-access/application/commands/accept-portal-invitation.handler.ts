import { BadRequestException, Injectable } from '@nestjs/common'
import { createHash } from 'crypto'
import * as bcrypt from 'bcrypt'
import { CustomerPortalAccessRepository } from '../../domain/repositories/customer-portal-access.repository'

@Injectable()
export class AcceptPortalInvitationHandler {
  constructor(private readonly repository: CustomerPortalAccessRepository) {}

  async execute(token: string, password: string) {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new BadRequestException('Portal invitation token is invalid')
    if (
      password.length < 12 || Buffer.byteLength(password, 'utf8') > 72 ||
      !/[a-z]/.test(password) || !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)
    ) {
      throw new BadRequestException('Password must have 12 to 72 UTF-8 bytes and include uppercase, lowercase, number, and symbol')
    }
    const hash = createHash('sha256').update(token).digest('hex')
    const passwordHash = await bcrypt.hash(password, 12)
    const account = await this.repository.acceptInvitation(hash, passwordHash)
    return { accepted: true, ...account }
  }
}
