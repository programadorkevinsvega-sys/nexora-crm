import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { getDb, loyaltyProfiles as loyaltyProfilesTable, customerSegments as customerSegmentsTable, segmentAssignments as segmentAssignmentsTable, customerMetrics as customerMetricsTable } from '@crm/database'
import { LoyaltyRepository, SegmentRepository, MetricsRepository } from '../domain/repositories/loyalty.repository'
import { LoyaltyProfile } from '../domain/entities/loyalty-profile.entity'
import { CustomerSegment } from '../domain/entities/customer-segment.entity'
import { CustomerMetrics } from '../domain/entities/customer-metrics.entity'
import { LoyaltyMapper, SegmentMapper, MetricsMapper } from './loyalty.mapper'

@Injectable()
export class DrizzleLoyaltyRepository extends LoyaltyRepository {
  private get db() {
    return getDb()
  }

  async findProfileByContactId(tenantId: string, contactId: string): Promise<LoyaltyProfile | null> {
    const row = await this.db.query.loyaltyProfiles.findFirst({
      where: and(eq(loyaltyProfilesTable.tenantId, tenantId)!, eq(loyaltyProfilesTable.contactId, contactId)) as any,
    })
    return row ? LoyaltyMapper.toDomain(row) : null
  }

  async findProfileById(tenantId: string, id: string): Promise<LoyaltyProfile | null> {
    const row = await this.db.query.loyaltyProfiles.findFirst({
      where: and(eq(loyaltyProfilesTable.tenantId, tenantId)!, eq(loyaltyProfilesTable.id, id)) as any,
    })
    return row ? LoyaltyMapper.toDomain(row) : null
  }

  async list(tenantId: string): Promise<LoyaltyProfile[]> {
    const rows = await this.db.query.loyaltyProfiles.findMany({
      where: eq(loyaltyProfilesTable.tenantId, tenantId),
    })
    return rows.map(LoyaltyMapper.toDomain)
  }

  async updatePoints(profile: LoyaltyProfile): Promise<void> {
    const row = LoyaltyMapper.toPersistence(profile)
    await this.db.update(loyaltyProfilesTable)
      .set({
        loyaltyPointsBalance: row.loyaltyPointsBalance,
        tierLevel: row.tierLevel,
        totalLifetimeValue: row.totalLifetimeValue,
        totalPurchasesCount: row.totalPurchasesCount,
        averageOrderValue: row.averageOrderValue,
        lastPurchaseDate: row.lastPurchaseDate ?? null,
        updatedAt: row.updatedAt,
      })
      .where(and(eq(loyaltyProfilesTable.tenantId, profile.tenantId), eq(loyaltyProfilesTable.id, profile.id)))
  }

  async save(profile: LoyaltyProfile): Promise<void> {
    const row = LoyaltyMapper.toPersistence(profile)
    await this.db.insert(loyaltyProfilesTable).values(row).onConflictDoUpdate({
      target: loyaltyProfilesTable.id,
      set: row,
    })
  }
}

@Injectable()
export class DrizzleSegmentRepository extends SegmentRepository {
  private get db() {
    return getDb()
  }

  async findById(tenantId: string, id: string): Promise<CustomerSegment | null> {
    const row = await this.db.query.customerSegments.findFirst({
      where: and(eq(customerSegmentsTable.tenantId, tenantId)!, eq(customerSegmentsTable.id, id)) as any,
    })
    return row ? SegmentMapper.toDomain(row) : null
  }

  async list(tenantId: string): Promise<CustomerSegment[]> {
    const rows = await this.db.query.customerSegments.findMany({
      where: eq(customerSegmentsTable.tenantId, tenantId),
    })
    return rows.map(SegmentMapper.toDomain)
  }

  async save(segment: CustomerSegment): Promise<void> {
    const row = SegmentMapper.toPersistence(segment)
    await this.db.insert(customerSegmentsTable).values(row).onConflictDoUpdate({
      target: customerSegmentsTable.id,
      set: row,
    })
  }

  async assignContact(tenantId: string, segmentId: string, contactId: string): Promise<void> {
    await this.db.insert(segmentAssignmentsTable).values({
      id: crypto.randomUUID(),
      tenantId,
      segmentId,
      contactId,
      assignedAt: new Date(),
    }).onConflictDoNothing()
  }

  async removeContact(tenantId: string, segmentId: string, contactId: string): Promise<void> {
    await this.db.delete(segmentAssignmentsTable).where(
      and(
        eq(segmentAssignmentsTable.tenantId, tenantId),
        eq(segmentAssignmentsTable.segmentId, segmentId),
        eq(segmentAssignmentsTable.contactId, contactId),
      ),
    )
  }
}

@Injectable()
export class DrizzleMetricsRepository extends MetricsRepository {
  private get db() {
    return getDb()
  }

  async findByContactId(tenantId: string, contactId: string): Promise<CustomerMetrics | null> {
    const row = await this.db.query.customerMetrics.findFirst({
      where: and(eq(customerMetricsTable.tenantId, tenantId)!, eq(customerMetricsTable.contactId, contactId)) as any,
    })
    return row ? MetricsMapper.toDomain(row) : null
  }

  async save(metrics: CustomerMetrics): Promise<void> {
    const row = MetricsMapper.toPersistence(metrics)
    await this.db.insert(customerMetricsTable).values(row).onConflictDoUpdate({
      target: customerMetricsTable.id,
      set: row,
    })
  }
}
