import { Role } from '../entities/role.entity'
import { Permission } from '../entities/permission.entity'
import { UserRole } from '../entities/user-role.entity'

export interface PaginatedRoles {
  data: Role[]
  nextCursor: string | null
}

export interface PaginatedPermissions {
  data: Permission[]
}

export abstract class IamRepository {
  // Roles
  abstract findRoleById(id: string): Promise<Role | null>
  abstract findRoleByName(tenantId: string, name: string): Promise<Role | null>
  abstract listRoles(tenantId: string, search?: string, cursor?: string, limit?: number): Promise<PaginatedRoles>
  abstract saveRole(role: Role): Promise<void>
  abstract deleteRole(tenantId: string, id: string): Promise<void>

  // Permissions
  abstract findPermissionById(id: string): Promise<Permission | null>
  abstract findPermissionByModuleAction(module: string, action: string): Promise<Permission | null>
  abstract listPermissions(module?: string): Promise<PaginatedPermissions>
  abstract savePermission(permission: Permission): Promise<void>

  // Role-Permission assignments
  abstract findRolePermissions(roleId: string): Promise<Permission[]>
  abstract assignPermissionToRole(roleId: string, permissionId: string): Promise<void>
  abstract removePermissionFromRole(roleId: string, permissionId: string): Promise<void>

  // User-Role assignments
  abstract findUserRoles(tenantId: string, userId: string): Promise<UserRole[]>
  abstract findUserPermissions(tenantId: string, userId: string): Promise<Permission[]>
  abstract assignRoleToUser(assignment: UserRole): Promise<void>
  abstract removeRoleFromUser(tenantId: string, userId: string, roleId: string): Promise<void>

  // Policy evaluation
  abstract checkPermission(tenantId: string, userId: string, module: string, action: string): Promise<boolean>
}
