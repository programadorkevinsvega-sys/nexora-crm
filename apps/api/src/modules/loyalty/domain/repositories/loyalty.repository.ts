import { LoyaltyProfile } from '../entities/loyalty-profile.entity'
import { CustomerSegment } from '../entities/customer-segment.entity'
import { CustomerMetrics } from '../entities/customer-metrics.entity'

export abstract class LoyaltyRepository {
  abstract findProfileByContactId(tenantId: string, contactId: string): Promise<LoyaltyProfile | null>
  abstract findProfileById(tenantId: string, id: string): Promise<LoyaltyProfile | null>
  abstract list(tenantId: string): Promise<LoyaltyProfile[]>
  abstract updatePoints(profile: LoyaltyProfile): Promise<void>
  abstract save(profile: LoyaltyProfile): Promise<void>
}

export abstract class SegmentRepository {
  abstract findById(tenantId: string, id: string): Promise<CustomerSegment | null>
  abstract list(tenantId: string): Promise<CustomerSegment[]>
  abstract save(segment: CustomerSegment): Promise<void>
  abstract assignContact(tenantId: string, segmentId: string, contactId: string): Promise<void>
  abstract removeContact(tenantId: string, segmentId: string, contactId: string): Promise<void>
}

export abstract class MetricsRepository {
  abstract findByContactId(tenantId: string, contactId: string): Promise<CustomerMetrics | null>
  abstract save(metrics: CustomerMetrics): Promise<void>
}
