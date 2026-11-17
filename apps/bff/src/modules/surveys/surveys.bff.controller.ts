import { Controller, Get, Post, Body, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { SurveysBffService } from './surveys.bff.service'
import type {
  CustomerSurvey,
  CreateCustomerSurveyDto,
  SurveyResponse,
  RecordSurveyResponseDto,
  SurveyAnalyticsSummary,
} from '@crm/contracts'

@ApiTags('Customer Satisfaction Surveys (CSAT & NPS)')
@Controller('api/surveys')
export class SurveysBffController {
  constructor(private readonly service: SurveysBffService) {}

  @Get()
  @ApiOperation({ summary: 'Listar encuestas de satisfacción configuradas' })
  async listSurveys(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<CustomerSurvey[]> {
    return this.service.listSurveys(tenantId)
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva encuesta de satisfacción' })
  async createSurvey(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreateCustomerSurveyDto,
  ): Promise<CustomerSurvey> {
    return this.service.createSurvey(tenantId, dto)
  }

  @Post('responses')
  @ApiOperation({ summary: 'Registrar respuesta de un cliente a una encuesta' })
  async recordResponse(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: RecordSurveyResponseDto,
  ): Promise<SurveyResponse> {
    return this.service.recordResponse(tenantId, dto)
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Consultar métricas consolidadas de NPS y CSAT' })
  async getAnalyticsSummary(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<SurveyAnalyticsSummary> {
    return this.service.getAnalyticsSummary(tenantId)
  }
}
