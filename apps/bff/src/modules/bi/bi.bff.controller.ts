import { Controller, Get, Post, Delete, Param, Body, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { BiBffService } from './bi.bff.service'
import type { BiReport, CreateBiReportDto } from '@crm/contracts'

@ApiTags('Business Intelligence & Power BI Hub')
@Controller('api/bi')
export class BiBffController {
  constructor(private readonly service: BiBffService) {}

  @Get('reports')
  @ApiOperation({ summary: 'Listar dashboards y reportes de Power BI disponibles' })
  async listReports(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<BiReport[]> {
    return this.service.listReports(tenantId)
  }

  @Post('reports')
  @ApiOperation({ summary: 'Conectar un nuevo reporte o dashboard de Power BI' })
  async createReport(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreateBiReportDto,
  ): Promise<BiReport> {
    return this.service.createReport(tenantId, dto)
  }

  @Delete('reports/:id')
  @ApiOperation({ summary: 'Eliminar un reporte de Power BI guardado' })
  async deleteReport(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    await this.service.deleteReport(tenantId, id)
    return { success: true }
  }

  @Get('feed/:entity')
  @ApiOperation({ summary: 'Data Feed OData/JSON para ingesta en Power BI Desktop' })
  async getDataFeed(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('entity') entity: string,
  ): Promise<any[]> {
    return this.service.getDataFeed(tenantId, entity)
  }
}
