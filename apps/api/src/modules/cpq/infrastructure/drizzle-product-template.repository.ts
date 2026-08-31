import { Injectable } from '@nestjs/common'
import { eq, and } from 'drizzle-orm'
import { getDb, productTemplates } from '@crm/database'
import { ProductTemplateRepository } from '../domain/repositories/product-template.repository'
import { ProductTemplate } from '../domain/entities/product-template.entity'
import { ProductPricingType } from '@crm/contracts'

@Injectable()
export class DrizzleProductTemplateRepository extends ProductTemplateRepository {
  private get db() {
    return getDb()
  }

  async save(template: ProductTemplate): Promise<void> {
    const existing = await this.findById(template.tenantId, template.id)
    if (existing) {
      await this.db
        .update(productTemplates)
        .set({
          name: template.name,
          category: template.category,
          defaultSkuPrefix: template.defaultSkuPrefix,
          defaultUnitPrice: String(template.defaultUnitPrice),
          defaultCurrency: template.defaultCurrency,
          pricingType: template.pricingType,
          defaultTaxRate: String(template.defaultTaxRate),
          defaultDescription: template.defaultDescription,
          updatedAt: template.updatedAt,
        })
        .where(and(eq(productTemplates.tenantId, template.tenantId), eq(productTemplates.id, template.id)))
    } else {
      await this.db.insert(productTemplates).values({
        id: template.id,
        tenantId: template.tenantId,
        name: template.name,
        category: template.category,
        defaultSkuPrefix: template.defaultSkuPrefix,
        defaultUnitPrice: String(template.defaultUnitPrice),
        defaultCurrency: template.defaultCurrency,
        pricingType: template.pricingType,
        defaultTaxRate: String(template.defaultTaxRate),
        defaultDescription: template.defaultDescription,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
      })
    }
  }

  async findById(tenantId: string, id: string): Promise<ProductTemplate | null> {
    const rows = await this.db
      .select()
      .from(productTemplates)
      .where(and(eq(productTemplates.tenantId, tenantId), eq(productTemplates.id, id)))
      .limit(1)

    if (rows.length === 0) return null
    return this.mapToDomain(rows[0])
  }

  async list(tenantId: string): Promise<ProductTemplate[]> {
    const rows = await this.db
      .select()
      .from(productTemplates)
      .where(eq(productTemplates.tenantId, tenantId))

    return rows.map(this.mapToDomain)
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db
      .delete(productTemplates)
      .where(and(eq(productTemplates.tenantId, tenantId), eq(productTemplates.id, id)))
  }

  private mapToDomain(row: any): ProductTemplate {
    return new ProductTemplate(
      row.id,
      row.tenantId,
      row.name,
      row.category,
      row.defaultSkuPrefix ?? null,
      Number(row.defaultUnitPrice),
      row.defaultCurrency,
      row.pricingType as ProductPricingType,
      Number(row.defaultTaxRate),
      row.defaultDescription ?? null,
      new Date(row.createdAt),
      new Date(row.updatedAt),
    )
  }
}
