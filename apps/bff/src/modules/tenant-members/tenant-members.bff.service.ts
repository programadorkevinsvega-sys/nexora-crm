import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { Observable, lastValueFrom } from 'rxjs'
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator'

interface UserGrpcService {
  listUsers(data: { tenantId: string; cursor?: string; limit?: number; search?: string; status?: string }): Observable<{ jsonItems: string[]; nextCursor?: string }>
  getUser(data: { tenantId: string; id: string }): Observable<{ json: string }>
}

interface IamGrpcService {
  listRoles(data: { tenantId: string; cursor?: string; limit?: number }): Observable<{ jsonItems: string[]; nextCursor?: string }>
  listUserRoles(data: { tenantId: string; userId: string }): Observable<{ jsonItems: string[] }>
  assignRole(data: { tenantId: string; userId: string; roleId: string; branchId?: string }): Observable<Record<string, never>>
  removeRole(data: { tenantId: string; userId: string; roleId: string }): Observable<Record<string, never>>
}

type TenantRole = {
  id: string
  tenantId: string
  name: string
  description?: string | null
  isSystemRole: boolean
}

type UserRoleAssignment = {
  userId: string
  roleId: string
  tenantId: string
  branchId?: string | null
}

function parseItems<T>(items: string[] | undefined): T[] {
  if (!items?.length) return []
  return items.map((item) => JSON.parse(item) as T)
}

@Injectable()
export class TenantMembersBffService implements OnModuleInit {
  private users!: UserGrpcService
  private iam!: IamGrpcService

  constructor(@Inject('API_CORE_GRPC') private readonly grpc: ClientGrpc) {}

  onModuleInit() {
    this.users = this.grpc.getService<UserGrpcService>('UserService')
    this.iam = this.grpc.getService<IamGrpcService>('IamService')
  }

  private async getRoles(tenantId: string): Promise<TenantRole[]> {
    const response = await lastValueFrom(this.iam.listRoles({ tenantId, limit: 100 }))
    return parseItems<TenantRole>(response.jsonItems)
      .filter((role) => role.name.toLowerCase() !== 'super_admin')
  }

  private async getAssignments(tenantId: string, userId: string): Promise<UserRoleAssignment[]> {
    const response = await lastValueFrom(this.iam.listUserRoles({ tenantId, userId }))
    return parseItems<UserRoleAssignment>(response.jsonItems)
  }

  async assertTenantAdmin(user: AuthenticatedUser): Promise<void> {
    if (!user?.tenantId || !user?.userId) {
      throw new ForbiddenException('Authenticated tenant identity is required')
    }

    // Resolve current authorization from API Core, not from mutable browser state
    // or potentially stale role labels in the access token.
    const [roles, assignments] = await Promise.all([
      this.getRoles(user.tenantId),
      this.getAssignments(user.tenantId, user.userId),
    ])
    const adminRole = roles.find((role) => role.name.toLowerCase() === 'admin')
    if (!adminRole || !assignments.some((assignment) => assignment.roleId === adminRole.id)) {
      throw new ForbiddenException('Only a tenant administrator can manage team members')
    }
  }

