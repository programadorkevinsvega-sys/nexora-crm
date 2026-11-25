import { Role } from '../domain/entities/role.entity'
import { Permission } from '../domain/entities/permission.entity'
import { UserRole } from '../domain/entities/user-role.entity'
import type { roles, permissions, userRoles } from '@crm/database'

type RoleRow = typeof roles.$inferSelect
type PermissionRow = typeof permissions.$inferSelect
type UserRoleRow = Pick<typeof userRoles.$inferSelect, 'userId' | 'roleId' | 'tenantId' | 'branchId' | 'grantedAt'>

export class IamMapper {
  static roleToDomain(row: RoleRow): Role {
    return new Role(
      row.id, row.tenantId, row.name,
      row.description, row.isSystemRole ?? false,
      row.createdAt, row.updatedAt,
    )
  }

  static roleToPersistence(role: Role): RoleRow {
    return {
      id: role.id,
      tenantId: role.tenantId,
      name: role.name,
      description: role.description,
      isSystemRole: role.isSystemRole,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }
  }

  static roleToResponse(role: Role) {
    return {
      id: role.id,
      tenantId: role.tenantId,
      name: role.name,
      description: role.description,
      isSystemRole: role.isSystemRole,
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    }
  }

  static permissionToDomain(row: PermissionRow): Permission {
    return new Permission(row.id, row.module, row.action, row.description)
  }

  static permissionToPersistence(permission: Permission): PermissionRow {
    return {
      id: permission.id,
      module: permission.module,
      action: permission.action,
      description: permission.description,
    }
  }

  static permissionToResponse(permission: Permission) {
    return {
      id: permission.id,
      module: permission.module,
      action: permission.action,
      description: permission.description,
    }
  }

  static userRoleToDomain(row: UserRoleRow): UserRole {
    return new UserRole(row.userId, row.roleId, row.tenantId, row.branchId, row.grantedAt)
  }

  static userRoleToResponse(assignment: UserRole) {
    return {
      userId: assignment.userId,
      roleId: assignment.roleId,
      tenantId: assignment.tenantId,
      branchId: assignment.branchId,
      grantedAt: assignment.grantedAt.toISOString(),
    }
  }
}
