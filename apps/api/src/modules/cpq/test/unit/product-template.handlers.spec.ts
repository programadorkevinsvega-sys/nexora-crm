import { CreateProductTemplateHandler, DeleteProductTemplateHandler } from '../../application/commands/product-template.handlers'
import { ListProductTemplatesHandler } from '../../application/queries/product-template.handlers'
import { CreateProductTemplateCommand, DeleteProductTemplateCommand } from '../../application/commands/product-template.commands'
import { ListProductTemplatesQuery } from '../../application/queries/product-template.queries'
import { ProductTemplateRepository } from '../../domain/repositories/product-template.repository'
import { ProductTemplate } from '../../domain/entities/product-template.entity'

describe('ProductTemplate Handlers', () => {
  let templateRepo: jest.Mocked<ProductTemplateRepository>

  beforeEach(() => {
    templateRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      list: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
    }
  })

  it('CreateProductTemplateHandler should save template', async () => {
    const handler = new CreateProductTemplateHandler(templateRepo)
    const result = await handler.execute(
      new CreateProductTemplateCommand('tenant-1', 'SaaS Starter', 99, 'SOFTWARE', 'SAAS-', 'USD', 'MONTHLY_SUBSCRIPTION'),
    )

    expect(result.id).toBeDefined()
    expect(result.name).toBe('SaaS Starter')
    expect(result.pricingType).toBe('MONTHLY_SUBSCRIPTION')
    expect(templateRepo.save).toHaveBeenCalledTimes(1)
  })

  it('ListProductTemplatesHandler should list templates', async () => {
    const template = ProductTemplate.create({
      tenantId: 'tenant-1',
      name: 'Consulting Retainer',
      defaultUnitPrice: 1500,
      pricingType: 'RETAINER',
    })
    templateRepo.list.mockResolvedValue([template])

    const handler = new ListProductTemplatesHandler(templateRepo)
    const list = await handler.execute(new ListProductTemplatesQuery('tenant-1'))

    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('Consulting Retainer')
  })

  it('DeleteProductTemplateHandler should delete template', async () => {
    const handler = new DeleteProductTemplateHandler(templateRepo)
    await handler.execute(new DeleteProductTemplateCommand('tenant-1', 'tmpl-123'))

    expect(templateRepo.delete).toHaveBeenCalledWith('tenant-1', 'tmpl-123')
  })
})
