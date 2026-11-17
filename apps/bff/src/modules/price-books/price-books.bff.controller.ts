import { Controller, Get, Post, Put, Param, Body, Headers } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PriceBooksBffService } from './price-books.bff.service'
import type {
  PriceBook,
  CreatePriceBookDto,
  PriceBookEntry,
  CreatePriceBookEntryDto,
  ProductInventoryLevel,
  UpdateInventoryStockDto,
} from '@crm/contracts'

@ApiTags('Multi-Currency Price Books & Inventory Management')
@Controller('api/price-books')
export class PriceBooksBffController {
  constructor(private readonly service: PriceBooksBffService) {}

  @Get()
  @ApiOperation({ summary: 'Listar listas de precios (Price Books)' })
  async listPriceBooks(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<PriceBook[]> {
    return this.service.listPriceBooks(tenantId)
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva lista de precios multi-moneda' })
  async createPriceBook(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreatePriceBookDto,
  ): Promise<PriceBook> {
    return this.service.createPriceBook(tenantId, dto)
  }

  @Get(':id/entries')
  @ApiOperation({ summary: 'Listar precios de productos asociados a un Price Book' })
  async listEntries(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Param('id') priceBookId: string,
  ): Promise<PriceBookEntry[]> {
    return this.service.listEntries(tenantId, priceBookId)
  }

  @Post('entries')
  @ApiOperation({ summary: 'Añadir o actualizar precio de un producto en un Price Book' })
  async addEntry(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: CreatePriceBookEntryDto,
  ): Promise<PriceBookEntry> {
    return this.service.addEntry(tenantId, dto)
  }

  @Get('inventory')
  @ApiOperation({ summary: 'Consultar niveles de stock y disponibilidad de productos' })
  async listInventory(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
  ): Promise<ProductInventoryLevel[]> {
    return this.service.listInventory(tenantId)
  }

  @Put('inventory')
  @ApiOperation({ summary: 'Actualizar stock físico y punto de reorden de un producto' })
  async updateStock(
    @Headers('x-tenant-id') tenantId = '00000000-0000-0000-0000-000000000001',
    @Body() dto: UpdateInventoryStockDto,
  ): Promise<ProductInventoryLevel> {
    return this.service.updateStock(tenantId, dto)
  }
}
