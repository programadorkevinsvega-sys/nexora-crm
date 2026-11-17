import { ProductPricingType } from '@crm/contracts'

export class CreateProductTemplateCommand {
  constructor(
    readonly tenantId: string,
    readonly name: string,
    readonly defaultUnitPrice: number,
    readonly category?: string,
    readonly defaultSkuPrefix?: string,
    readonly defaultCurrency?: string,
    readonly pricingType?: ProductPricingType,
    readonly defaultTaxRate?: number,
    readonly defaultDescription?: string,
  ) {}
}

export class DeleteProductTemplateCommand {
  constructor(readonly tenantId: string, readonly id: string) {}
}
