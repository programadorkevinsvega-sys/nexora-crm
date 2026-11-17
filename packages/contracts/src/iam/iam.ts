import { z } from 'zod'

export const CreateRoleSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
})
export type CreateRoleInput = z.infer<typeof CreateRoleSchema>

export const UpdateRoleSchema = z.object({
  tenantId: z.string().uuid(),
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
})
export type UpdateRoleInput = z.infer<typeof UpdateRoleSchema>

export const DeleteRoleSchema = z.object({
  tenantId: z.string().uuid(),
  id: z.string().uuid(),
})
export type DeleteRoleInput = z.infer<typeof DeleteRoleSchema>

export const CreatePermissionSchema = z.object({
  module: z.string().min(1).max(100),
  action: z.string().min(1).max(100),
  description: z.string().optional(),
})
export type CreatePermissionInput = z.infer<typeof CreatePermissionSchema>

export const AssignPermissionSchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
})
export type AssignPermissionInput = z.infer<typeof AssignPermissionSchema>

export const RemovePermissionSchema = z.object({
  roleId: z.string().uuid(),
  permissionId: z.string().uuid(),
})
export type RemovePermissionInput = z.infer<typeof RemovePermissionSchema>

export const AssignRoleSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
  branchId: z.string().uuid().optional(),
})
export type AssignRoleInput = z.infer<typeof AssignRoleSchema>

export const RemoveRoleSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
})
export type RemoveRoleInput = z.infer<typeof RemoveRoleSchema>

export const ListRolesQuerySchema = z.object({
  tenantId: z.string().uuid(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
})
export type ListRolesQueryInput = z.infer<typeof ListRolesQuerySchema>

export const CheckPermissionSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  module: z.string().min(1),
  action: z.string().min(1),
  branchId: z.string().uuid().optional(),
})
export type CheckPermissionInput = z.infer<typeof CheckPermissionSchema>
