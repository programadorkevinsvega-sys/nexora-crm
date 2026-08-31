import { Injectable } from '@nestjs/common'
import { eq, and, desc } from 'drizzle-orm'
import {
  getDb,
  apiKeys,
  webhookEndpoints,
  webhookDeliveryLogs,
} from '@crm/database'
import { DeveloperRepository } from '../domain/repositories/developer.repository'
import { ApiKey, ApiKeyScope } from '../domain/entities/api-key.entity'
import { WebhookEndpoint, WebhookEvent } from '../domain/entities/webhook-endpoint.entity'
import { WebhookDeliveryLog, DeliveryStatus } from '../domain/entities/webhook-delivery-log.entity'

@Injectable()
export class DrizzleDeveloperRepository extends DeveloperRepository {
  private get db() {
    return getDb()
  }

  async createApiKey(
    tenantId: string,
    name: string,
    scopes: ApiKeyScope[],
    rawKey: string,
    expiresAt?: Date | null,
  ): Promise<ApiKey> {
    const key = ApiKey.create({ tenantId, name, scopes, rawKey, expiresAt })
    await this.db.insert(apiKeys).values({
      id: key.id,
      tenantId: key.tenantId,
      name: key.name,
      keyHash: key.keyHash,
      keyPrefix: key.keyPrefix,
      scopes: key.scopes,
      isActive: key.isActive,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    })
    return key
  }

  async listApiKeys(tenantId: string): Promise<ApiKey[]> {
    const rows = await this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.tenantId, tenantId))
      .orderBy(desc(apiKeys.createdAt))

    return rows.map(
      (r) =>
        new ApiKey(
          r.id,
          r.tenantId,
          r.name,
          r.keyHash,
          r.keyPrefix,
          r.scopes as ApiKeyScope[],
          r.isActive,
          r.lastUsedAt,
          r.expiresAt,
          r.createdAt,
          r.updatedAt,
        ),
    )
  }

  async revokeApiKey(tenantId: string, id: string): Promise<void> {
    await this.db
      .update(apiKeys)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(apiKeys.tenantId, tenantId), eq(apiKeys.id, id)))
  }

  async deleteApiKey(tenantId: string, id: string): Promise<void> {
    await this.db
      .delete(apiKeys)
      .where(and(eq(apiKeys.tenantId, tenantId), eq(apiKeys.id, id)))
  }


  async validateApiKey(
    rawKey: string,
  ): Promise<
    | { valid: true; tenantId: string; scopes: ApiKeyScope[]; keyId: string }
    | { valid: false }
  > {
    const hash = ApiKey.hashKey(rawKey)
    const rows = await this.db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.keyHash, hash), eq(apiKeys.isActive, true)))
      .limit(1)

    if (rows.length === 0) return { valid: false }
    const row = rows[0]

    if (row.expiresAt && new Date() > new Date(row.expiresAt)) {
      return { valid: false }
    }

    return {
      valid: true,
      tenantId: row.tenantId,
      scopes: row.scopes as ApiKeyScope[],
      keyId: row.id,
    }
  }

  async markKeyUsed(keyId: string): Promise<void> {
    await this.db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, keyId))
  }

  async createWebhookEndpoint(
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

  async listWebhookEndpoints(tenantId: string): Promise<WebhookEndpoint[]> {
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

  async deleteWebhookEndpoint(tenantId: string, id: string): Promise<void> {
    await this.db
      .delete(webhookEndpoints)
      .where(and(eq(webhookEndpoints.tenantId, tenantId), eq(webhookEndpoints.id, id)))
  }

  async getEndpointsForEvent(
    tenantId: string,
    event: WebhookEvent,
  ): Promise<WebhookEndpoint[]> {
    const eps = await this.listWebhookEndpoints(tenantId)
    return eps.filter((ep) => ep.isActive && ep.listensTo(event))
  }

  async logDelivery(log: WebhookDeliveryLog): Promise<void> {
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

  async updateDeliveryLog(
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

  async listDeliveryLogs(
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
