import { Controller, Get, Post, Delete, Body, Param, Query, Headers, HttpCode, HttpStatus } from '@nestjs/common'
import { SocialInboxBffService } from './social-inbox.bff.service'
import type {
  CreateSocialReplyDto,
  SimulateCommentDto,
  SocialComment,
  SocialAutoResponderRule,
} from '@crm/contracts'

@Controller('api/social-inbox')
export class SocialInboxBffController {
  constructor(private readonly service: SocialInboxBffService) {}

  @Get('comments')
  async listComments(
    @Query('platform') platform?: string,
    @Query('status') status?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SocialComment[]> {
    return this.service.listComments(tenantId, platform, status)
  }

  @Post('comments/reply')
  @HttpCode(HttpStatus.OK)
  async replyComment(
    @Body() dto: CreateSocialReplyDto,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SocialComment> {
    return this.service.replyComment(dto, tenantId)
  }

  @Get('rules')
  async listRules(
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SocialAutoResponderRule[]> {
    return this.service.listRules(tenantId)
  }

  @Post('rules')
  async saveRule(
    @Body() dto: Partial<SocialAutoResponderRule>,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SocialAutoResponderRule> {
    return this.service.saveRule(dto, tenantId)
  }

  @Delete('rules/:id')
  @HttpCode(HttpStatus.OK)
  async deleteRule(
    @Param('id') id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ success: boolean }> {
    return this.service.deleteRule(id, tenantId)
  }

  @Post('simulate')
  @HttpCode(HttpStatus.OK)
  async simulateComment(
    @Body() dto: SimulateCommentDto,
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.service.simulateComment(dto, tenantId)
  }
}
