import { z } from 'zod'

export const TerritoryMemberRoleSchema = z.enum(['PRIMARY_LEAD', 'ACCOUNT_EXEC', 'SDR', 'SPECIALIST'])
export type TerritoryMemberRole = z.infer<typeof TerritoryMemberRoleSchema>

export const SalesTerritorySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().nullable().optional(),
  parentTerritoryId: z.string().uuid().nullable().optional(),
  countryCodes: z.array(z.string()),
  regions: z.array(z.string()),
  industries: z.array(z.string()),
  minEmployeeCount: z.number().nullable().optional(),
  maxEmployeeCount: z.number().nullable().optional(),
  managerUserId: z.string().uuid().nullable().optional(),
  quotaTargetUsd: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type SalesTerritory = z.infer<typeof SalesTerritorySchema>

export const CreateTerritoryDtoSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
  countryCodes: z.array(z.string()).default([]),
  regions: z.array(z.string()).default([]),
  industries: z.array(z.string()).default([]),
  minEmployeeCount: z.number().min(1).default(1).optional(),
  maxEmployeeCount: z.number().optional(),
  quotaTargetUsd: z.number().min(0).default(100000.0),
  isActive: z.boolean().default(true).optional(),
})
export type CreateTerritoryDto = z.infer<typeof CreateTerritoryDtoSchema>

export const TerritoryMemberSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  territoryId: z.string().uuid(),
  userId: z.string().uuid(),
  role: TerritoryMemberRoleSchema,
  createdAt: z.string(),
})
export type TerritoryMember = z.infer<typeof TerritoryMemberSchema>

export const RouteLeadToTerritoryDtoSchema = z.object({
  countryCode: z.string().optional(),
  region: z.string().optional(),
  industry: z.string().optional(),
  employeeCount: z.number().optional(),
})
export type RouteLeadToTerritoryDto = z.infer<typeof RouteLeadToTerritoryDtoSchema>
