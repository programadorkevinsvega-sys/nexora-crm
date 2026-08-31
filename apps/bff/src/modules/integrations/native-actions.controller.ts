import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common'
import { NativeActionsService, NativeActionPayload } from './native-actions.service'

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001'

@Controller('api/integrations')
export class NativeActionsController {
  constructor(private readonly service: NativeActionsService) {}

  @Post('execute-action')
  @HttpCode(HttpStatus.OK)
  async executeAction(
    @Body() payload: NativeActionPayload,
    @Headers('x-tenant-id') tenantId?: string,
    @Headers('X-Tenant-Id') altTenantId?: string,
  ): Promise<{ success: boolean; result: any; message: string }> {
    const tid = tenantId || altTenantId || DEFAULT_TENANT
    const result = await this.service.executeAction(tid, payload)
    return {
      success: result?.success !== false,
      result,
      message: result?.message || 'Acción ejecutada correctamente',
    }
  }
}
