import { ProductPricingType } from '@crm/contracts'

export class ProductTemplate {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly name: string,
    readonly category: string,
    readonly defaultSkuPrefix: string | null,
    readonly defaultUnitPrice: number,
    readonly defaultCurrency: string,
    readonly pricingType: ProductPricingType,
    readonly defaultTaxRate: number,
    readonly defaultDescription: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    name: string
    defaultUnitPrice: number
    category?: string
    defaultSkuPrefix?: string | null
    defaultCurrency?: string
    pricingType?: ProductPricingType
    defaultTaxRate?: number
    defaultDescription?: string | null
  }): ProductTemplate {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Template name is required')
    }
    if (props.defaultUnitPrice <= 0) {
      throw new Error('Default unit price must be positive')
    }

    return new ProductTemplate(
      crypto.randomUUID(),
      props.tenantId,
      props.name.trim(),
      props.category ?? 'GENERAL',
      props.defaultSkuPrefix ?? null,
      props.defaultUnitPrice,
      props.defaultCurrency ?? 'USD',
      props.pricingType ?? 'ONE_TIME',
      props.defaultTaxRate ?? 0,
      props.defaultDescription ?? null,
      new Date(),
      new Date(),
    )
  }
}
