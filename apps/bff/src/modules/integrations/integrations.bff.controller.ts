import {
  Controller, Get, Post, Delete, Param, Body, Req, BadRequestException,
} from '@nestjs/common'
import { IntegrationsBffService } from './integrations.bff.service'
import {
  INTEGRATION_PROVIDERS, IntegrationProvider, SaveIntegrationSchema, TestIntegrationSchema,
} from '@crm/contracts'
import type { Request } from 'express'

type AuthenticatedRequest = Request & { user?: { tenantId?: string } }

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

@Controller('api/integrations')
export class IntegrationsBffController {
  constructor(private readonly service: IntegrationsBffService) {}

  private getTenantId(req: AuthenticatedRequest): string {
    const header = req.headers['x-tenant-id']
    const tenantHeader = typeof header === 'string' ? header : ''
    return req.user?.tenantId || tenantHeader || '08e74d36-cb43-4de0-b7f2-11234db953b1'
  }

  @Get()
  async listStatuses(@Req() req: AuthenticatedRequest) {
    return this.service.listStatuses(this.getTenantId(req))
  }

  @Post(':provider')
  async saveConfig(
    @Param('provider') provider: string,
    @Body() body: unknown,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!INTEGRATION_PROVIDERS.includes(provider as IntegrationProvider)) {
      throw new BadRequestException(`Proveedor inválido: ${provider}`)
    }
    const payload = asRecord(body)
    const parsed = SaveIntegrationSchema.parse({
      provider,
      credentials: payload.credentials ?? payload,
      isEnabled: payload.isEnabled ?? true,
    })
    return this.service.saveConfig(this.getTenantId(req), parsed)
  }

  @Post(':provider/test')
  async testIntegration(
    @Param('provider') provider: string,
    @Body() body: unknown,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!INTEGRATION_PROVIDERS.includes(provider as IntegrationProvider)) {
      throw new BadRequestException(`Proveedor inválido: ${provider}`)
    }
    const payload = asRecord(body)
    const parsed = TestIntegrationSchema.parse({
      provider,
      recipient: payload.recipient,
      testMessage: payload.testMessage,
    })
    return this.service.testIntegration(this.getTenantId(req), parsed)
  }

  @Delete(':provider')
  async deleteConfig(@Param('provider') provider: string, @Req() req: AuthenticatedRequest) {
    if (!INTEGRATION_PROVIDERS.includes(provider as IntegrationProvider)) {
      throw new BadRequestException(`Proveedor inválido: ${provider}`)
    }
    return this.service.deleteConfig(this.getTenantId(req), provider as IntegrationProvider)
  }
}