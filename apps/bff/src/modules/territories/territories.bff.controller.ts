import { Controller, Get, Post, Param, Body, Query, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { TerritoriesBffService } from './territories.bff.service'
import type {
  SalesTerritory,
  CreateTerritoryDto,
  TerritoryMember,
  TerritoryMemberRole,
  RouteLeadToTerritoryDto,
} from '@crm/contracts'

@ApiTags('Sales Territories & Territory Management')
@Controller('api/territories')
export class TerritoriesBffController {
  constructor(private readonly service: TerritoriesBffService) {}

  @Get()
  @ApiOperation({ summary: 'Listar territorios de ventas configurados' })
  async listTerritories(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<SalesTerritory[]> {
    return this.service.listTerritories(tenantId)
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo territorio de ventas' })
  async createTerritory(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreateTerritoryDto,
  ): Promise<SalesTerritory> {
    return this.service.createTerritory(tenantId, dto)
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Asignar un vendedor o SDR a un territorio' })
  async assignMember(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') territoryId: string,
    @Body('userId') userId: string,
    @Body('role') role?: TerritoryMemberRole,
  ): Promise<TerritoryMember> {
    return this.service.assignMember(tenantId, territoryId, userId, role)
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Listar miembros asignados a un territorio' })
  async listMembers(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') territoryId: string,
  ): Promise<TerritoryMember[]> {
    return this.service.listMembers(tenantId, territoryId)
  }

  @Post('route')
  @ApiOperation({ summary: 'Enrutar lead o cuenta al territorio más adecuado' })
  async routeLead(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: RouteLeadToTerritoryDto,
  ): Promise<SalesTerritory | null> {
    return this.service.routeLead(tenantId, dto)
  }
}
