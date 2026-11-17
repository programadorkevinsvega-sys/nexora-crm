import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiHeader } from '@nestjs/swagger'
import { LoyaltyBffService } from './loyalty.bff.service'
import type { CreateSegment, CustomerSegment } from '@crm/contracts'

@ApiTags('Fidelización & Puntos (Loyalty & Rewards)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/loyalty')
export class LoyaltyBffController {
  constructor(private readonly service: LoyaltyBffService) {}

  @Get('profile/:contactId')
  @ApiOperation({ summary: 'Obtener balance de puntos y nivel de fidelidad de un contacto' })
  @ApiParam({ name: 'contactId', description: 'UUID del contacto' })
  async getProfile(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Record<string, unknown>> {
    return this.service.getProfile(contactId, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('earn')
  @ApiOperation({ summary: 'Acumular puntos por compra o acción' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['contactId', 'points'],
      properties: {
        contactId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        points: { type: 'number', example: 100 },
      },
    },
  })
  async earnPoints(
    @Body() dto: { contactId: string; points: number },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Record<string, unknown>> {
    return this.service.earnPoints(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('redeem')
  @ApiOperation({ summary: 'Redimir puntos por recompensas o descuentos' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['contactId', 'points'],
      properties: {
        contactId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        points: { type: 'number', example: 50 },
      },
    },
  })
  async redeemPoints(
    @Body() dto: { contactId: string; points: number },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Record<string, unknown>> {
    return this.service.redeemPoints(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('segments')
  @ApiOperation({ summary: 'Listar segmentos de clientes' })
  async listSegments(@Headers('X-Tenant-Id') tenantId?: string): Promise<CustomerSegment[]> {
    return this.service.listSegments(tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('segments')
  @ApiOperation({ summary: 'Crear un nuevo segmento de clientes' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', example: 'Clientes de Alto Valor (Gold)' },
        criteriaJson: { type: 'object', example: { minPurchases: 5 } },
      },
    },
  })
  async createSegment(
    @Body() dto: CreateSegment,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<CustomerSegment> {
    return this.service.createSegment(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
