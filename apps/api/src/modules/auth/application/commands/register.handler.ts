import { Injectable, ConflictException, BadRequestException, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import { eq, ilike, or } from 'drizzle-orm'
import { getDb, tenants as tenantsTable, users as usersTable, naturalPersonProfiles } from '@crm/database'
import { RegisterCommand } from './auth.commands'
import { AuthRepository } from '../../domain/repositories/auth.repository'
import { Session } from '../../domain/entities/session.entity'

@Injectable()
export class RegisterHandler {
  private readonly logger = new Logger(RegisterHandler.name)

  constructor(
    private readonly repo: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  private get db() {
    return getDb()
  }

  async execute(command: RegisterCommand) {
    const cleanEmail = command.email.trim().toLowerCase()
    const cleanCompany = command.company.trim()
    const cleanName = command.name.trim()

    if (!cleanEmail || !command.password || !cleanCompany || !cleanName) {
      throw new BadRequestException('Todos los campos son obligatorios')
    }

    // 1. Validar unicidad global de correo electrónico
    const existingUser = await this.db.query.users.findFirst({
      where: eq(usersTable.email, cleanEmail) as any,
    })

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya se encuentra registrado en la plataforma')
    }

    // 2. Validar unicidad de nombre de empresa / inquilino
    const existingTenant = await this.db.query.tenants.findFirst({
      where: ilike(tenantsTable.name, cleanCompany) as any,
    })

    if (existingTenant) {
      throw new ConflictException('El nombre de la empresa ya se encuentra registrado')
    }

    // 3. Crear nuevo inquilino (Tenant)
    const tenantId = randomUUID()
    const userId = randomUUID()
    const profileId = randomUUID()

    await this.db.insert(tenantsTable).values({
      id: tenantId,
      name: cleanCompany,
      industryType: 'General',
      ownerUserId: userId,
      status: 'ACTIVE',
      timezone: 'America/Bogota',
      currencyCode: 'USD',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // 4. Crear perfil de persona natural
    const nameParts = cleanName.split(' ')
    const firstName = nameParts[0] || 'Usuario'
    const lastName = nameParts.slice(1).join(' ') || 'Admin'

    await this.db.insert(naturalPersonProfiles).values({
      id: profileId,
      tenantId,
      firstName,
      lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // 5. Crear usuario con hash de contraseña
    const passwordHash = await bcrypt.hash(command.password, 10)

    await this.db.insert(usersTable).values({
      id: userId,
      tenantId,
      email: cleanEmail,
      passwordHash,
      profileId,
      profileType: 'NATURAL_PERSON',
      status: 'ACTIVE',
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    // 6. Generar sesión y JWT
    const sessionId = randomUUID()
    const refreshToken = randomUUID()
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    const session = Session.create({
      tenantId,
      userId,
      refreshTokenHash,
      ipAddress: command.ipAddress ?? undefined,
      userAgent: command.userAgent ?? undefined,
      expiresAt,
    })

    await this.repo.saveSession(session)

    const tokenPayload = {
      sub: userId,
      tenantId,
      email: cleanEmail,
      sessionId: session.id,
    }

    const accessToken = this.jwtService.sign(tokenPayload, { expiresIn: '7d' })

    this.logger.log(`Nuevo usuario y empresa registrados con éxito: ${cleanEmail} (${cleanCompany})`)

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      sessionId: session.id,
      tenantId,
      userId,
      user: {
        id: userId,
        tenantId,
        email: cleanEmail,
        name: cleanName,
        company: cleanCompany,
      },
    }
  }
}
