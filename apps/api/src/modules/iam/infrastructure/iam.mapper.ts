import { Role } from '../domain/entities/role.entity'
import { Permission } from '../domain/entities/permission.entity'
import { UserRole } from '../domain/entities/user-role.entity'

type RoleRow = {
  id: string
  tenantId: string
  name: string
  description: string | null
  isSystemRole: boolean | null
  createdAt: Date
  updatedAt: Date
}

type PermissionRow = {
  id: string
  module: string
  action: string
  description: string | null
}

type UserRoleRow = {
  userId: string
  roleId: string
  tenantId: string
  branchId: string | null
  grantedAt: Date
}

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
