import type {
  SalesTerritory,
  CreateTerritoryDto,
  TerritoryMember,
  TerritoryMemberRole,
  RouteLeadToTerritoryDto,
} from '@crm/contracts'
import { api } from '../../api/api-client'

export class ApiTerritoriesRepository {
  static async listTerritories(): Promise<SalesTerritory[]> {
    return api.get<SalesTerritory[]>('/api/territories')
  }

  static async createTerritory(dto: CreateTerritoryDto): Promise<SalesTerritory> {
    return api.post<SalesTerritory>('/api/territories', dto)
  }

  static async assignMember(
    territoryId: string,
    userId: string,
    role: TerritoryMemberRole = 'ACCOUNT_EXEC',
  ): Promise<TerritoryMember> {
    return api.post<TerritoryMember>(`/api/territories/${territoryId}/members`, { userId, role })
  }

  static async listMembers(territoryId: string): Promise<TerritoryMember[]> {
    return api.get<TerritoryMember[]>(`/api/territories/${territoryId}/members`)
  }

  static async routeLead(dto: RouteLeadToTerritoryDto): Promise<SalesTerritory | null> {
    return api.post<SalesTerritory | null>('/api/territories/route', dto)
  }
}
