import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { eq, and, ilike, gt, asc, inArray, sql } from 'drizzle-orm'
import type { SQL } from 'drizzle-orm'
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

type Transaction = Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0]

@Injectable()
export class DrizzleIamRepository extends IamRepository {
  private get db() {
    return getDb()
  }

  private async lockTenantRoleChanges(tx: Transaction, tenantId: string): Promise<void> {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${tenantId}, 0))`)
  }

  private async tenantAdminUserIds(tx: Transaction, tenantId: string, adminRoleId: string): Promise<string[]> {
    const rows = await tx.select({ userId: userRolesTable.userId })
      .from(userRolesTable)
      .where(and(
        eq(userRolesTable.tenantId, tenantId),
        eq(userRolesTable.roleId, adminRoleId),
      ))
    return [...new Set(rows.map((row) => row.userId))]
  }

  // ── Roles ──────────────────────────────────────────

  async findRoleById(id: string): Promise<Role | null> {
    const row = await this.db.query.roles.findFirst({
      where: eq(rolesTable.id, id),
    })
    if (!row) return null
    return IamMapper.roleToDomain(row)
  }

  async findRoleByName(tenantId: string, name: string): Promise<Role | null> {
    const row = await this.db.query.roles.findFirst({
      where: and(
        eq(rolesTable.tenantId, tenantId),
        eq(rolesTable.name, name),
      ),
    })
    if (!row) return null
    return IamMapper.roleToDomain(row)
  }

  async listRoles(tenantId: string, search?: string, cursor?: string, limit = 20): Promise<PaginatedRoles> {
    const conditions: SQL[] = [eq(rolesTable.tenantId, tenantId)]
    if (cursor) conditions.push(gt(rolesTable.createdAt, new Date(cursor)))
    if (search) conditions.push(ilike(rolesTable.name, `%${search}%`))

    const rows = await this.db.query.roles.findMany({
      where: and(...conditions),
      limit: limit + 1,
      orderBy: [asc(rolesTable.createdAt), asc(rolesTable.id)],
    })

    const hasMore = rows.length > limit
    const data = hasMore ? rows.slice(0, limit) : rows

    return {
      data: data.map(r => IamMapper.roleToDomain(r)),
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
        ),
      })
      if (existing?.name.toLowerCase() === 'admin' && role.name.toLowerCase() !== 'admin') {
        throw new ConflictException('The tenant admin role name is reserved')
      }
      const row = IamMapper.roleToPersistence(role)
      await tx.insert(rolesTable).values(row).onConflictDoUpdate({
        target: rolesTable.id,
        set: row,
      })
    })
  }

  async deleteRole(tenantId: string, id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await this.lockTenantRoleChanges(tx, tenantId)
      const role = await tx.query.roles.findFirst({
        where: and(eq(rolesTable.tenantId, tenantId), eq(rolesTable.id, id)),
      })
      if (!role) return
      if (role.name.toLowerCase() === 'admin') {
        throw new ConflictException('The tenant admin role cannot be deleted')
      }

      await tx.delete(rolePermissionsTable).where(
        eq(rolePermissionsTable.roleId, id),
      )
      await tx.delete(userRolesTable).where(
        and(
          eq(userRolesTable.tenantId, tenantId),
          eq(userRolesTable.roleId, id),
        ),
      )
      await tx.delete(rolesTable).where(
        and(eq(rolesTable.tenantId, tenantId), eq(rolesTable.id, id)),
      )
    })
  }

  // ── Permissions ─────────────────────────────────────

  async findPermissionById(id: string): Promise<Permission | null> {
    const row = await this.db.query.permissions.findFirst({
      where: eq(permissionsTable.id, id),
    })
    if (!row) return null
    return IamMapper.permissionToDomain(row)
  }

  async findPermissionByModuleAction(module: string, action: string): Promise<Permission | null> {
    const row = await this.db.query.permissions.findFirst({
      where: and(
        eq(permissionsTable.module, module),
        eq(permissionsTable.action, action),
      ),
    })
    if (!row) return null
    return IamMapper.permissionToDomain(row)
  }

  async listPermissions(module?: string): Promise<PaginatedPermissions> {
    const conditions: SQL[] = []
    if (module) conditions.push(eq(permissionsTable.module, module))

    const rows = await this.db.query.permissions.findMany({
      where: conditions.length ? and(...conditions) : undefined,
      orderBy: [asc(permissionsTable.module), asc(permissionsTable.action)],
    })

    return { data: rows.map(r => IamMapper.permissionToDomain(r)) }
  }

  async savePermission(permission: Permission): Promise<void> {
    const row = IamMapper.permissionToPersistence(permission)
    await this.db.insert(permissionsTable).values(row).onConflictDoUpdate({
      target: permissionsTable.id,
      set: row,
    })
  }

  // ── Role-Permission assignments ─────────────────────

  async findRolePermissions(roleId: string): Promise<Permission[]> {
    const rpRows = await this.db.query.rolePermissions.findMany({
      where: eq(rolePermissionsTable.roleId, roleId),
    })
    if (!rpRows.length) return []

    const permissionIds = rpRows.map(r => r.permissionId)
    const rows = await this.db.query.permissions.findMany({
      where: inArray(permissionsTable.id, permissionIds),
    })
    return rows.map(r => IamMapper.permissionToDomain(r))
  }

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await this.db.insert(rolePermissionsTable).values({
      roleId, permissionId,
    }).onConflictDoNothing()
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await this.db.delete(rolePermissionsTable).where(
      and(
        eq(rolePermissionsTable.roleId, roleId),
        eq(rolePermissionsTable.permissionId, permissionId),
      ),
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
        eq(userRolesTable.tenantId, tenantId),
        eq(userRolesTable.userId, userId),
        eq(rolesTable.tenantId, tenantId),
      ))
    return rows.map(r => IamMapper.userRoleToDomain(r))
  }

  async findUserPermissions(tenantId: string, userId: string): Promise<Permission[]> {
    const urRows = await this.db
      .select({ roleId: userRolesTable.roleId })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .where(and(
        eq(userRolesTable.tenantId, tenantId),
        eq(userRolesTable.userId, userId),
        eq(rolesTable.tenantId, tenantId),
      ))
    if (!urRows.length) return []

    const roleIds = urRows.map(r => r.roleId)
    const rpRows = await this.db.query.rolePermissions.findMany({
      where: inArray(rolePermissionsTable.roleId, roleIds),
    })
    if (!rpRows.length) return []

    const permissionIds = rpRows.map(r => r.permissionId)
    const rows = await this.db.query.permissions.findMany({
      where: inArray(permissionsTable.id, permissionIds),
    })
    return rows.map(r => IamMapper.permissionToDomain(r))
  }

  async assignRoleToUser(assignment: UserRole): Promise<void> {
    await this.db.transaction(async (tx) => {
      await this.lockTenantRoleChanges(tx, assignment.tenantId)
      const role = await tx.query.roles.findFirst({
        where: and(
          eq(rolesTable.tenantId, assignment.tenantId),
          eq(rolesTable.id, assignment.roleId),
        ),
      })
      if (!role) throw new NotFoundException('Role not found')
      await tx.insert(userRolesTable).values({
        userId: assignment.userId,
        roleId: assignment.roleId,
        tenantId: assignment.tenantId,
        branchId: assignment.branchId,
        grantedAt: assignment.grantedAt,
      }).onConflictDoNothing()
    })
  }

  async replaceRolesForUser(tenantId: string, userId: string, assignment: UserRole): Promise<UserRole[]> {
    return this.db.transaction(async (tx) => {
      await this.lockTenantRoleChanges(tx, tenantId)
      const targetRole = await tx.query.roles.findFirst({
        where: and(
          eq(rolesTable.tenantId, tenantId),
          eq(rolesTable.id, assignment.roleId),
        ),
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
          eq(userRolesTable.tenantId, tenantId),
          eq(userRolesTable.userId, userId),
          eq(rolesTable.tenantId, tenantId),
        ))

      const adminRole = await tx.query.roles.findFirst({
        where: and(
          eq(rolesTable.tenantId, tenantId),
          ilike(rolesTable.name, 'admin'),
        ),
      })
      if (adminRole && previousRows.some((row) => row.roleId === adminRole.id)) {
        const adminUsers = await this.tenantAdminUserIds(tx, tenantId, adminRole.id)
        assertTenantHasRemainingAdmin(adminUsers, userId, assignment.roleId === adminRole.id)
      }

      await tx.delete(userRolesTable).where(and(
        eq(userRolesTable.tenantId, tenantId),
        eq(userRolesTable.userId, userId),
      ))

      await tx.insert(userRolesTable).values({
        userId: assignment.userId,
        roleId: assignment.roleId,
        tenantId: assignment.tenantId,
        branchId: assignment.branchId,
        grantedAt: assignment.grantedAt,
      })

      return previousRows.map((row) => IamMapper.userRoleToDomain(row))
    })
  }

  async removeRoleFromUser(tenantId: string, userId: string, roleId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await this.lockTenantRoleChanges(tx, tenantId)
      const role = await tx.query.roles.findFirst({
        where: and(
          eq(rolesTable.tenantId, tenantId),
          eq(rolesTable.id, roleId),
        ),
      })
      if (role?.name.toLowerCase() === 'admin') {
        const adminUsers = await this.tenantAdminUserIds(tx, tenantId, roleId)
        assertTenantHasRemainingAdmin(adminUsers, userId, false)
      }
      await tx.delete(userRolesTable).where(and(
        eq(userRolesTable.tenantId, tenantId),
        eq(userRolesTable.userId, userId),
        eq(userRolesTable.roleId, roleId),
      ))
    })
  }

  // ── Policy evaluation ───────────────────────────────

  async checkPermission(tenantId: string, userId: string, module: string, action: string): Promise<boolean> {
    const permissions = await this.findUserPermissions(tenantId, userId)
    return permissions.some(p => p.module === module && p.action === action)
  }
}
