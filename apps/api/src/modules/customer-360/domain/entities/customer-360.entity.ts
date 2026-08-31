import { Customer360Metrics, CustomerTimelineItem } from '@crm/contracts'

export class Customer360 {
  constructor(
    readonly contactId: string,
    readonly tenantId: string,
    readonly firstName: string,
    readonly lastName: string | null,
    readonly email: string | null,
    readonly phone: string | null,
    readonly jobTitle: string | null,
    readonly companyName: string | null,
    readonly companyId: string | null,
    readonly metrics: Customer360Metrics,
    readonly timeline: CustomerTimelineItem[],
  ) {}
}
