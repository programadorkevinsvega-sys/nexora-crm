import { api } from '@/src/infrastructure/crm/api/api-client'
import type {
  Branch,
  CreateBranchDto,
  TenantTax,
  CreateTenantTaxDto,
  TenantCurrency,
  CreateTenantCurrencyDto,
} from '@crm/contracts'

export class ApiTenantConfigRepository {
  // --- 1. BRANCHES ---
  static async listBranches(): Promise<Branch[]> {
    return api.get<Branch[]>('/tenant/branches')
  }

  static async createBranch(dto: CreateBranchDto): Promise<Branch> {
    return api.post<Branch>('/tenant/branches', dto)
  }

  // --- 2. TAXES ---
  static async listTaxes(): Promise<TenantTax[]> {
    return api.get<TenantTax[]>('/tenant/taxes')
  }

  static async createTax(dto: CreateTenantTaxDto): Promise<TenantTax> {
    return api.post<TenantTax>('/tenant/taxes', dto)
  }

  // --- 3. CURRENCIES ---
  static async listCurrencies(): Promise<TenantCurrency[]> {
    return api.get<TenantCurrency[]>('/tenant/currencies')
  }

  static async createCurrency(dto: CreateTenantCurrencyDto): Promise<TenantCurrency> {
    return api.post<TenantCurrency>('/tenant/currencies', dto)
  }
}
