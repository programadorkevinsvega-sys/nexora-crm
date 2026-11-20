/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { eq, and, ilike, gt, asc, inArray, sql } from 'drizzle-orm'
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
import { assertTenantHasRemainingAdmin } from './tenant-admin-invariant'

@Injectable()
export class DrizzleIamRepository extends IamRepository {
  private get db() {
    return getDb()
  }

  private async lockTenantRoleChanges(tx: any, tenantId: string): Promise<void> {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${tenantId}, 0))`)
  }

  private async tenantAdminUserIds(tx: any, tenantId: string, adminRoleId: string): Promise<string[]> {
    const rows = await tx.select({ userId: userRolesTable.userId })
      .from(userRolesTable)
      .where(and(
        eq(userRolesTable.tenantId, tenantId),
        eq(userRolesTable.roleId, adminRoleId),
      ) as any)
    return [...new Set(rows.map((row) => row.userId))]
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
    await this.db.transaction(async (tx) => {
      await this.lockTenantRoleChanges(tx, role.tenantId)
      const existing = await tx.query.roles.findFirst({
        where: and(
          eq(rolesTable.tenantId, role.tenantId),
          eq(rolesTable.id, role.id),
        ) as any,
      })
      if (existing?.name.toLowerCase() === 'admin' && role.name.toLowerCase() !== 'admin') {
        const adminUsers = await this.tenantAdminUserIds(tx, role.tenantId, role.id)
        if (adminUsers.length > 0) {
          throw new ConflictException('The tenant admin role cannot be renamed while it is assigned')
        }
      }
      const row = IamMapper.roleToPersistence(role)
      await tx.insert(rolesTable).values(row as any).onConflictDoUpdate({
        target: rolesTable.id,
        set: row as any,
      })
    })
  }

  async deleteRole(tenantId: string, id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await this.lockTenantRoleChanges(tx, tenantId)
      const role = await tx.query.roles.findFirst({
        where: and(eq(rolesTable.tenantId, tenantId), eq(rolesTable.id, id)) as any,
      })
      if (!role) return
      if (role.name.toLowerCase() === 'admin') {
        const adminUsers = await this.tenantAdminUserIds(tx, tenantId, id)
        if (adminUsers.length > 0) {
          throw new ConflictException('The tenant admin role cannot be deleted while it is assigned')
        }
      }

      await tx.delete(rolePermissionsTable).where(
        eq(rolePermissionsTable.roleId, id) as any,
      )
      await tx.delete(userRolesTable).where(
        and(
          eq(userRolesTable.tenantId, tenantId) as any,
          eq(userRolesTable.roleId, id) as any,
        ) as any,
      )
      await tx.delete(rolesTable).where(
        and(eq(rolesTable.tenantId, tenantId), eq(rolesTable.id, id)) as any,
      )
    })
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
    const rows = await this.db
      .select({
        userId: userRolesTable.userId,
        roleId: userRolesTable.roleId,
        tenantId: userRolesTable.tenantId,
        branchId: userRolesTable.branchId,
        grantedAt: userRolesTable.grantedAt,
      })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(and(
        eq(userRolesTable.tenantId, tenantId) as any,
        eq(userRolesTable.userId, userId) as any,
        eq(rolesTable.tenantId, tenantId) as any,
      ) as any)
    return rows.map(r => IamMapper.userRoleToDomain(r as any))
  }

  async findUserPermissions(tenantId: string, userId: string): Promise<Permission[]> {
    const urRows = await this.db
      .select({ roleId: userRolesTable.roleId })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(and(
        eq(userRolesTable.tenantId, tenantId) as any,
        eq(userRolesTable.userId, userId) as any,
        eq(rolesTable.tenantId, tenantId) as any,
      ) as any)
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
    await this.db.transaction(async (tx) => {
      await this.lockTenantRoleChanges(tx, assignment.tenantId)
      const role = await tx.query.roles.findFirst({
        where: and(
          eq(rolesTable.tenantId, assignment.tenantId),
          eq(rolesTable.id, assignment.roleId),
        ) as any,
      })
      if (!role) throw new NotFoundException('Role not found')
      await tx.insert(userRolesTable).values({
        userId: assignment.userId,
        roleId: assignment.roleId,
        tenantId: assignment.tenantId,
        branchId: assignment.branchId,
        grantedAt: assignment.grantedAt,
      } as any).onConflictDoNothing()
    })
  }

  async replaceRolesForUser(tenantId: string, userId: string, assignment: UserRole): Promise<UserRole[]> {
    return this.db.transaction(async (tx) => {
      await this.lockTenantRoleChanges(tx, tenantId)
      const targetRole = await tx.query.roles.findFirst({
        where: and(
          eq(rolesTable.tenantId, tenantId),
          eq(rolesTable.id, assignment.roleId),
        ) as any,
      })
      if (!targetRole) throw new NotFoundException('Role not found')
      const previousRows = await tx
        .select({
          userId: userRolesTable.userId,
          roleId: userRolesTable.roleId,
          tenantId: userRolesTable.tenantId,
          branchId: userRolesTable.branchId,
          grantedAt: userRolesTable.grantedAt,
        })
        .from(userRolesTable)
        .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
        .where(and(
          eq(userRolesTable.tenantId, tenantId) as any,
          eq(userRolesTable.userId, userId) as any,
          eq(rolesTable.tenantId, tenantId) as any,
        ) as any)

      const adminRole = await tx.query.roles.findFirst({
        where: and(
          eq(rolesTable.tenantId, tenantId),
          ilike(rolesTable.name, 'admin'),
        ) as any,
      })
      if (adminRole && previousRows.some((row) => row.roleId === adminRole.id)) {
        const adminUsers = await this.tenantAdminUserIds(tx, tenantId, adminRole.id)
        assertTenantHasRemainingAdmin(adminUsers, userId, assignment.roleId === adminRole.id)
      }

      await tx.delete(userRolesTable).where(and(
        eq(userRolesTable.tenantId, tenantId) as any,
        eq(userRolesTable.userId, userId) as any,
      ) as any)

      await tx.insert(userRolesTable).values({
        userId: assignment.userId,
        roleId: assignment.roleId,
        tenantId: assignment.tenantId,
        branchId: assignment.branchId,
        grantedAt: assignment.grantedAt,
      } as any)

      return previousRows.map((row) => IamMapper.userRoleToDomain(row as any))
    })
  }

  async removeRoleFromUser(tenantId: string, userId: string, roleId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await this.lockTenantRoleChanges(tx, tenantId)
      const role = await tx.query.roles.findFirst({
        where: and(
          eq(rolesTable.tenantId, tenantId),
          eq(rolesTable.id, roleId),
        ) as any,
      })
      if (role?.name.toLowerCase() === 'admin') {
        const adminUsers = await this.tenantAdminUserIds(tx, tenantId, roleId)
        assertTenantHasRemainingAdmin(adminUsers, userId, false)
      }
      await tx.delete(userRolesTable).where(and(
        eq(userRolesTable.tenantId, tenantId) as any,
        eq(userRolesTable.userId, userId) as any,
        eq(userRolesTable.roleId, roleId) as any,
      ) as any)
    })
  }

  // ── Policy evaluation ───────────────────────────────

  async checkPermission(tenantId: string, userId: string, module: string, action: string): Promise<boolean> {
    const permissions = await this.findUserPermissions(tenantId, userId)
    return permissions.some(p => p.module === module && p.action === action)
  }
}
