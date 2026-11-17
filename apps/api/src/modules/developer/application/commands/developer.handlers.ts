import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { createHmac } from 'crypto'
import { DeveloperRepository } from '../../domain/repositories/developer.repository'
import { ApiKey } from '../../domain/entities/api-key.entity'
import { WebhookEndpoint, WebhookEvent } from '../../domain/entities/webhook-endpoint.entity'
import { WebhookDeliveryLog } from '../../domain/entities/webhook-delivery-log.entity'
import { isPrivateOrLoopbackHost, sanitizeWebhookResponse } from '../../domain/services/ssrf-validator'
import {
  CreateApiKeyCommand,
  RevokeApiKeyCommand,
  CreateWebhookEndpointCommand,
  DeleteWebhookEndpointCommand,
  DispatchWebhookEventCommand,
} from './developer.commands'

@Injectable()
export class CreateApiKeyHandler {
  constructor(private readonly repo: DeveloperRepository) {}

  async execute(cmd: CreateApiKeyCommand) {
    const rawKey = ApiKey.generateRawKey()
    const apiKey = await this.repo.createApiKey(
      cmd.tenantId,
      cmd.name,
      cmd.scopes,
      rawKey,
      cmd.expiresAt,
    )
    return {
      id: apiKey.id,
      tenantId: apiKey.tenantId,
      name: apiKey.name,
      keyPrefix: apiKey.keyPrefix,
      scopes: apiKey.scopes,
      isActive: apiKey.isActive,
      lastUsedAt: apiKey.lastUsedAt,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      updatedAt: apiKey.updatedAt,
      rawKey,
    }
  }
}

@Injectable()
export class RevokeApiKeyHandler {
  constructor(private readonly repo: DeveloperRepository) {}

  async execute(cmd: RevokeApiKeyCommand): Promise<void> {
    await this.repo.revokeApiKey(cmd.tenantId, cmd.id)
  }
}

@Injectable()
export class DeleteApiKeyHandler {
  constructor(private readonly repo: DeveloperRepository) {}

  async execute(cmd: { tenantId: string; id: string }): Promise<void> {
    await this.repo.deleteApiKey(cmd.tenantId, cmd.id)
  }
}

@Injectable()
export class CreateWebhookEndpointHandler {
  constructor(private readonly repo: DeveloperRepository) {}

  async execute(cmd: CreateWebhookEndpointCommand): Promise<WebhookEndpoint> {
    if (isPrivateOrLoopbackHost(cmd.url)) {
      throw new BadRequestException(
        'URL de Webhook inválida o insegura: direcciones privadas, locales o de metadatos están prohibidas',
      )
    }
    return this.repo.createWebhookEndpoint(cmd.tenantId, cmd.name, cmd.url, cmd.events)
  }
}

@Injectable()
export class DeleteWebhookEndpointHandler {
  constructor(private readonly repo: DeveloperRepository) {}

  async execute(cmd: DeleteWebhookEndpointCommand): Promise<void> {
    await this.repo.deleteWebhookEndpoint(cmd.tenantId, cmd.id)
  }
}

@Injectable()
export class DispatchWebhookEventHandler {
  private readonly logger = new Logger(DispatchWebhookEventHandler.name)

  constructor(private readonly repo: DeveloperRepository) {}

  async execute(cmd: DispatchWebhookEventCommand): Promise<{ dispatched: number }> {
    const endpoints = await this.repo.getEndpointsForEvent(
      cmd.tenantId,
      cmd.event as WebhookEvent,
    )

    let dispatched = 0
    for (const ep of endpoints) {
      if (!ep.isActive) continue

      const log = WebhookDeliveryLog.create({
        tenantId: cmd.tenantId,
        endpointId: ep.id,
        event: cmd.event,
        payload: cmd.payload,
      })
      await this.repo.logDelivery(log)

      this.dispatchWithRetry(ep, log.id, cmd.event, cmd.payload).catch((err) => {
        this.logger.error(`Webhook dispatch error for endpoint ${ep.id}: ${err.message}`)
      })
      dispatched++
    }

    return { dispatched }
  }

  private async dispatchWithRetry(
    endpoint: WebhookEndpoint,
    logId: string,
    event: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    if (isPrivateOrLoopbackHost(endpoint.url)) {
      await this.repo.updateDeliveryLog(
        logId,
        'FAILED',
        undefined,
        'SSRF Bloqueado: Destino en rango privado no permitido',
        0,
      )
      return
    }

    const payloadStr = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data: payload,
    })

    const signature =
      'sha256=' +
      createHmac('sha256', endpoint.secret).update(payloadStr).digest('hex')

    const startTime = Date.now()
    try {
      const res = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Nexora-Webhook/1.0',
          'X-Nexora-Event': event,
          'X-Nexora-Signature': signature,
        },
        body: payloadStr,
        signal: AbortSignal.timeout(10000),
      })

      const durationMs = Date.now() - startTime
      const status = res.ok ? 'SUCCESS' : 'FAILED'
      const rawBody = await res.text().catch(() => '')
      const responseBody = sanitizeWebhookResponse(rawBody)

      await this.repo.updateDeliveryLog(
        logId,
        status,
        res.status,
        responseBody,
        durationMs,
      )
    } catch (err: any) {
      const durationMs = Date.now() - startTime
      await this.repo.updateDeliveryLog(
        logId,
        'FAILED',
        undefined,
        sanitizeWebhookResponse(err.message || 'Network error'),
        durationMs,
      )
    }
  }
}
