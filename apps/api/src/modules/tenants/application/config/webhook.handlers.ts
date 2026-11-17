import { Injectable, NotFoundException } from '@nestjs/common'
import { TenantsRepository } from '../../domain/repositories/tenants.repository'
import { TenantWebhook } from '../../domain/entities/config.entity'

export class CreateWebhookCommand {
  constructor(readonly tenantId: string, readonly name: string, readonly endpointUrl: string, readonly eventTypes?: string[]) {}
}

export class UpdateWebhookCommand {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name?: string,
    readonly endpointUrl?: string,
    readonly isActive?: boolean,
    readonly maxRetries?: number,
    readonly eventTypes?: string[],
  ) {}
}

export class DeleteWebhookCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}

export class ListWebhooksQuery {
  constructor(readonly tenantId: string) {}
}

export class GetWebhookQuery {
  constructor(readonly id: string) {}
}

@Injectable()
export class CreateWebhookHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: CreateWebhookCommand): Promise<TenantWebhook> {
    const wh = TenantWebhook.create({
      tenantId: cmd.tenantId,
      name: cmd.name,
      endpointUrl: cmd.endpointUrl,
      eventTypes: cmd.eventTypes,
    })
    await this.repo.saveWebhook(wh)
    return wh
  }
}

@Injectable()
export class UpdateWebhookHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: UpdateWebhookCommand): Promise<TenantWebhook> {
    const wh = await this.repo.findWebhookById(cmd.id)
    if (!wh) throw new NotFoundException('Webhook not found')
    const updated = new TenantWebhook(
      wh.id,
      wh.tenantId,
      cmd.name ?? wh.name,
      cmd.endpointUrl ?? wh.endpointUrl,
      wh.secretKey,
      cmd.isActive ?? wh.isActive,
      cmd.maxRetries ?? wh.maxRetries,
      cmd.eventTypes ?? wh.eventTypes,
      wh.createdAt,
      new Date(),
    )
    await this.repo.saveWebhook(updated)
    return updated
  }
}

@Injectable()
export class DeleteWebhookHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(cmd: DeleteWebhookCommand): Promise<void> {
    await this.repo.deleteWebhook(cmd.tenantId, cmd.id)
  }
}

@Injectable()
export class ListWebhooksHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(q: ListWebhooksQuery): Promise<TenantWebhook[]> {
    return this.repo.listWebhooks(q.tenantId)
  }
}

@Injectable()
export class GetWebhookHandler {
  constructor(private readonly repo: TenantsRepository) {}

  async execute(q: GetWebhookQuery): Promise<TenantWebhook> {
    const wh = await this.repo.findWebhookById(q.id)
    if (!wh) throw new NotFoundException('Webhook not found')
    return wh
  }
}
