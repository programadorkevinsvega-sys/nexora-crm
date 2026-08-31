import { Company } from '../../domain/entities/company.entity'

describe('Company Domain Entity', () => {
  it('should create company instance with nullable financial and industry fields', () => {
    const company = Company.create({
      tenantId: 'tenant-1',
      name: 'Stark Industries',
      taxId: 'US-99887766',
      website: 'https://starkindustries.com',
      industry: 'Defense & Clean Energy',
      numberOfEmployees: 5000,
      annualRevenue: 1000000000,
      description: 'Advanced technology conglomerate',
    })

    expect(company.id).toBeDefined()
    expect(company.name).toBe('Stark Industries')
    expect(company.taxId).toBe('US-99887766')
    expect(company.numberOfEmployees).toBe(5000)
    expect(company.annualRevenue).toBe(1000000000)
    expect(company.createdAt).toBeInstanceOf(Date)
    expect(company.updatedAt).toBeInstanceOf(Date)
  })

  it('should update company properties immutably', () => {
    const company = Company.create({
      tenantId: 'tenant-1',
      name: 'Wayne Enterprises',
      industry: 'Conglomerate',
    })

    const updated = company.update({
      name: 'Wayne Foundation',
      numberOfEmployees: 250,
      annualRevenue: 50000000,
    })

    expect(updated.name).toBe('Wayne Foundation')
    expect(updated.numberOfEmployees).toBe(250)
    expect(updated.annualRevenue).toBe(50000000)
    expect(company.name).toBe('Wayne Enterprises') // immutability check
  })

  it('should handle parent company hierarchical relationships', () => {
    const parent = Company.create({ tenantId: 'tenant-1', name: 'Alphabet Inc' })
    const subsidiary = Company.create({
      tenantId: 'tenant-1',
      name: 'Google LLC',
      parentCompanyId: parent.id,
    })

    expect(subsidiary.parentCompanyId).toBe(parent.id)
  })
})
