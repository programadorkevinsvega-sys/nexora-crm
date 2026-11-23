import {
  BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, OnModuleInit,
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
  replaceUserRole(data: { tenantId: string; userId: string; roleId: string; branchId?: string }): Observable<Record<string, never>>
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
interface TenantMemberGrpcRecord {
  id: string
  tenantId: string
  email: string
  profile?: { firstName?: string | null; lastName?: string | null } | null
  status?: string
  isEmailVerified?: boolean
  lastLoginAt?: string | null
  createdAt?: string
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
    return parseItems<TenantRole>(response.jsonItems).filter((role) => role.name.toLowerCase() !== 'super_admin')
  }
  private async getAssignments(tenantId: string, userId: string): Promise<UserRoleAssignment[]> {
    const response = await lastValueFrom(this.iam.listUserRoles({ tenantId, userId }))
    return parseItems<UserRoleAssignment>(response.jsonItems)
  }
  async assertTenantAdmin(user: AuthenticatedUser): Promise<void> {
    if (!user?.tenantId || !user?.userId) throw new ForbiddenException('Authenticated tenant identity is required')
    const [roles, assignments] = await Promise.all([
      this.getRoles(user.tenantId), this.getAssignments(user.tenantId, user.userId),
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
    const rows = parseItems<TenantMemberGrpcRecord>(response.jsonItems)
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
    const roles = await this.getRoles(tenantId)
    return roles.map((role) => ({ id: role.id, name: role.name, description: role.description ?? null }))
  }
  async replaceMemberRole(user: AuthenticatedUser, memberId: string, nextRoleId: string) {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(nextRoleId)) {
      throw new BadRequestException('roleId must be a valid UUID')
    }
    await this.assertTenantAdmin(user)
    const tenantId = user.tenantId
    const [targetUser, roles] = await Promise.all([
      lastValueFrom(this.users.getUser({ tenantId, id: memberId })), this.getRoles(tenantId),
    ])
    if (!targetUser?.json) throw new NotFoundException('Team member not found')
    const requestedRole = roles.find((role) => role.id === nextRoleId)
    if (!requestedRole) throw new NotFoundException('Role is not available to this tenant')
    await lastValueFrom(this.iam.replaceUserRole({ tenantId, userId: memberId, roleId: requestedRole.id }))
    const refreshed = await this.listMembers(tenantId, undefined, undefined, 100)
    return refreshed.data.find((member) => member.id === memberId) ?? {
      id: memberId, roles: [{ id: requestedRole.id, name: requestedRole.name }],
    }
  }
  async removeMemberRole(user: AuthenticatedUser, memberId: string, roleId: string) {
    await this.assertTenantAdmin(user)
    const roles = await this.getRoles(user.tenantId)
    const selected = roles.find((role) => role.id === roleId)
    if (!selected) throw new NotFoundException('Role is not available to this tenant')
    const assignments = await this.getAssignments(user.tenantId, memberId)
    if (!assignments.some((assignment) => assignment.roleId === roleId)) return
    await lastValueFrom(this.iam.removeRole({ tenantId: user.tenantId, userId: memberId, roleId }))
    return { removed: true }
  }
}