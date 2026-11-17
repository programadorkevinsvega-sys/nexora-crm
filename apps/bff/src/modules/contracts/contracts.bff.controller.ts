import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Query,
  Body,
  Headers,
  ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiHeader } from '@nestjs/swagger'
import { z } from 'zod'
import { CreateQuoteSchema, CreateContractSchema } from '@crm/contracts'
import { createZodPipe } from '../../common/pipes/zod-validation.pipe'
import { ContractsBffService, QuoteFilters, ContractFilters, PaginatedResult } from './contracts.bff.service'
import type { CreateQuote, Quote, CreateContract, Contract } from '@crm/contracts'

const RejectQuoteBodySchema = z.object({
  reason: z.string().min(1),
})

const UpdateContractStatusSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'RENEWED']),
})

@ApiTags('Cotizaciones & Contratos (Quotes & Contracts)')
@ApiHeader({ name: 'X-Tenant-Id', required: false, description: 'ID del inquilino' })
@Controller('api')
export class ContractsBffController {
  constructor(private readonly service: ContractsBffService) {}

  @Get('quotes')
  @ApiOperation({ summary: 'Listar cotizaciones comerciales CPQ' })
  @ApiQuery({ name: 'dealId', required: false, description: 'Filtrar por oportunidad/deal' })
  @ApiQuery({ name: 'status', required: false, description: 'DRAFT, SENT, ACCEPTED, REJECTED' })
  async listQuotes(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('dealId') dealId?: string,
    @Query('status') status?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Quote>> {
    const filters: QuoteFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      dealId,
      status,
    }
    return this.service.listQuotes(filters, tenantId!)
  }

  @Post('quotes')
  @ApiOperation({ summary: 'Crear una nueva cotización comercial' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['dealId', 'items'],
      properties: {
        dealId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        validUntil: { type: 'string', example: '2026-10-31' },
        taxRate: { type: 'number', example: 19 },
        discountPercentage: { type: 'number', example: 5 },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', example: '00000000-0000-0000-0000-000000000002' },
              description: { type: 'string', example: 'Licencia Nexora Pro Anual' },
              quantity: { type: 'number', example: 10 },
              unitPrice: { type: 'number', example: 149 },
            },
          },
        },
      },
    },
  })
  async createQuote(
    @Body(createZodPipe(CreateQuoteSchema)) dto: CreateQuote,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Quote> {
    return this.service.createQuote(dto, tenantId!)
  }

  @Get('quotes/:id')
  @ApiOperation({ summary: 'Obtener cotización por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la cotización' })
  async getQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Quote> {
    return this.service.getQuote(id, tenantId!)
  }

  @Post('quotes/:id/send')
  @ApiOperation({ summary: 'Enviar cotización al cliente por correo' })
  @ApiParam({ name: 'id', description: 'UUID de la cotización' })
  async sendQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Quote> {
    return this.service.sendQuote(id, tenantId!)
  }

  @Post('quotes/:id/accept')
  @ApiOperation({ summary: 'Aceptar cotización y generar contrato' })
  @ApiParam({ name: 'id', description: 'UUID de la cotización' })
  async acceptQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Quote> {
    return this.service.acceptQuote(id, tenantId!)
  }

  @Post('quotes/:id/reject')
  @ApiOperation({ summary: 'Rechazar cotización con motivo' })
  @ApiParam({ name: 'id', description: 'UUID de la cotización' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['reason'],
      properties: {
        reason: { type: 'string', example: 'El cliente solicitó ajuste en las condiciones de pago.' },
      },
    },
  })
  async rejectQuote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(RejectQuoteBodySchema)) dto: { reason: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Quote> {
    return this.service.rejectQuote(id, dto.reason, tenantId!)
  }

  @Get('contracts')
  @ApiOperation({ summary: 'Listar contratos digitales' })
  @ApiQuery({ name: 'status', required: false, description: 'DRAFT, ACTIVE, EXPIRED, CANCELLED' })
  async listContracts(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<PaginatedResult<Contract>> {
    const filters: ContractFilters = {
      cursor,
      limit: limit ? Number(limit) : undefined,
      companyId,
      status,
    }
    return this.service.listContracts(filters, tenantId!)
  }

  @Post('contracts')
  @ApiOperation({ summary: 'Crear un nuevo contrato digital' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'companyId', 'startDate', 'endDate', 'totalValue'],
      properties: {
        title: { type: 'string', example: 'Contrato de Servicios Cloud Enterprise' },
        companyId: { type: 'string', example: '00000000-0000-0000-0000-000000000001' },
        startDate: { type: 'string', example: '2026-10-01' },
        endDate: { type: 'string', example: '2027-10-01' },
        totalValue: { type: 'number', example: 18000 },
        currency: { type: 'string', example: 'USD' },
      },
    },
  })
  async createContract(
    @Body(createZodPipe(CreateContractSchema)) dto: CreateContract,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contract> {
    return this.service.createContract(dto, tenantId!)
  }

  @Get('contracts/:id')
  @ApiOperation({ summary: 'Obtener contrato por ID' })
  @ApiParam({ name: 'id', description: 'UUID del contrato' })
  async getContract(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contract> {
    return this.service.getContract(id, tenantId!)
  }

  @Patch('contracts/:id/status')
  @ApiOperation({ summary: 'Actualizar estado del contrato' })
  @ApiParam({ name: 'id', description: 'UUID del contrato' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', example: 'ACTIVE' },
      },
    },
  })
  async updateContractStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(createZodPipe(UpdateContractStatusSchema)) dto: { status: string },
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<Contract> {
    return this.service.updateContractStatus(id, dto.status, tenantId!)
  }
}
