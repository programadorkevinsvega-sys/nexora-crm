import { Product } from '../../domain/entities/product.entity'

describe('Product Entity', () => {
  it('should create product with valid data and active status', () => {
    const product = Product.create({
      tenantId: 'tenant-1',
      sku: 'PROD-ENTERPRISE-01',
      name: 'Enterprise Cloud License',
      unitPrice: 1200,
      pricingType: 'MONTHLY_SUBSCRIPTION',
      taxRate: 19,
    })

    expect(product.sku).toBe('PROD-ENTERPRISE-01')
    expect(product.unitPrice).toBe(1200)
    expect(product.isActive).toBe(true)
  })

  it('should toggle active status', () => {
    const product = Product.create({
      tenantId: 'tenant-1',
      sku: 'PROD-02',
      name: 'Addon Module',
      unitPrice: 300,
    })

    const toggled = product.toggleActive()
    expect(toggled.isActive).toBe(false)
  })
})
