import { Injectable } from '@nestjs/common'
import { ListProductTemplatesQuery } from './product-template.queries'
import { ProductTemplateRepository } from '../../domain/repositories/product-template.repository'
import { ProductTemplate } from '../../domain/entities/product-template.entity'

@Injectable()
export class ListProductTemplatesHandler {
  constructor(private readonly repo: ProductTemplateRepository) {}

  async execute(query: ListProductTemplatesQuery): Promise<ProductTemplate[]> {
    return this.repo.list(query.tenantId)
  }
}
