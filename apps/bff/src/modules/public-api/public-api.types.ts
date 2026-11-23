import { BadRequestException } from '@nestjs/common'
import type { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'

type GrpcInput<Method extends keyof ApiCoreGrpcClient> = Parameters<ApiCoreGrpcClient[Method]>[0]
type WithoutTenant<T> = T extends { tenantId: string } ? Omit<T, 'tenantId'> : never
type WithoutTenantAndId<T> = T extends { tenantId: string; id: string }
  ? Omit<T, 'tenantId' | 'id'>
  : never

export interface PublicApiRequest {
  apiKeyContext: {
    tenantId: string
    scopes: string[]
    keyId: string
  }
}

export type RawPublicApiQuery = Record<string, string | string[] | undefined>
export type ListContactsQuery = WithoutTenant<GrpcInput<'listContacts'>>
export type CreateContactBody = WithoutTenant<GrpcInput<'createContact'>>
export type UpdateContactBody = WithoutTenantAndId<GrpcInput<'updateContact'>>
export type ListCompaniesQuery = WithoutTenant<GrpcInput<'listCompanies'>>
export type CreateCompanyBody = WithoutTenant<GrpcInput<'createCompany'>>
export type UpdateCompanyBody = WithoutTenantAndId<GrpcInput<'updateCompany'>>
export type ListDealsQuery = WithoutTenant<GrpcInput<'listDeals'>>
export type CreateDealBody = WithoutTenant<GrpcInput<'createDeal'>>
export type UpdateDealBody = WithoutTenantAndId<GrpcInput<'updateDeal'>>
export type ListNotesQuery = WithoutTenant<GrpcInput<'listNotes'>>
export type CreateNoteBody = WithoutTenant<GrpcInput<'createNote'>>
export type ListTasksQuery = WithoutTenant<GrpcInput<'listTasks'>>
export type CreateTaskBody = WithoutTenant<GrpcInput<'createTask'>>
export type UpdateTaskBody = WithoutTenantAndId<GrpcInput<'updateTask'>>
export type ListCallsQuery = WithoutTenant<GrpcInput<'listCalls'>>
export type CreateCallBody = WithoutTenant<GrpcInput<'createCall'>>
export type ListTicketsQuery = WithoutTenant<GrpcInput<'listTickets'>>
export type CreateTicketBody = WithoutTenant<GrpcInput<'createTicket'>>
export type CreateProductBody = WithoutTenant<GrpcInput<'createProduct'>>
export type ListQuotesQuery = WithoutTenant<GrpcInput<'listQuotes'>>
export type CreateQuoteBody = WithoutTenant<GrpcInput<'createQuote'>>
export type ListContractsQuery = WithoutTenant<GrpcInput<'listContracts'>>
export type CreateContractBody = WithoutTenant<GrpcInput<'createContract'>>
export type ListCampaignsQuery = WithoutTenant<GrpcInput<'listCampaigns'>>
export type CreateCampaignBody = WithoutTenant<GrpcInput<'createCampaign'>>
export type ListKbArticlesQuery = NonNullable<Parameters<ApiCoreGrpcClient['listKbArticles']>[1]>

interface QueryCoercion {
  allowedKeys: readonly string[]
  numericKeys?: readonly string[]
  booleanKeys?: readonly string[]
}

export function parsePublicApiQuery<T extends object>(
  rawQuery: RawPublicApiQuery,
  options: QueryCoercion,
): T {
  const result: Record<string, unknown> = {}
  const numericKeys = new Set(options.numericKeys ?? [])
  const booleanKeys = new Set(options.booleanKeys ?? [])
  const allowedKeys = new Set(options.allowedKeys)

  for (const [key, rawValue] of Object.entries(rawQuery)) {
    if (rawValue === undefined) continue
    if (!allowedKeys.has(key)) {
      throw new BadRequestException(`Unsupported query parameter: ${key}`)
    }
    if (Array.isArray(rawValue)) {
      throw new BadRequestException(`Query parameter ${key} must appear only once`)
    }
    if (numericKeys.has(key)) {
      const value = Number(rawValue)
      if (!Number.isSafeInteger(value) || value < 1) {
        throw new BadRequestException(`Query parameter ${key} must be a positive integer`)
      }
      result[key] = value
      continue
    }
    if (booleanKeys.has(key)) {
      if (rawValue !== 'true' && rawValue !== 'false') {
        throw new BadRequestException(`Query parameter ${key} must be true or false`)
      }
      result[key] = rawValue === 'true'
      continue
    }
    result[key] = rawValue
  }

  return result as T
}
