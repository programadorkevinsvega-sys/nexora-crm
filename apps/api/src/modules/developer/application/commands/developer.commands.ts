import { ApiKeyScope } from '../../domain/entities/api-key.entity'
import { WebhookEvent } from '../../domain/entities/webhook-endpoint.entity'

export class CreateApiKeyCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly scopes: ApiKeyScope[],
    readonly expiresAt?: Date | null,
  ) {}
}

export class RevokeApiKeyCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
  ) {}
}

export class DeleteApiKeyCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
  ) {}
}


export class CreateWebhookEndpointCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly url: string,
    readonly events: WebhookEvent[],
  ) {}
}

export class DeleteWebhookEndpointCommand {
  constructor(
    readonly tenantId: string,
    readonly id: string,
  ) {}
}

export class DispatchWebhookEventCommand {
  constructor(
    readonly tenantId: string,
    readonly event: string,
    readonly payload: Record<string, unknown>,
  ) {}
}
