import { Injectable, Logger } from '@nestjs/common'
import { getDb, deduplicationRules, deduplicationAuditLogs, contacts, companies } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import type {
  DeduplicationRule,
  CreateDeduplicationRuleDto,
  DuplicateGroup,
  MergeRecordsDto,
  DeduplicationAuditLog,
  DeduplicationEntityType,
} from '@crm/contracts'

@Injectable()
export class DeduplicationBffService {
  private readonly logger = new Logger(DeduplicationBffService.name)
  private get db() {
    return getDb()
  }

  async listRules(tenantId: string): Promise<DeduplicationRule[]> {
    let rows = await this.db.select().from(deduplicationRules).where(eq(deduplicationRules.tenantId, tenantId)).orderBy(desc(deduplicationRules.createdAt))
    if (rows.length === 0) {
      await this.seedDefaultRules(tenantId)
      rows = await this.db.select().from(deduplicationRules).where(eq(deduplicationRules.tenantId, tenantId)).orderBy(desc(deduplicationRules.createdAt))
    }
    return rows.map((r) => this.mapRule(r))
  }

  async createRule(tenantId: string, dto: CreateDeduplicationRuleDto): Promise<DeduplicationRule> {
    const [created] = await this.db.insert(deduplicationRules).values({
      tenantId,
      name: dto.name,
      entityType: dto.entityType,
      matchFields: dto.matchFields,
      matchType: dto.matchType || 'EXACT',
      similarityThreshold: dto.similarityThreshold || 85,
      autoMergeEnabled: dto.autoMergeEnabled ?? false,
      isActive: dto.isActive ?? true,
    }).returning()
    return this.mapRule(created)
  }

  async scanDuplicates(tenantId: string, entityType: DeduplicationEntityType): Promise<DuplicateGroup[]> {
    if (entityType === 'CONTACT') {
      const allContacts = await this.db.select().from(contacts).where(eq(contacts.tenantId, tenantId))
      const emailMap = new Map<string, any[]>()
      for (const c of allContacts) {
        if (!c.email) continue
        const norm = c.email.toLowerCase().trim()
        if (!emailMap.has(norm)) emailMap.set(norm, [])
        emailMap.get(norm)!.push(c)
      }
      return Array.from(emailMap.entries()).filter(([_, m]) => m.length > 1).map(([email, matches]) => ({
        matchField: 'email',
        matchValue: email,
        similarityScore: 100,
        records: matches.map((m) => ({
          id: m.id,
          name: `${m.firstName} ${m.lastName}`.trim(),
          email: m.email || undefined,
          phone: m.phone || undefined,
          createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
        })),
      }))
    }

    const allCompanies = await this.db.select().from(companies).where(eq(companies.tenantId, tenantId))
    const domainMap = new Map<string, any[]>()
    for (const c of allCompanies) {
      if (!c.website) continue
      const norm = c.website.toLowerCase().trim()
      if (!domainMap.has(norm)) domainMap.set(norm, [])
      domainMap.get(norm)!.push(c)
    }
    return Array.from(domainMap.entries()).filter(([_, m]) => m.length > 1).map(([domain, matches]) => ({
      matchField: 'website',
      matchValue: domain,
      similarityScore: 100,
      records: matches.map((m) => ({
        id: m.id,
        name: m.name,
        companyName: m.name,
        createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : new Date().toISOString(),
      })),
    }))
  }

  async mergeRecords(tenantId: string, dto: MergeRecordsDto, userId?: string): Promise<DeduplicationAuditLog> {
    const [log] = await this.db.insert(deduplicationAuditLogs).values({
      tenantId,
      entityType: dto.entityType,
      masterRecordId: dto.masterRecordId,
      mergedRecordId: dto.duplicateRecordId,
      matchedByField: dto.matchedByField,
      mergedDataSnapshot: { timestamp: new Date().toISOString() },
      mergedByUserId: userId || null,
    }).returning()

    if (dto.entityType === 'CONTACT') {
      await this.db.delete(contacts).where(and(eq(contacts.id, dto.duplicateRecordId), eq(contacts.tenantId, tenantId)))
    } else {
      await this.db.delete(companies).where(and(eq(companies.id, dto.duplicateRecordId), eq(companies.tenantId, tenantId)))
    }
    this.logger.log(`Merged ${dto.entityType} ${dto.duplicateRecordId} into ${dto.masterRecordId}`)
    return this.mapAuditLog(log)
  }

  async listAuditLogs(tenantId: string): Promise<DeduplicationAuditLog[]> {
    const rows = await this.db.select().from(deduplicationAuditLogs).where(eq(deduplicationAuditLogs.tenantId, tenantId)).orderBy(desc(deduplicationAuditLogs.mergedAt))
    return rows.map((r) => this.mapAuditLog(r))
  }

  private async seedDefaultRules(tenantId: string) {
    await this.db.insert(deduplicationRules).values([
      { tenantId, name: 'Detección Estricta por Correo', entityType: 'CONTACT', matchFields: ['email'], matchType: 'EXACT', similarityThreshold: 100, autoMergeEnabled: false, isActive: true },
      { tenantId, name: 'Detección de Empresas por Dominio', entityType: 'COMPANY', matchFields: ['domain'], matchType: 'EXACT', similarityThreshold: 100, autoMergeEnabled: false, isActive: true },
    ])
  }

  private mapRule(r: any): DeduplicationRule {
    return {
      ...r,
      entityType: r.entityType as any,
      matchType: r.matchType as any,
      matchFields: Array.isArray(r.matchFields) ? r.matchFields : ['email'],
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }

  private mapAuditLog(r: any): DeduplicationAuditLog {
    return {
      ...r,
      entityType: r.entityType as any,
      mergedAt: r.mergedAt ? new Date(r.mergedAt).toISOString() : new Date().toISOString(),
    }
  }
}
