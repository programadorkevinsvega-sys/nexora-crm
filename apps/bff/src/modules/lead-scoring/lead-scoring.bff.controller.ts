import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { LeadScoringBffService } from './lead-scoring.bff.service'
import { CreateScoringRuleSchema, AdjustScoreSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import type { CreateScoringRule, AdjustScore, LeadScoringRule, LeadScore } from '@crm/contracts'

@ApiTags('Calificación de Prospectos (Lead Scoring)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/scoring')
export class LeadScoringBffController {
  constructor(private readonly service: LeadScoringBffService) {}

  @Post('rules')
  @ApiOperation({ summary: 'Crear una regla de puntuación automática de leads' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['name', 'eventType', 'points'],
      properties: {
        name: { type: 'string', example: 'Puntos por email corporativo' },
        eventType: { type: 'string', example: 'CONTACT_CREATED' },
        points: { type: 'number', example: 15 },
        conditionJson: { type: 'object', example: { isCorporateEmail: true } },
      },
    },
  })
  async createRule(
    @Body(createZodPipe(CreateScoringRuleSchema)) dto: CreateScoringRule,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ id: string }> {
    return this.service.createRule(dto, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('rules')
  @ApiOperation({ summary: 'Listar todas las reglas de puntuación activas' })
  async listRules(@Headers('X-Tenant-Id') tenantId?: string): Promise<LeadScoringRule[]> {
    return this.service.listRules(tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('rules/:id/toggle')
  @ApiOperation({ summary: 'Activar o pausar una regla de puntuación' })
  @ApiParam({ name: 'id', description: 'UUID de la regla' })
  async toggleRule(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<LeadScoringRule> {
    return this.service.toggleRule(id, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('leads/:contactId')
  @ApiOperation({ summary: 'Obtener puntaje y calificación actual de un contacto' })
  @ApiParam({ name: 'contactId', description: 'UUID del contacto' })
  async getLeadScore(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<LeadScore | null> {
    return this.service.getLeadScore(contactId, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('leads/:contactId/recalculate')
  @ApiOperation({ summary: 'Recalcular la puntuación de un contacto con nuevas actividades' })
  @ApiParam({ name: 'contactId', description: 'UUID del contacto' })
  async recalculate(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Body() body: { context: Record<string, unknown> },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<LeadScore> {
    return this.service.recalculateScore(contactId, body?.context || {}, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Post('leads/:contactId/adjust')
  @ApiOperation({ summary: 'Ajuste manual de puntos a un contacto' })
  @ApiParam({ name: 'contactId', description: 'UUID del contacto' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['delta', 'reason'],
      properties: {
        delta: { type: 'number', example: 10 },
        reason: { type: 'string', example: 'Asistió a demostración técnica en vivo' },
      },
    },
  })
  async adjust(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Body(createZodPipe(AdjustScoreSchema)) dto: AdjustScore,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<LeadScore> {
    return this.service.adjustScore({ ...dto, contactId }, tenantId || '00000000-0000-0000-0000-000000000001')
  }

  @Get('top')
  @ApiOperation({ summary: 'Top de prospectos más calificados listos para venta' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de registros' })
  async listTop(
    @Query('limit') limit?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<LeadScore[]> {
    const lim = limit ? parseInt(limit, 10) : 20
    return this.service.listTopLeads(lim, tenantId || '00000000-0000-0000-0000-000000000001')
  }
}
