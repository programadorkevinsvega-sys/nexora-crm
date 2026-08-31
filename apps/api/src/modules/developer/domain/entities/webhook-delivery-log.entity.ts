export type DeliveryStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'RETRYING'

export class WebhookDeliveryLog {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly endpointId: string,
    readonly event: string,
    readonly payload: Record<string, unknown>,
    readonly responseStatus: number | null,
    readonly responseBody: string | null,
    readonly durationMs: number | null,
    readonly attempt: number,
    readonly status: DeliveryStatus,
    readonly deliveredAt: Date | null,
    readonly createdAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    endpointId: string
    event: string
    payload: Record<string, unknown>
  }): WebhookDeliveryLog {
    return new WebhookDeliveryLog(
      crypto.randomUUID(),
      props.tenantId,
      props.endpointId,
      props.event,
      props.payload,
      null,
      null,
      null,
      1,
      'PENDING',
      null,
      new Date(),
    )
  }
}
