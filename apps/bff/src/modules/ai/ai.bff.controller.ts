import { Controller, Get, Post, Param, Body, Headers, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiHeader } from '@nestjs/swagger'
import { AiBffService } from './ai.bff.service'
import { RagService } from './rag/rag.service'
import { GenerateMessageDraftSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import type {
  DealWinProbability,
  GenerateMessageDraft,
  GeneratedMessageDraft,
  ContactExecutiveSummary,
  ChurnRiskPrediction,
} from '@crm/contracts'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

@ApiTags('Inteligencia Artificial & RAG (AI)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api/ai')
export class AiBffController {
  constructor(
    private readonly service: AiBffService,
    private readonly ragService: RagService,
  ) {}

  @Get('deals/:dealId/win-probability')
  @ApiOperation({ summary: 'Calcular probabilidad de cierre de un Deal con IA' })
  @ApiParam({ name: 'dealId', description: 'UUID del deal' })
  async getDealWinProbability(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<DealWinProbability> {
    return this.service.getDealWinProbability(dealId, tenantId || DEFAULT_TENANT_ID)
  }

  @Post('drafts/generate')
  @ApiOperation({ summary: 'Generar borrador de respuesta inteligente para un contacto' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['contactId', 'intent'],
      properties: {
        contactId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        intent: { type: 'string', example: 'FOLLOW_UP_QUOTE' },
        tone: { type: 'string', example: 'PROFESSIONAL' },
      },
    },
  })
  async generateMessageDraft(
    @Body(createZodPipe(GenerateMessageDraftSchema)) dto: GenerateMessageDraft,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<GeneratedMessageDraft> {
    return this.service.generateMessageDraft(dto, tenantId || DEFAULT_TENANT_ID)
  }

  @Get('contacts/:contactId/summary')
  @ApiOperation({ summary: 'Generar resumen ejecutivo de un contacto con IA' })
  @ApiParam({ name: 'contactId', description: 'UUID del contacto' })
  async getContactExecutiveSummary(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<ContactExecutiveSummary> {
    return this.service.getContactExecutiveSummary(contactId, tenantId || DEFAULT_TENANT_ID)
  }

  @Get('contacts/:contactId/churn-risk')
  @ApiOperation({ summary: 'Predecir riesgo de abandono (Churn Risk) de un cliente' })
  @ApiParam({ name: 'contactId', description: 'UUID del contacto' })
  async getChurnRiskPrediction(
    @Param('contactId', ParseUUIDPipe) contactId: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<ChurnRiskPrediction> {
    return this.service.getChurnRiskPrediction(contactId, tenantId || DEFAULT_TENANT_ID)
  }

  @Post('rag/search')
  @ApiOperation({ summary: 'Búsqueda semántica en la Base de Conocimiento RAG' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string', example: '¿Cuál es la política de garantía de 30 días?' },
        topK: { type: 'number', example: 3 },
      },
    },
  })
  async searchKnowledge(
    @Body() dto: { query: string; topK?: number },
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.ragService.searchKnowledgeBase(tenantId || DEFAULT_TENANT_ID, dto.query, dto.topK || 3)
  }

  @Post('rag/grounded-reply')
  @ApiOperation({ summary: 'Generar respuesta fundamentada con IA usando la Base de Conocimiento' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string', example: '¿Cuánto cuesta el envío internacional?' },
        authorName: { type: 'string', example: 'Laura Gómez' },
        platform: { type: 'string', example: 'WHATSAPP' },
      },
    },
  })
  async generateGroundedReply(
    @Body() dto: { query: string; authorName?: string; platform?: string; customPrompt?: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ) {
    return this.ragService.generateGroundedReply(tenantId || DEFAULT_TENANT_ID, dto)
  }
}
