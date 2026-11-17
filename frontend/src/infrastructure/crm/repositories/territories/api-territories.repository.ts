import type {
  SalesTerritory,
  CreateTerritoryDto,
  TerritoryMember,
  TerritoryMemberRole,
  RouteLeadToTerritoryDto,
} from '@crm/contracts'

export class ApiTerritoriesRepository {
  static async listTerritories(): Promise<SalesTerritory[]> {
    const res = await fetch('/api/territories', { credentials: 'include' })
    if (!res.ok) throw new Error('Error al listar territorios de ventas')
    return res.json()
  }

  static async createTerritory(dto: CreateTerritoryDto): Promise<SalesTerritory> {
    const res = await fetch('/api/territories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al crear territorio de ventas')
    return res.json()
  }

  static async assignMember(
    territoryId: string,
    userId: string,
    role: TerritoryMemberRole = 'ACCOUNT_EXEC',
  ): Promise<TerritoryMember> {
    const res = await fetch(`/api/territories/${territoryId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, role }),
    })
    if (!res.ok) throw new Error('Error al asignar miembro a territorio')
    return res.json()
  }

  static async listMembers(territoryId: string): Promise<TerritoryMember[]> {
    const res = await fetch(`/api/territories/${territoryId}/members`, {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al listar miembros del territorio')
    return res.json()
  }

  static async routeLead(dto: RouteLeadToTerritoryDto): Promise<SalesTerritory | null> {
    const res = await fetch('/api/territories/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(dto),
    })
    if (!res.ok) throw new Error('Error al enrutar lead a territorio')
    return res.json()
  }
}
