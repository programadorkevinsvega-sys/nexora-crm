import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common'
import { Response } from 'express'
import { z } from 'zod'
import {
  CreateCampaignSchema,
  AddCampaignMemberSchema,
} from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { CampaignsBffService, CampaignFilters, PaginatedResult } from './campaigns.bff.service'
import { MassEmailService } from './mass-email.service'
import type { CreateCampaign, Campaign, AddCampaignMember, CampaignMember } from '@crm/contracts'

const UpdateCampaignStatusSchema = z.object({
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED']),
})

const UpdateMemberStatusSchema = z.object({
  status: z.enum(['SENT', 'OPENED', 'CLICKED', 'RESPONDED', 'BOUNCED', 'UNSUBSCRIBED']),
})

@Controller('api')
export class CampaignsBffController {
  constructor(
    private readonly service: CampaignsBffService,
    private readonly massEmailService: MassEmailService,
  ) {}

  @Get('campaigns')
  async list(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Campaign>> {
    const filters: CampaignFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      status,
      type,
    }
    return this.service.list(filters, tenantId!)
  }

  @Post('campaigns')
  async create(
    @Body(createZodPipe(CreateCampaignSchema)) dto: CreateCampaign,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Campaign> {
    return this.service.create(dto, tenantId!)
  }

  @Get('campaigns/:id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Campaign> {
    return this.service.getById(id, tenantId!)
  }

  @Put('campaigns/:id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateCampaign>,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Campaign> {
    return this.service.update(id, dto, tenantId!)
  }

  @Patch('campaigns/:id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(UpdateCampaignStatusSchema)) dto: { status: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Campaign> {
    return this.service.updateStatus(id, dto.status, tenantId!)
  }

  @Delete('campaigns/:id')
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<void> {
    return this.service.delete(id, tenantId!)
  }

  @Get('campaigns/:id/members')
  async listMembers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<CampaignMember>> {
    return this.service.listMembers(id, { cursor, limit: limit ? Number(limit) : undefined }, tenantId!)
  }

  @Post('campaigns/:id/members')
  async addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(AddCampaignMemberSchema)) dto: AddCampaignMember,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<CampaignMember> {
    return this.service.addMember(id, dto, tenantId!)
  }

  @Patch('campaigns/members/:memberId/status')
  async updateMemberStatus(
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body(createZodPipe(UpdateMemberStatusSchema)) dto: { status: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ id: string }> {
    return this.service.updateMemberStatus(memberId, dto.status, tenantId!)
  }

  @Post('campaigns/:id/send-bulk')
  async sendBulk(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { creds: any; recipients: string[]; subject: string; htmlTemplate: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.massEmailService.sendBulk(dto.creds, dto.recipients, dto.subject, dto.htmlTemplate)
  }

  @Post('campaigns/send-test')
  async sendTest(
    @Body() dto: { creds: any; recipient: string; subject: string; html: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.massEmailService.sendTest(dto.creds, dto.recipient, dto.subject, dto.html)
  }

  @Get('campaigns/track/open')
  trackOpen(
    @Query('campaignId') campaignId: string,
    @Query('memberId') memberId: string,
    @Res() res: Response,
  ) {
    // In a real app we might mark as opened here
    // this.service.updateMemberStatus(memberId, 'OPENED', tenantId)
    const buffer = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')
    res.setHeader('Content-Type', 'image/gif')
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    res.send(buffer)
  }

  @Get('campaigns/unsubscribe')
  async unsubscribe(
    @Query('campaignId') campaignId: string,
    @Query('memberId') memberId: string,
    @Query('tenantId') tenantId: string,
  ) {
    if (memberId && tenantId) {
      await this.service.updateMemberStatus(memberId, 'UNSUBSCRIBED', tenantId)
    }
    return { success: true, message: 'Unsubscribed successfully' }
  }

  @Get('campaigns/:id/stats')
  async getStats(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.service.getCampaignStats(id, tenantId!)
  }
}
