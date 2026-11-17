import { Controller, Get, Post, Patch, Param, Body, Query, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { CommissionsBffService } from './commissions.bff.service'
import type {
  CommissionPlan,
  CreateCommissionPlanDto,
  CommissionRecord,
  CalculateCommissionDto,
} from '@crm/contracts'

@ApiTags('Sales Performance & Commissions Management (SPM)')
@Controller('api/commissions')
export class CommissionsBffController {
  constructor(private readonly service: CommissionsBffService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Listar planes de comisiones e incentivos' })
  async listPlans(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<CommissionPlan[]> {
    return this.service.listPlans(tenantId)
  }

  @Post('plans')
  @ApiOperation({ summary: 'Crear un nuevo plan de comisiones' })
  async createPlan(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreateCommissionPlanDto,
  ): Promise<CommissionPlan> {
    return this.service.createPlan(tenantId, dto)
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calcular y registrar comisión para un deal cerrado' })
  async calculateCommission(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CalculateCommissionDto,
  ): Promise<CommissionRecord> {
    return this.service.calculateAndRecordCommission(tenantId, dto)
  }

  @Get('records')
  @ApiOperation({ summary: 'Listar liquidaciones y asientos de comisiones' })
  async listRecords(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Query('userId') userId?: string,
    @Query('period') period?: string,
  ): Promise<CommissionRecord[]> {
    return this.service.listRecords(tenantId, userId, period)
  }

  @Patch('records/:id/approve')
  @ApiOperation({ summary: 'Aprobar asiento de comisión' })
  async approveRecord(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Headers('x-user-id') approverUserId = '00000000-0000-0000-0000-000000000001',
    @Param('id') recordId: string,
  ): Promise<CommissionRecord> {
    return this.service.approveRecord(tenantId, recordId, approverUserId)
  }

  @Patch('records/:id/pay')
  @ApiOperation({ summary: 'Marcar asiento de comisión como pagado / liquidado' })
  async markAsPaid(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') recordId: string,
  ): Promise<CommissionRecord> {
    return this.service.markAsPaid(tenantId, recordId)
  }
}
