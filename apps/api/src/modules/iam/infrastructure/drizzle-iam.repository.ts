/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common'
import { eq, and, ilike, gt, asc, inArray } from 'drizzle-orm'
import { getDb } from '@crm/database'
import {
  roles as rolesTable,
  permissions as permissionsTable,
  rolePermissions as rolePermissionsTable,
  userRoles as userRolesTable,
} from '@crm/database'
import { IamRepository, PaginatedRoles, PaginatedPermissions } from '../domain/repositories/iam.repository'
import { Role } from '../domain/entities/role.entity'
import { Permission } from '../domain/entities/permission.entity'
import { UserRole } from '../domain/entities/user-role.entity'
import { IamMapper } from './iam.mapper'

@Injectable()
export class DrizzleIamRepository extends IamRepository {
  private get db() {
    return getDb()
  }

  // ── Roles ──────────────────────────────────────────

  async findRoleById(id: string): Promise<Role | null> {
    const row = await this.db.query.roles.findFirst({
      where: eq(rolesTable.id, id) as any,
    })
    if (!row) return null
    return IamMapper.roleToDomain(row as any)
  }

  async findRoleByName(tenantId: string, name: string): Promise<Role | null> {
    const row = await this.db.query.roles.findFirst({
      where: and(
        eq(rolesTable.tenantId, tenantId) as any,
        eq(rolesTable.name, name) as any,
      ) as any,
    })
    if (!row) return null
    return IamMapper.roleToDomain(row as any)
  }

  async listRoles(tenantId: string, search?: string, cursor?: string, limit = 20): Promise<PaginatedRoles> {
    const conditions: any[] = [eq(rolesTable.tenantId, tenantId)]
    if (cursor) conditions.push(gt(rolesTable.createdAt, new Date(cursor)))
    if (search) conditions.push(ilike(rolesTable.name, `%${search}%`) as any)

    const rows = await this.db.query.roles.findMany({
      where: and(...conditions.filter(Boolean)) as any,
      limit: limit + 1,
      orderBy: [asc(rolesTable.createdAt), asc(rolesTable.id)],
    })

    const hasMore = rows.length > limit
    const data = hasMore ? rows.slice(0, limit) : rows

    return {
      data: data.map(r => IamMapper.roleToDomain(r as any)),
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    }
  }

  async saveRole(role: Role): Promise<void> {
    const row = IamMapper.roleToPersistence(role)
    await this.db.insert(rolesTable).values(row as any).onConflictDoUpdate({
      target: rolesTable.id,
      set: row as any,
    })
  }

  async deleteRole(tenantId: string, id: string): Promise<void> {
    await this.db.delete(rolePermissionsTable).where(
      eq(rolePermissionsTable.roleId, id) as any,
    )
    await this.db.delete(userRolesTable).where(
      eq(userRolesTable.roleId, id) as any,
    )
    await this.db.delete(rolesTable).where(
      and(eq(rolesTable.tenantId, tenantId), eq(rolesTable.id, id)) as any,
    )
  }

  // ── Permissions ─────────────────────────────────────

  async findPermissionById(id: string): Promise<Permission | null> {
    const row = await this.db.query.permissions.findFirst({
      where: eq(permissionsTable.id, id) as any,
    })
    if (!row) return null
    return IamMapper.permissionToDomain(row as any)
  }

  async findPermissionByModuleAction(module: string, action: string): Promise<Permission | null> {
    const row = await this.db.query.permissions.findFirst({
      where: and(
        eq(permissionsTable.module, module) as any,
        eq(permissionsTable.action, action) as any,
      ) as any,
    })
    if (!row) return null
    return IamMapper.permissionToDomain(row as any)
  }

  async listPermissions(module?: string): Promise<PaginatedPermissions> {
    const conditions: any[] = []
    if (module) conditions.push(eq(permissionsTable.module, module))

    const rows = await this.db.query.permissions.findMany({
      where: conditions.length ? and(...conditions) as any : undefined,
      orderBy: [asc(permissionsTable.module), asc(permissionsTable.action)],
    })

    return { data: rows.map(r => IamMapper.permissionToDomain(r as any)) }
  }

  async savePermission(permission: Permission): Promise<void> {
    const row = IamMapper.permissionToPersistence(permission)
    await this.db.insert(permissionsTable).values(row as any).onConflictDoUpdate({
      target: permissionsTable.id,
      set: row as any,
    })
  }

  // ── Role-Permission assignments ─────────────────────

  async findRolePermissions(roleId: string): Promise<Permission[]> {
    const rpRows = await this.db.query.rolePermissions.findMany({
      where: eq(rolePermissionsTable.roleId, roleId) as any,
    })
    if (!rpRows.length) return []

    const permissionIds = rpRows.map(r => r.permissionId)
    const rows = await this.db.query.permissions.findMany({
      where: inArray(permissionsTable.id, permissionIds) as any,
    })
    return rows.map(r => IamMapper.permissionToDomain(r as any))
  }

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await this.db.insert(rolePermissionsTable).values({
      roleId, permissionId,
    } as any).onConflictDoNothing()
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.db.delete(rolePermissionsTable).where(
      and(
        eq(rolePermissionsTable.roleId, roleId) as any,
        eq(rolePermissionsTable.permissionId, permissionId) as any,
      ) as any,
    )
  }

  // ── User-Role assignments ───────────────────────────

  async findUserRoles(tenantId: string, userId: string): Promise<UserRole[]> {
    const rows = await this.db.query.userRoles.findMany({
      where: and(
        eq(userRolesTable.tenantId, tenantId) as any,
        eq(userRolesTable.userId, userId) as any,
      ) as any,
    })
    return rows.map(r => IamMapper.userRoleToDomain(r as any))
  }

  async findUserPermissions(tenantId: string, userId: string): Promise<Permission[]> {
    const urRows = await this.db.query.userRoles.findMany({
      where: and(
        eq(userRolesTable.tenantId, tenantId) as any,
        eq(userRolesTable.userId, userId) as any,
      ) as any,
    })
    if (!urRows.length) return []

    const roleIds = urRows.map(r => r.roleId)
    const rpRows = await this.db.query.rolePermissions.findMany({
      where: inArray(rolePermissionsTable.roleId, roleIds) as any,
    })
    if (!rpRows.length) return []

    const permissionIds = rpRows.map(r => r.permissionId)
    const rows = await this.db.query.permissions.findMany({
      where: inArray(permissionsTable.id, permissionIds) as any,
    })
    return rows.map(r => IamMapper.permissionToDomain(r as any))
  }

  async assignRoleToUser(assignment: UserRole): Promise<void> {
    await this.db.insert(userRolesTable).values({
      userId: assignment.userId,
      roleId: assignment.roleId,
      tenantId: assignment.tenantId,
      branchId: assignment.branchId,
      grantedAt: assignment.grantedAt,
    } as any).onConflictDoNothing()
  }

  async removeRoleFromUser(tenantId: string, userId: string, roleId: string): Promise<void> {
    await this.db.delete(userRolesTable).where(
      and(
        eq(userRolesTable.tenantId, tenantId) as any,
        eq(userRolesTable.userId, userId) as any,
        eq(userRolesTable.roleId, roleId) as any,
      ) as any,
    )
  }

  // ── Policy evaluation ───────────────────────────────

  async checkPermission(tenantId: string, userId: string, module: string, action: string): Promise<boolean> {
    const permissions = await this.findUserPermissions(tenantId, userId)
    return permissions.some(p => p.module === module && p.action === action)
  }
}
