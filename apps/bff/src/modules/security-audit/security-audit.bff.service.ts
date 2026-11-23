import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { getDb, securityAccessLogs, securityAnomalies } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import type {
  SecurityAccessLog,
  RecordAccessEventDto,
  SecurityAnomaly,
  ResolveAnomalyDto,
} from '@crm/contracts'

@Injectable()
export class SecurityAuditBffService {
  private readonly logger = new Logger(SecurityAuditBffService.name)
  private get db() {
    return getDb()
  }

  async listAccessLogs(tenantId: string, limit = 50): Promise<SecurityAccessLog[]> {
    let rows = await this.db
      .select()
      .from(securityAccessLogs)
      .where(eq(securityAccessLogs.tenantId, tenantId))
      .orderBy(desc(securityAccessLogs.createdAt))
      .limit(limit)

    if (rows.length === 0) {
      await this.seedDefaultAccessLogs(tenantId)
      rows = await this.db
        .select()
        .from(securityAccessLogs)
        .where(eq(securityAccessLogs.tenantId, tenantId))
        .orderBy(desc(securityAccessLogs.createdAt))
        .limit(limit)
    }

    return rows.map((r) => this.mapLog(r))
  }

  async recordAccessEvent(tenantId: string, dto: RecordAccessEventDto): Promise<SecurityAccessLog> {
    const isSuspicious = dto.loginStatus === 'BLOCKED' || (dto.country && dto.country !== 'Colombia')

    const [created] = await this.db
      .insert(securityAccessLogs)
      .values({
        tenantId,
        userId: dto.userId || null,
        ipAddress: dto.ipAddress,
        userAgent: dto.userAgent || null,
        country: dto.country || 'Colombia',
        city: dto.city || 'Bogotá',
        loginStatus: dto.loginStatus || 'SUCCESS',
        failureReason: dto.failureReason || null,
        isSuspicious: !!isSuspicious,
      })
      .returning()

    if (isSuspicious) {
      await this.db.insert(securityAnomalies).values({
        tenantId,
        userId: dto.userId || null,
        anomalyType: dto.country && dto.country !== 'Colombia' ? 'NEW_COUNTRY' : 'BRUTE_FORCE',
        severity: dto.loginStatus === 'BLOCKED' ? 'CRITICAL' : 'HIGH',
        description: `Acceso detectado desde ubicación no habitual (${dto.city}, ${dto.country}) o intento bloqueado.`,
        details: { ip: dto.ipAddress, agent: dto.userAgent },
      })
      this.logger.warn(`Security Anomaly triggered for tenant ${tenantId} from IP ${dto.ipAddress}`)
    }

    return this.mapLog(created)
  }

  async listAnomalies(tenantId: string): Promise<SecurityAnomaly[]> {
    let rows = await this.db
      .select()
      .from(securityAnomalies)
      .where(eq(securityAnomalies.tenantId, tenantId))
      .orderBy(desc(securityAnomalies.createdAt))

    if (rows.length === 0) {
      await this.seedDefaultAnomalies(tenantId)
      rows = await this.db
        .select()
        .from(securityAnomalies)
        .where(eq(securityAnomalies.tenantId, tenantId))
        .orderBy(desc(securityAnomalies.createdAt))
    }

    return rows.map((r) => this.mapAnomaly(r))
  }

  async resolveAnomaly(tenantId: string, anomalyId: string, _dto?: ResolveAnomalyDto): Promise<SecurityAnomaly> {
    const [updated] = await this.db
      .update(securityAnomalies)
      .set({
        isResolved: true,
        resolvedAt: new Date(),
      })
      .where(and(eq(securityAnomalies.id, anomalyId), eq(securityAnomalies.tenantId, tenantId)))
      .returning()

    if (!updated) throw new NotFoundException('Alerta de seguridad no encontrada')
    return this.mapAnomaly(updated)
  }

  private async seedDefaultAccessLogs(tenantId: string) {
    await this.db.insert(securityAccessLogs).values([
      { tenantId, ipAddress: '190.25.14.88', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64)', country: 'Colombia', city: 'Bogotá', loginStatus: 'SUCCESS', isSuspicious: false },
      { tenantId, ipAddress: '186.155.10.4', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', country: 'Colombia', city: 'Medellín', loginStatus: 'SUCCESS', isSuspicious: false },
    ])
  }

  private async seedDefaultAnomalies(tenantId: string) {
    await this.db.insert(securityAnomalies).values([
      {
        tenantId,
        anomalyType: 'IMPOSSIBLE_TRAVEL',
        severity: 'HIGH',
        description: 'Inicio de sesión simultáneo detectado desde Bogotá (Colombia) y Frankfurt (Alemania) en un intervalo menor a 10 minutos.',
        details: { ipA: '190.25.14.88', ipB: '85.214.132.11', deltaMinutes: 4 },
        isResolved: false,
      },
    ])
  }

  private mapLog(r: typeof securityAccessLogs.$inferSelect): SecurityAccessLog {
    return {
      ...r,
      loginStatus: r.loginStatus as SecurityAccessLog['loginStatus'],
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }
  }

  private mapAnomaly(r: typeof securityAnomalies.$inferSelect): SecurityAnomaly {
    return {
      ...r,
      anomalyType: r.anomalyType as SecurityAnomaly['anomalyType'],
      severity: r.severity as SecurityAnomaly['severity'],
      resolvedAt: r.resolvedAt ? new Date(r.resolvedAt).toISOString() : undefined,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
    }
  }
}
