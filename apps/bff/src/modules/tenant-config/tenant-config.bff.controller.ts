import { Controller, Get, Post, Body, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { TenantConfigBffService } from './tenant-config.bff.service'
import type {
  Branch,
  CreateBranchDto,
  TenantTax,
  CreateTenantTaxDto,
  TenantCurrency,
  CreateTenantCurrencyDto,
} from '@crm/contracts'

@ApiTags('Tenant Configuration, Branches, Taxes & Currencies')
@Controller('api/tenant')
export class TenantConfigBffController {
  constructor(private readonly service: TenantConfigBffService) {}

  @Get('branches')
  @ApiOperation({ summary: 'Listar sucursales y sedes corporativas' })
  async listBranches(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<Branch[]> {
    return this.service.listBranches(tenantId)
  }

  @Post('branches')
  @ApiOperation({ summary: 'Crear una nueva sucursal o sede' })
  async createBranch(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreateBranchDto,
  ): Promise<Branch> {
    return this.service.createBranch(tenantId, dto)
  }

  @Get('taxes')
  @ApiOperation({ summary: 'Listar configuración de impuestos por empresa' })
  async listTaxes(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<TenantTax[]> {
    return this.service.listTaxes(tenantId)
  }

  @Post('taxes')
  @ApiOperation({ summary: 'Registrar un nuevo impuesto o retención' })
  async createTax(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreateTenantTaxDto,
  ): Promise<TenantTax> {
    return this.service.createTax(tenantId, dto)
  }

  @Get('currencies')
  @ApiOperation({ summary: 'Listar monedas habilitadas y moneda base' })
  async listCurrencies(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<TenantCurrency[]> {
    return this.service.listCurrencies(tenantId)
  }

  @Post('currencies')
  @ApiOperation({ summary: 'Habilitar una nueva divisa comercial' })
  async createCurrency(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreateTenantCurrencyDto,
  ): Promise<TenantCurrency> {
    return this.service.createCurrency(tenantId, dto)
  }
}
