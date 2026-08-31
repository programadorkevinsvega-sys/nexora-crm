import { ProductPricingType } from '@crm/contracts'

export class Product {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly sku: string,
    readonly name: string,
    readonly description: string | null,
    readonly unitPrice: number,
    readonly currency: string,
    readonly pricingType: ProductPricingType,
    readonly taxRate: number,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    sku: string
    name: string
    unitPrice: number
    description?: string | null
    currency?: string
    pricingType?: ProductPricingType
    taxRate?: number
    isActive?: boolean
  }): Product {
    if (!props.sku || props.sku.trim().length === 0) {
      throw new Error('Product SKU is required')
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Product name is required')
    }
    if (props.unitPrice <= 0) {
      throw new Error('Unit price must be positive')
    }

    return new Product(
      crypto.randomUUID(),
      props.tenantId,
      props.sku.trim().toUpperCase(),
      props.name.trim(),
      props.description ?? null,
      props.unitPrice,
      props.currency ?? 'USD',
      props.pricingType ?? 'ONE_TIME',
      props.taxRate ?? 0,
      props.isActive ?? true,
      new Date(),
      new Date(),
    )
  }

  toggleActive(): Product {
    return new Product(
      this.id,
      this.tenantId,
      this.sku,
      this.name,
      this.description,
      this.unitPrice,
      this.currency,
      this.pricingType,
      this.taxRate,
      !this.isActive,
      this.createdAt,
      new Date(),
    )
  }

  updateDetails(props: {
    name?: string
    description?: string | null
    unitPrice?: number
    currency?: string
    pricingType?: ProductPricingType
    taxRate?: number
    isActive?: boolean
  }): Product {
    return new Product(
      this.id,
      this.tenantId,
      this.sku,
      props.name !== undefined ? props.name.trim() : this.name,
      props.description !== undefined ? props.description : this.description,
      props.unitPrice !== undefined ? props.unitPrice : this.unitPrice,
      props.currency !== undefined ? props.currency : this.currency,
      props.pricingType !== undefined ? props.pricingType : this.pricingType,
      props.taxRate !== undefined ? props.taxRate : this.taxRate,
      props.isActive !== undefined ? props.isActive : this.isActive,
      this.createdAt,
      new Date(),
    )
  }
}
