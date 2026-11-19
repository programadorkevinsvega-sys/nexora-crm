/* eslint-disable @typescript-eslint/no-explicit-any */
import { eq, and } from 'drizzle-orm'
import {
  getDb,
  mfaMethods as mfaMethodsTable,
  mfaRecoveryCodes as recoveryCodesTable,
  sessions as sessionsTable,
} from '@crm/database'
import { Session } from '../domain/entities/session.entity'
import { MfaMethod } from '../domain/entities/mfa-method.entity'
import { MfaRecoveryCode } from '../domain/entities/mfa-recovery-code.entity'
import { AuthMapper } from './auth.mapper'

export class AuthSessionsMfaDrizzleHelper {
  private static get db() { return getDb() }

  static async findSessionById(id: string): Promise<Session | null> {
    const row = await this.db.query.sessions.findFirst({
      where: eq(sessionsTable.id, id) as any,
    })
    return row ? AuthMapper.sessionToDomain(row as any) : null
  }

  static async findSessionByRefreshTokenHash(tenantId: string, hash: string): Promise<Session | null> {
    const row = await this.db.query.sessions.findFirst({
      where: and(
        eq(sessionsTable.tenantId, tenantId) as any,
        eq(sessionsTable.refreshTokenHash, hash) as any,
      ) as any,
    })
    return row ? AuthMapper.sessionToDomain(row as any) : null
  }

  static async listSessionsByUser(tenantId: string, userId: string): Promise<Session[]> {
    const rows = await this.db.query.sessions.findMany({
      where: and(
        eq(sessionsTable.tenantId, tenantId) as any,
        eq(sessionsTable.userId, userId) as any,
      ) as any,
    })
    return rows.map((r) => AuthMapper.sessionToDomain(r as any))
  }

  static async saveSession(session: Session): Promise<void> {
    await this.db.insert(sessionsTable).values({
      id: session.id,
      tenantId: session.tenantId,
      userId: session.userId,
      refreshTokenHash: session.refreshTokenHash,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceId: session.deviceId,
      expiresAt: session.expiresAt,
      isRevoked: session.isRevoked,
      createdAt: session.createdAt,
    } as any).onConflictDoUpdate({
      target: sessionsTable.id,
      set: {
        refreshTokenHash: session.refreshTokenHash,
        isRevoked: session.isRevoked,
      } as any,
    })
  }

  static async findMfaMethodsByUser(tenantId: string, userId: string): Promise<MfaMethod[]> {
    const rows = await this.db.query.mfaMethods.findMany({
      where: and(
        eq(mfaMethodsTable.tenantId, tenantId) as any,
        eq(mfaMethodsTable.userId, userId) as any,
      ) as any,
    })
    return rows.map((r) => AuthMapper.mfaMethodToDomain(r as any))
  }

  static async findMfaMethodById(id: string): Promise<MfaMethod | null> {
    const row = await this.db.query.mfaMethods.findFirst({
      where: eq(mfaMethodsTable.id, id) as any,
    })
    return row ? AuthMapper.mfaMethodToDomain(row as any) : null
  }

  static async saveMfaMethod(method: MfaMethod): Promise<void> {
    await this.db.insert(mfaMethodsTable).values({
      id: method.id,
      tenantId: method.tenantId,
      userId: method.userId,
      type: method.type,
      secret: method.secret,
      isPrimary: method.isPrimary,
      isActive: method.isActive,
      createdAt: method.createdAt,
    } as any).onConflictDoUpdate({
      target: mfaMethodsTable.id,
      set: {
        secret: method.secret,
        isPrimary: method.isPrimary,
        isActive: method.isActive,
      } as any,
    })
  }

  static async findRecoveryCodesByUser(userId: string): Promise<MfaRecoveryCode[]> {
    const rows = await this.db.query.mfaRecoveryCodes.findMany({
      where: eq(recoveryCodesTable.userId, userId) as any,
    })
    return rows.map((r) => AuthMapper.recoveryCodeToDomain(r as any))
  }

  static async findUnusedRecoveryCodesByUser(userId: string): Promise<MfaRecoveryCode[]> {
    const rows = await this.db.query.mfaRecoveryCodes.findMany({
      where: and(
        eq(recoveryCodesTable.userId, userId) as any,
        eq(recoveryCodesTable.isUsed, false) as any,
      ) as any,
    })
    return rows.map((r) => AuthMapper.recoveryCodeToDomain(r as any))
  }

  static async saveRecoveryCode(code: MfaRecoveryCode): Promise<void> {
    await this.db.insert(recoveryCodesTable).values({
      id: code.id,
      userId: code.userId,
      codeHash: code.codeHash,
      isUsed: code.isUsed,
      usedAt: code.usedAt,
      createdAt: code.createdAt,
    } as any).onConflictDoUpdate({
      target: recoveryCodesTable.id,
      set: { isUsed: code.isUsed, usedAt: code.usedAt } as any,
    })
  }

  static async saveRecoveryCodes(codes: MfaRecoveryCode[]): Promise<void> {
    for (const code of codes) {
      await this.saveRecoveryCode(code)
    }
  }

  static async deleteRecoveryCodesByUser(userId: string): Promise<void> {
    await this.db.delete(recoveryCodesTable).where(
      eq(recoveryCodesTable.userId, userId) as any,
    )
  }
}
