import { Controller, Get, Post, Delete, Body, Param, Query, Headers, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { SocialInboxBffService } from './social-inbox.bff.service'
import type {
  CreateSocialReplyDto,
  SimulateCommentDto,
  SocialComment,
  SocialAutoResponderRule,
} from '@crm/contracts'

@ApiTags('Social Inbox & Comentarios (Social Inbox)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/social-inbox')
export class SocialInboxBffController {
  constructor(private readonly service: SocialInboxBffService) {}

  @Get('comments')
  @ApiOperation({ summary: 'Listar comentarios de Facebook, Instagram y TikTok' })
  @ApiQuery({ name: 'platform', required: false, description: 'FACEBOOK, INSTAGRAM, TIKTOK' })
  @ApiQuery({ name: 'status', required: false, description: 'PENDING, REPLIED, IGNORED' })
  async listComments(
    @Query('platform') platform?: string,
    @Query('status') status?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SocialComment[]> {
    return this.service.listComments(tenantId, platform, status)
  }

  @Post('comments/reply')
  @ApiOperation({ summary: 'Responder a un comentario de redes sociales' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['commentId', 'message'],
      properties: {
        commentId: { type: 'string', example: 'fb_comm_123456789' },
        message: { type: 'string', example: '¡Hola! Te hemos enviado un mensaje privado con el catálogo.' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async replyComment(
    @Body() dto: CreateSocialReplyDto,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SocialComment> {
    return this.service.replyComment(dto, tenantId)
  }

  @Get('rules')
  @ApiOperation({ summary: 'Listar reglas de auto-respuesta inteligente con IA' })
  async listRules(@Headers('X-Tenant-Id') tenantId?: string): Promise<SocialAutoResponderRule[]> {
    return this.service.listRules(tenantId)
  }

  @Post('rules')
  @ApiOperation({ summary: 'Crear o actualizar una regla de auto-respuesta' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'platform', 'triggerKeywords'],
      properties: {
        name: { type: 'string', example: 'Auto-respuesta para solicitud de Precios' },
        platform: { type: 'string', example: 'ALL' },
        triggerKeywords: { type: 'array', items: { type: 'string' }, example: ['precio', 'costo', 'info', 'cuanto'] },
        responseMode: { type: 'string', example: 'AI_RAG' },
      },
    },
  })
  async saveRule(
    @Body() dto: Partial<SocialAutoResponderRule>,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<SocialAutoResponderRule> {
    return this.service.saveRule(dto, tenantId)
  }

  @Delete('rules/:id')
  @ApiOperation({ summary: 'Eliminar una regla de auto-respuesta' })
  @ApiParam({ name: 'id', description: 'UUID de la regla' })
  @HttpCode(HttpStatus.OK)
  async deleteRule(
    @Param('id') id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ success: boolean }> {
    return this.service.deleteRule(id, tenantId)
  }

  @Post('simulate')
  @ApiOperation({ summary: 'Simular la llegada de un comentario para probar reglas e IA' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['platform', 'message'],
      properties: {
        platform: { type: 'string', example: 'INSTAGRAM' },
        message: { type: 'string', example: 'Hola, ¿cuánto cuesta el plan Pro?' },
        authorName: { type: 'string', example: 'María López' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async simulateComment(
    @Body() dto: SimulateCommentDto,
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.service.simulateComment(dto, tenantId)
  }
}
