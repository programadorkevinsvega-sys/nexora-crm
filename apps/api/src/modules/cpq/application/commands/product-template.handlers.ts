import { Injectable } from '@nestjs/common'
import { CreateProductTemplateCommand, DeleteProductTemplateCommand } from './product-template.commands'
import { ProductTemplateRepository } from '../../domain/repositories/product-template.repository'
import { ProductTemplate } from '../../domain/entities/product-template.entity'

@Injectable()
export class CreateProductTemplateHandler {
  constructor(private readonly repo: ProductTemplateRepository) {}

  async execute(command: CreateProductTemplateCommand): Promise<ProductTemplate> {
    const template = ProductTemplate.create({
      tenantId: command.tenantId,
      name: command.name,
      defaultUnitPrice: command.defaultUnitPrice,
      category: command.category,
      defaultSkuPrefix: command.defaultSkuPrefix,
      defaultCurrency: command.defaultCurrency,
      pricingType: command.pricingType,
      defaultTaxRate: command.defaultTaxRate,
      defaultDescription: command.defaultDescription,
    })
    await this.repo.save(template)
    return template
  }
}

@Injectable()
export class DeleteProductTemplateHandler {
  constructor(private readonly repo: ProductTemplateRepository) {}

  async execute(command: DeleteProductTemplateCommand): Promise<void> {
    await this.repo.delete(command.tenantId, command.id)
  }
}
