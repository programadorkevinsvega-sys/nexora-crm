import type { PaginatedResult } from "../common/results/paginated-result"
import type { CustomerSegment, SegmentCreateInput } from "./customer-segment.entity"

export interface CustomerSegmentRepository {
  list(): Promise<PaginatedResult<CustomerSegment>>
  create(data: SegmentCreateInput): Promise<CustomerSegment>
  assignToSegment(segmentId: string, contactId: string): Promise<void>
}
