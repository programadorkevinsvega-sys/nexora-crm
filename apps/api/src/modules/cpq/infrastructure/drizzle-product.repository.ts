import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { getDb, products as productsTable } from '@crm/database'
import { ProductRepository } from '../domain/repositories/cpq.repository'
import { Product } from '../domain/entities/product.entity'
import { CpqMapper } from './cpq.mapper'

@Injectable()
export class DrizzleProductRepository extends ProductRepository {
  private get db() {
    return getDb()
  }

  async save(product: Product): Promise<void> {
    const existing = await this.findById(product.tenantId, product.id)
    if (existing) {
      await this.db
        .update(productsTable)
        .set({
          sku: product.sku,
          name: product.name,
          description: product.description,
          unitPrice: String(product.unitPrice),
          currency: product.currency,
          pricingType: product.pricingType,
          taxRate: String(product.taxRate),
          isActive: product.isActive,
          updatedAt: product.updatedAt,
        })
        .where(and(eq(productsTable.tenantId, product.tenantId), eq(productsTable.id, product.id)))
    } else {
      await this.db.insert(productsTable).values({
        id: product.id,
        tenantId: product.tenantId,
        sku: product.sku,
        name: product.name,
        description: product.description,
        unitPrice: String(product.unitPrice),
        currency: product.currency,
        pricingType: product.pricingType,
        taxRate: String(product.taxRate),
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })
    }
  }

  async findById(tenantId: string, id: string): Promise<Product | null> {
    const rows = await this.db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.tenantId, tenantId), eq(productsTable.id, id)))
      .limit(1)

    return rows.length > 0 ? CpqMapper.productToDomain(rows[0]) : null
  }

  async findBySku(tenantId: string, sku: string): Promise<Product | null> {
    const rows = await this.db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.tenantId, tenantId), eq(productsTable.sku, sku)))
      .limit(1)

    return rows.length > 0 ? CpqMapper.productToDomain(rows[0]) : null
  }

  async list(tenantId: string, activeOnly = false): Promise<Product[]> {
    const conditions = [eq(productsTable.tenantId, tenantId)]
    if (activeOnly) {
      conditions.push(eq(productsTable.isActive, true))
    }

    const rows = await this.db
      .select()
      .from(productsTable)
      .where(and(...conditions))

    return rows.map(CpqMapper.productToDomain)
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db
      .delete(productsTable)
      .where(and(eq(productsTable.tenantId, tenantId), eq(productsTable.id, id)))
  }
}
