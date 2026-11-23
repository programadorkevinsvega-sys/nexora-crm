import { Injectable, Logger } from '@nestjs/common'
import { getDb, priceBooks, priceBookEntries, productInventoryLevels } from '@crm/database'
import { eq, and, desc } from 'drizzle-orm'
import type {
  PriceBook,
  CreatePriceBookDto,
  PriceBookEntry,
  CreatePriceBookEntryDto,
  ProductInventoryLevel,
  UpdateInventoryStockDto,
} from '@crm/contracts'

@Injectable()
export class PriceBooksBffService {
  private readonly logger = new Logger(PriceBooksBffService.name)
  private get db() {
    return getDb()
  }

  async listPriceBooks(tenantId: string): Promise<PriceBook[]> {
    let rows = await this.db
      .select()
      .from(priceBooks)
      .where(eq(priceBooks.tenantId, tenantId))
      .orderBy(desc(priceBooks.isStandard), desc(priceBooks.createdAt))

    if (rows.length === 0) {
      await this.seedDefaultPriceBooks(tenantId)
      rows = await this.db
        .select()
        .from(priceBooks)
        .where(eq(priceBooks.tenantId, tenantId))
        .orderBy(desc(priceBooks.isStandard), desc(priceBooks.createdAt))
    }

    return rows.map((r) => this.mapPriceBook(r))
  }

  async createPriceBook(tenantId: string, dto: CreatePriceBookDto): Promise<PriceBook> {
    const [created] = await this.db
      .insert(priceBooks)
      .values({
        tenantId,
        name: dto.name,
        code: dto.code.toUpperCase(),
        currency: dto.currency,
        description: dto.description || null,
        isStandard: dto.isStandard ?? false,
        isActive: dto.isActive ?? true,
      })
      .returning()

    this.logger.log(`Created Price Book: ${created.id} (${created.name})`)
    return this.mapPriceBook(created)
  }

  async listEntries(tenantId: string, priceBookId: string): Promise<PriceBookEntry[]> {
    const rows = await this.db
      .select()
      .from(priceBookEntries)
      .where(and(eq(priceBookEntries.tenantId, tenantId), eq(priceBookEntries.priceBookId, priceBookId)))

    return rows.map((r) => this.mapEntry(r))
  }

  async addEntry(tenantId: string, dto: CreatePriceBookEntryDto): Promise<PriceBookEntry> {
    const [created] = await this.db
      .insert(priceBookEntries)
      .values({
        tenantId,
        priceBookId: dto.priceBookId,
        productId: dto.productId,
        unitPrice: String(dto.unitPrice),
        minQuantity: dto.minQuantity || 1,
        discountPercentage: String(dto.discountPercentage || 0),
        isActive: dto.isActive ?? true,
      })
      .returning()

    return this.mapEntry(created)
  }

  async listInventory(tenantId: string): Promise<ProductInventoryLevel[]> {
    const rows = await this.db
      .select()
      .from(productInventoryLevels)
      .where(eq(productInventoryLevels.tenantId, tenantId))

    return rows.map((r) => this.mapInventory(r))
  }

  async updateStock(tenantId: string, dto: UpdateInventoryStockDto): Promise<ProductInventoryLevel> {
    const stockAvailable = Math.max(0, dto.stockOnHand - (dto.stockReserved || 0))
    const existing = await this.db
      .select()
      .from(productInventoryLevels)
      .where(and(eq(productInventoryLevels.tenantId, tenantId), eq(productInventoryLevels.productId, dto.productId)))
      .limit(1)

    if (existing.length > 0) {
      const [updated] = await this.db
        .update(productInventoryLevels)
        .set({
          stockOnHand: dto.stockOnHand,
          stockReserved: dto.stockReserved ?? existing[0].stockReserved,
          stockAvailable,
          reorderPoint: dto.reorderPoint ?? existing[0].reorderPoint,
          warehouseLocation: dto.warehouseLocation || existing[0].warehouseLocation,
          updatedAt: new Date(),
        })
        .where(eq(productInventoryLevels.id, existing[0].id))
        .returning()
      return this.mapInventory(updated)
    }

    const [created] = await this.db
      .insert(productInventoryLevels)
      .values({
        tenantId,
        productId: dto.productId,
        stockOnHand: dto.stockOnHand,
        stockReserved: dto.stockReserved || 0,
        stockAvailable,
        reorderPoint: dto.reorderPoint || 10,
        warehouseLocation: dto.warehouseLocation || 'Principal',
      })
      .returning()

    return this.mapInventory(created)
  }

  private async seedDefaultPriceBooks(tenantId: string) {
    await this.db.insert(priceBooks).values([
      {
        tenantId,
        name: 'Lista Estándar Global (USD)',
        code: 'PB-STD-USD',
        currency: 'USD',
        description: 'Tarifario estándar internacional para licencias SaaS y servicios Cloud.',
        isStandard: true,
        isActive: true,
      },
      {
        tenantId,
        name: 'Tarifa Corporativa Colombia (COP)',
        code: 'PB-CORP-COP',
        currency: 'COP',
        description: 'Lista de precios ajustada a moneda local y facturación DIAN.',
        isStandard: false,
        isActive: true,
      },
    ])
  }

  private mapPriceBook(r: typeof priceBooks.$inferSelect): PriceBook {
    return {
      ...r,
      currency: r.currency as PriceBook['currency'],
      validFrom: r.validFrom ? new Date(r.validFrom).toISOString() : undefined,
      validUntil: r.validUntil ? new Date(r.validUntil).toISOString() : undefined,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }

  private mapEntry(r: typeof priceBookEntries.$inferSelect): PriceBookEntry {
    return {
      ...r,
      unitPrice: Number(r.unitPrice) || 0,
      discountPercentage: Number(r.discountPercentage) || 0,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }

  private mapInventory(r: typeof productInventoryLevels.$inferSelect): ProductInventoryLevel {
    return {
      ...r,
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : new Date().toISOString(),
    }
  }
}
