import { ProductTemplate } from '../entities/product-template.entity'

export abstract class ProductTemplateRepository {
  abstract save(template: ProductTemplate): Promise<void>
  abstract findById(tenantId: string, id: string): Promise<ProductTemplate | null>
  abstract list(tenantId: string): Promise<ProductTemplate[]>
  abstract delete(tenantId: string, id: string): Promise<void>
}