  async listMembers(tenantId: string, cursor?: string, search?: string, limit = 50) {
    const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)))
    const [response, roles] = await Promise.all([
      lastValueFrom(this.users.listUsers({ tenantId, cursor, search, limit: safeLimit })),
      this.getRoles(tenantId),
    ])
    const rows = parseItems<Record<string, any>>(response.jsonItems)
    const roleById = new Map(roles.map((role) => [role.id, role]))

    const members = await Promise.all(rows.map(async (member) => {
      const assignments = await this.getAssignments(tenantId, member.id)
      const memberRoles = assignments
        .map((assignment) => roleById.get(assignment.roleId))
        .filter((role): role is TenantRole => Boolean(role))
      const profile = member.profile ?? {}
      const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()

      return {
        id: member.id,
        tenantId: member.tenantId,
        email: member.email,
        name: name || member.email,
        profile,
        status: member.status,
        isEmailVerified: member.isEmailVerified,
        lastLoginAt: member.lastLoginAt,
        createdAt: member.createdAt,
        roles: memberRoles.map((role) => ({ id: role.id, name: role.name })),
      }
    }))

    return { data: members, nextCursor: response.nextCursor || null }
  }

  async listAssignableRoles(tenantId: string) {
    return this.getRoles(tenantId).map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description ?? null,
    }))
  }

  private async countOtherTenantAdmins(tenantId: string, excludedUserId: string, adminRoleId: string): Promise<number> {
    let cursor: string | undefined
    let count = 0

    do {
      const response = await lastValueFrom(this.users.listUsers({ tenantId, cursor, limit: 100 }))
      const members = parseItems<{ id: string }>(response.jsonItems)
      const assignments = await Promise.all(
        members.filter((member) => member.id !== excludedUserId)
          .map((member) => this.getAssignments(tenantId, member.id)),
      )
      count += assignments.filter((roles) => roles.some((role) => role.roleId === adminRoleId)).length
      cursor = response.nextCursor || undefined
    } while (cursor)

    return count
  }

  async replaceMemberRole(user: AuthenticatedUser, memberId: string, nextRoleId: string) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(nextRoleId)) {
      throw new BadRequestException('roleId must be a valid UUID')
    }

    await this.assertTenantAdmin(user)
    const tenantId = user.tenantId
    const [targetUser, roles, currentAssignments] = await Promise.all([
      lastValueFrom(this.users.getUser({ tenantId, id: memberId })),
      this.getRoles(tenantId),
      this.getAssignments(tenantId, memberId),
    ])
    if (!targetUser?.json) throw new NotFoundException('Team member not found')

    const requestedRole = roles.find((role) => role.id === nextRoleId)
    if (!requestedRole) throw new NotFoundException('Role is not available to this tenant')

    const adminRole = roles.find((role) => role.name.toLowerCase() === 'admin')
    const currentlyAdmin = Boolean(adminRole && currentAssignments.some((assignment) => assignment.roleId === adminRole.id))
    const willRemainAdmin = Boolean(adminRole && requestedRole.id === adminRole.id)

    if (currentlyAdmin && !willRemainAdmin) {
      const otherAdmins = await this.countOtherTenantAdmins(tenantId, memberId, adminRole!.id)
      if (otherAdmins < 1) {
        throw new ForbiddenException('The tenant must retain at least one administrator')
      }
    }

    // Add the new role before removing old assignments. A transient failure can
    // leave extra permissions, never an unassigned account with no recovery path.
    await lastValueFrom(this.iam.assignRole({ tenantId, userId: memberId, roleId: requestedRole.id }))
    for (const assignment of currentAssignments) {
      if (assignment.roleId !== requestedRole.id) {
        await lastValueFrom(this.iam.removeRole({ tenantId, userId: memberId, roleId: assignment.roleId }))
      }
    }

    const refreshed = await this.listMembers(tenantId, undefined, undefined, 100)
    return refreshed.data.find((member) => member.id === memberId) ?? { id: memberId, roles: [{ id: requestedRole.id, name: requestedRole.name }] }
  }

  async removeMemberRole(user: AuthenticatedUser, memberId: string, roleId: string) {
    await this.assertTenantAdmin(user)
    const roles = await this.getRoles(user.tenantId)
    const selected = roles.find((role) => role.id === roleId)
    if (!selected) throw new NotFoundException('Role is not available to this tenant')

    const assignments = await this.getAssignments(user.tenantId, memberId)
    if (!assignments.some((assignment) => assignment.roleId === roleId)) return

    if (selected.name.toLowerCase() === 'admin') {
      const otherAdmins = await this.countOtherTenantAdmins(user.tenantId, memberId, selected.id)
      if (otherAdmins < 1) {
        throw new ForbiddenException('The tenant must retain at least one administrator')
      }
    }

    await lastValueFrom(this.iam.removeRole({ tenantId: user.tenantId, userId: memberId, roleId }))
    return { removed: true }
  }
}
