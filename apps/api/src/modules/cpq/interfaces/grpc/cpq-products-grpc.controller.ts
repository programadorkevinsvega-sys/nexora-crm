import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateProductHandler,
  UpdateProductHandler,
  DeleteProductHandler,
} from '../../application/commands/cpq.handlers'
import {
  CreateProductTemplateHandler,
  DeleteProductTemplateHandler,
} from '../../application/commands/product-template.handlers'
import {
  GetProductHandler,
  ListProductsHandler,
} from '../../application/queries/cpq.handlers'
import { ListProductTemplatesHandler } from '../../application/queries/product-template.handlers'
import {
  CreateProductCommand,
  UpdateProductCommand,
  DeleteProductCommand,
} from '../../application/commands/cpq.commands'
import {
  CreateProductTemplateCommand,
  DeleteProductTemplateCommand,
} from '../../application/commands/product-template.commands'
import {
  GetProductQuery,
  ListProductsQuery,
} from '../../application/queries/cpq.queries'
import { ListProductTemplatesQuery } from '../../application/queries/product-template.queries'
import { CpqMapper } from '../../infrastructure/cpq.mapper'
import { ProductPricingType } from '@crm/contracts'

@Controller()
export class CpqProductsGrpcController {
  constructor(
    private readonly createProductHandler: CreateProductHandler,
    private readonly updateProductHandler: UpdateProductHandler,
    private readonly deleteProductHandler: DeleteProductHandler,
    private readonly createTemplateHandler: CreateProductTemplateHandler,
    private readonly deleteTemplateHandler: DeleteProductTemplateHandler,
    private readonly listTemplatesHandler: ListProductTemplatesHandler,
    private readonly getProductHandler: GetProductHandler,
    private readonly listProductsHandler: ListProductsHandler,
  ) {}

  @GrpcMethod('CpqService', 'CreateProduct')
  async createProduct(data: {
    tenantId: string
    sku: string
    name: string
    unitPrice: number
    description?: string
    currency?: string
    pricingType?: string
    taxRate?: number
  }) {
    const res = await this.createProductHandler.execute(
      new CreateProductCommand(
        data.tenantId,
        data.sku,
        data.name,
        data.unitPrice,
        data.description,
        data.currency,
        data.pricingType as ProductPricingType,
        data.taxRate,
      ),
    )
    const product = await this.getProductHandler.execute(
      new GetProductQuery(data.tenantId, res.id),
    )
    return { json: JSON.stringify(CpqMapper.productToResponse(product)) }
  }

  @GrpcMethod('CpqService', 'UpdateProduct')
  async updateProduct(data: {
    tenantId: string
    id: string
    name?: string
    unitPrice?: number
    description?: string
    currency?: string
    pricingType?: string
    taxRate?: number
    isActive?: boolean
  }) {
    const product = await this.updateProductHandler.execute(
      new UpdateProductCommand(
        data.tenantId,
        data.id,
        data.name,
        data.unitPrice,
        data.description,
        data.currency,
        data.pricingType as ProductPricingType,
        data.taxRate,
        data.isActive,
      ),
    )
    return { json: JSON.stringify(CpqMapper.productToResponse(product)) }
  }

  @GrpcMethod('CpqService', 'DeleteProduct')
  async deleteProduct(data: { tenantId: string; id: string }) {
    await this.deleteProductHandler.execute(
      new DeleteProductCommand(data.tenantId, data.id),
    )
    return {}
  }

  @GrpcMethod('CpqService', 'GetProduct')
  async getProduct(data: { tenantId: string; id: string }) {
    const product = await this.getProductHandler.execute(
      new GetProductQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(CpqMapper.productToResponse(product)) }
  }

  @GrpcMethod('CpqService', 'ListProducts')
  async listProducts(data: { tenantId: string }) {
    const products = await this.listProductsHandler.execute(
      new ListProductsQuery(data.tenantId, false),
    )
    return {
      jsonItems: products.map((p) => JSON.stringify(CpqMapper.productToResponse(p))),
    }
  }

  @GrpcMethod('CpqService', 'CreateProductTemplate')
  async createProductTemplate(data: {
    tenantId: string
    name: string
    category?: string
    defaultSkuPrefix?: string
    defaultUnitPrice: number
    defaultCurrency?: string
    pricingType?: string
    defaultTaxRate?: number
    defaultDescription?: string
  }) {
    const template = await this.createTemplateHandler.execute(
      new CreateProductTemplateCommand(
        data.tenantId,
        data.name,
        data.defaultUnitPrice,
        data.category,
        data.defaultSkuPrefix,
        data.defaultCurrency,
        data.pricingType as ProductPricingType,
        data.defaultTaxRate,
        data.defaultDescription,
      ),
    )
    return { json: JSON.stringify(CpqMapper.productTemplateToResponse(template)) }
  }

  @GrpcMethod('CpqService', 'ListProductTemplates')
  async listProductTemplates(data: { tenantId: string }) {
    const templates = await this.listTemplatesHandler.execute(
      new ListProductTemplatesQuery(data.tenantId),
    )
    return {
      jsonItems: templates.map((t) => JSON.stringify(CpqMapper.productTemplateToResponse(t))),
    }
  }

  @GrpcMethod('CpqService', 'DeleteProductTemplate')
  async deleteProductTemplate(data: { tenantId: string; id: string }) {
    await this.deleteTemplateHandler.execute(
      new DeleteProductTemplateCommand(data.tenantId, data.id),
    )
    return {}
  }
}
