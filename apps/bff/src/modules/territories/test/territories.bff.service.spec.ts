import { TerritoryRouterHelper } from '../territory-router.helper'
import type { SalesTerritory } from '@crm/contracts'

describe('TerritoryRouterHelper', () => {
  const mockTerritories: SalesTerritory[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      tenantId: '00000000-0000-0000-0000-000000000001',
      name: 'Región Andina',
      code: 'TERR-ANDES',
      countryCodes: ['CO', 'PE', 'EC'],
      regions: ['Andina'],
      industries: ['FINTECH', 'SAAS'],
      quotaTargetUsd: 250000,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      tenantId: '00000000-0000-0000-0000-000000000001',
      name: 'México B2B',
      code: 'TERR-MEX',
      countryCodes: ['MX'],
      regions: ['Norteamérica'],
      industries: ['RETAIL', 'MANUFACTURING'],
      quotaTargetUsd: 450000,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  it('should route lead from Colombia to Región Andina', () => {
    const match = TerritoryRouterHelper.findBestTerritory(mockTerritories, {
      countryCode: 'CO',
      industry: 'FINTECH',
    })

    expect(match).toBeDefined()
    expect(match?.code).toBe('TERR-ANDES')
  })

  it('should route lead from Mexico to Mexico B2B', () => {
    const match = TerritoryRouterHelper.findBestTerritory(mockTerritories, {
      countryCode: 'MX',
    })

    expect(match).toBeDefined()
    expect(match?.code).toBe('TERR-MEX')
  })
})
