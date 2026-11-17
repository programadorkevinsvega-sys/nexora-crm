import type { SalesTerritory, RouteLeadToTerritoryDto } from '@crm/contracts'

export class TerritoryRouterHelper {
  static findBestTerritory(
    territories: SalesTerritory[],
    lead: RouteLeadToTerritoryDto,
  ): SalesTerritory | null {
    const active = territories.filter((t) => t.isActive)
    if (active.length === 0) return null

    // 1. Exact match on Country + Industry
    if (lead.countryCode && lead.industry) {
      const match = active.find(
        (t) =>
          t.countryCodes.includes(lead.countryCode!.toUpperCase()) &&
          t.industries.includes(lead.industry!.toUpperCase()),
      )
      if (match) return match
    }

    // 2. Match on Country
    if (lead.countryCode) {
      const match = active.find((t) => t.countryCodes.includes(lead.countryCode!.toUpperCase()))
      if (match) return match
    }

    // 3. Match on Region
    if (lead.region) {
      const match = active.find((t) =>
        t.regions.some((r) => r.toLowerCase() === lead.region!.toLowerCase()),
      )
      if (match) return match
    }

    // 4. Default to first active territory
    return active[0]
  }
}
