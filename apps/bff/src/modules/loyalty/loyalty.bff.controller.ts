import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { LoyaltyBffService } from './loyalty.bff.service'
import type { CreateSegment, CustomerSegment } from '@crm/contracts'

@Controller('api/loyalty')
export class LoyaltyBffController {
  constructor(private readonly service: LoyaltyBffService) {}

  @Get('profile/:contactId')
  async getProfile(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Record<string, unknown>> {
    return this.service.getProfile(contactId, tenantId!)
  }

  @Post('earn')
  async earnPoints(
    @Body() dto: { contactId: string; points: number },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Record<string, unknown>> {
    return this.service.earnPoints(dto, tenantId!)
  }

  @Post('redeem')
  async redeemPoints(
    @Body() dto: { contactId: string; points: number },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Record<string, unknown>> {
    return this.service.redeemPoints(dto, tenantId!)
  }

  @Get('segments')
  async listSegments(
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<CustomerSegment[]> {
    return this.service.listSegments(tenantId!)
  }

  @Post('segments')
  async createSegment(
    @Body() dto: CreateSegment,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<CustomerSegment> {
    return this.service.createSegment(dto, tenantId!)
  }

  @Post('segments/:id/assign')
  async assignToSegment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { contactId: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.assignToSegment(id, dto.contactId, tenantId!)
  }

  @Get('metrics/:contactId')
  async getMetrics(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Record<string, unknown>> {
    return this.service.getMetrics(contactId, tenantId!)
  }
}
