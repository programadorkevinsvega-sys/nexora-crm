import { eq, and, desc } from 'drizzle-orm'
import { getDb, webhookEndpoints, webhookDeliveryLogs } from '@crm/database'
import { WebhookEndpoint, WebhookEvent } from '../domain/entities/webhook-endpoint.entity'
import { WebhookDeliveryLog, DeliveryStatus } from '../domain/entities/webhook-delivery-log.entity'

export class DeveloperWebhooksDrizzleHelper {
  private static get db() { return getDb() }

  static async createWebhookEndpoint(
    tenantId: string,
    name: string,
    url: string,
    events: WebhookEvent[],
  ): Promise<WebhookEndpoint> {
    const ep = WebhookEndpoint.create({ tenantId, name, url, events })
    await this.db.insert(webhookEndpoints).values({
      id: ep.id,
      tenantId: ep.tenantId,
      name: ep.name,
      url: ep.url,
      secret: ep.secret,
      events: ep.events,
      isActive: ep.isActive,
      createdAt: ep.createdAt,
      updatedAt: ep.updatedAt,
    })
    return ep
  }

  static async listWebhookEndpoints(tenantId: string): Promise<WebhookEndpoint[]> {
    const rows = await this.db
      .select()
      .from(webhookEndpoints)
      .where(eq(webhookEndpoints.tenantId, tenantId))
      .orderBy(desc(webhookEndpoints.createdAt))

    return rows.map(
      (r) =>
        new WebhookEndpoint(
          r.id,
          r.tenantId,
          r.name,
          r.url,
          r.secret,
          r.events as WebhookEvent[],
          r.isActive,
          r.createdAt,
          r.updatedAt,
        ),
    )
  }

  static async deleteWebhookEndpoint(tenantId: string, id: string): Promise<void> {
    await this.db
      .delete(webhookEndpoints)
      .where(and(eq(webhookEndpoints.tenantId, tenantId), eq(webhookEndpoints.id, id)))
  }

  static async getEndpointsForEvent(
    tenantId: string,
    event: WebhookEvent,
  ): Promise<WebhookEndpoint[]> {
    const eps = await this.listWebhookEndpoints(tenantId)
    return eps.filter((ep) => ep.isActive && ep.listensTo(event))
  }

  static async logDelivery(log: WebhookDeliveryLog): Promise<void> {
    await this.db.insert(webhookDeliveryLogs).values({
      id: log.id,
      tenantId: log.tenantId,
      endpointId: log.endpointId,
      event: log.event,
      payload: log.payload,
      attempt: log.attempt,
      status: log.status,
      createdAt: log.createdAt,
    })
  }

  static async updateDeliveryLog(
    id: string,
    status: DeliveryStatus,
    responseStatus?: number,
    responseBody?: string,
    durationMs?: number,
  ): Promise<void> {
    await this.db
      .update(webhookDeliveryLogs)
      .set({
        status,
        responseStatus: responseStatus ?? null,
        responseBody: responseBody ?? null,
        durationMs: durationMs ?? null,
        deliveredAt: status === 'SUCCESS' ? new Date() : null,
      })
      .where(eq(webhookDeliveryLogs.id, id))
  }

  static async listDeliveryLogs(
    tenantId: string,
    endpointId: string,
  ): Promise<WebhookDeliveryLog[]> {
    const rows = await this.db
      .select()
      .from(webhookDeliveryLogs)
      .where(
        and(
          eq(webhookDeliveryLogs.tenantId, tenantId),
          eq(webhookDeliveryLogs.endpointId, endpointId),
        ),
      )
      .orderBy(desc(webhookDeliveryLogs.createdAt))
      .limit(50)

    return rows.map(
      (r) =>
        new WebhookDeliveryLog(
          r.id,
          r.tenantId,
          r.endpointId,
          r.event,
          r.payload as Record<string, unknown>,
          r.responseStatus,
          r.responseBody,
          r.durationMs,
          r.attempt,
          r.status as DeliveryStatus,
          r.deliveredAt,
          r.createdAt,
        ),
    )
  }
}
