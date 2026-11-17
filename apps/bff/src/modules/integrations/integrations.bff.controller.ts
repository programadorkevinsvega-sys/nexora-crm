import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  BadRequestException,
} from '@nestjs/common'
import { IntegrationsBffService } from './integrations.bff.service'
import {
  INTEGRATION_PROVIDERS,
  IntegrationProvider,
  SaveIntegrationSchema,
  TestIntegrationSchema,
} from '@crm/contracts'
import type { Request } from 'express'

@Controller('api/integrations')
export class IntegrationsBffController {
  constructor(private readonly service: IntegrationsBffService) {}

  private getTenantId(req: Request): string {
    const tenantHeader = (req.headers['x-tenant-id'] || '') as string
    const userSession = (req as any).user?.tenantId
    return userSession || tenantHeader || '08e74d36-cb43-4de0-b7f2-11234db953b1'
  }

  @Get()
  async listStatuses(@Req() req: Request) {
    const tenantId = this.getTenantId(req)
    return this.service.listStatuses(tenantId)
  }

  @Post(':provider')
  async saveConfig(
    @Param('provider') provider: string,
    @Body() body: any,
    @Req() req: Request
  ) {
    if (!INTEGRATION_PROVIDERS.includes(provider as IntegrationProvider)) {
      throw new BadRequestException(`Proveedor inválido: ${provider}`)
    }

    const tenantId = this.getTenantId(req)
    const parsed = SaveIntegrationSchema.parse({
      provider,
      credentials: body.credentials || body,
      isEnabled: body.isEnabled ?? true,
    })

    return this.service.saveConfig(tenantId, parsed)
  }

  @Post(':provider/test')
  async testIntegration(
    @Param('provider') provider: string,
    @Body() body: any,
    @Req() req: Request
  ) {
    if (!INTEGRATION_PROVIDERS.includes(provider as IntegrationProvider)) {
      throw new BadRequestException(`Proveedor inválido: ${provider}`)
    }

    const tenantId = this.getTenantId(req)
    const parsed = TestIntegrationSchema.parse({
      provider,
      recipient: body.recipient,
      testMessage: body.testMessage,
    })

    return this.service.testIntegration(tenantId, parsed)
  }

  @Delete(':provider')
  async deleteConfig(
    @Param('provider') provider: string,
    @Req() req: Request
  ) {
    if (!INTEGRATION_PROVIDERS.includes(provider as IntegrationProvider)) {
      throw new BadRequestException(`Proveedor inválido: ${provider}`)
    }

    const tenantId = this.getTenantId(req)
    return this.service.deleteConfig(tenantId, provider as IntegrationProvider)
  }
}
