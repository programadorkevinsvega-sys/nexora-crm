/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateRoleHandler, UpdateRoleHandler, DeleteRoleHandler,
  CreatePermissionHandler,
  AssignPermissionHandler, RemovePermissionHandler,
  AssignRoleHandler, RemoveRoleHandler,
} from '../../application/commands/iam.handlers'
import {
  GetRoleHandler, ListRolesHandler,
  ListPermissionsHandler, ListRolePermissionsHandler,
  ListUserRolesHandler, CheckPermissionHandler, GetUserPermissionsHandler,
} from '../../application/queries/iam.handlers'
import {
  CreateRoleCommand, UpdateRoleCommand, DeleteRoleCommand,
  CreatePermissionCommand,
  AssignPermissionCommand, RemovePermissionCommand,
  AssignRoleCommand, RemoveRoleCommand,
} from '../../application/commands/iam.commands'
import {
  GetRoleQuery, ListRolesQuery,
  ListPermissionsQuery, ListRolePermissionsQuery,
  ListUserRolesQuery, CheckPermissionQuery, GetUserPermissionsQuery,
} from '../../application/queries/iam.queries'
import { IamMapper } from '../../infrastructure/iam.mapper'

@Controller()
export class IamGrpcController {
  constructor(
    private readonly createRoleHandler: CreateRoleHandler,
    private readonly getRoleHandler: GetRoleHandler,
    private readonly listRolesHandler: ListRolesHandler,
    private readonly updateRoleHandler: UpdateRoleHandler,
    private readonly deleteRoleHandler: DeleteRoleHandler,
    private readonly createPermissionHandler: CreatePermissionHandler,
    private readonly listPermissionsHandler: ListPermissionsHandler,
    private readonly assignPermissionHandler: AssignPermissionHandler,
    private readonly removePermissionHandler: RemovePermissionHandler,
    private readonly listRolePermissionsHandler: ListRolePermissionsHandler,
    private readonly assignRoleHandler: AssignRoleHandler,
    private readonly removeRoleHandler: RemoveRoleHandler,
    private readonly listUserRolesHandler: ListUserRolesHandler,
    private readonly checkPermissionHandler: CheckPermissionHandler,
    private readonly getUserPermissionsHandler: GetUserPermissionsHandler,
  ) {}

  @GrpcMethod('IamService', 'CreateRole')
  async createRole(data: any) {
    const result = await this.createRoleHandler.execute(
      new CreateRoleCommand(data.tenantId, data.name, data.description),
    )
    return { json: JSON.stringify(IamMapper.roleToResponse(result)) }
  }

  @GrpcMethod('IamService', 'GetRole')
  async getRole(data: { id: string }) {
    const result = await this.getRoleHandler.execute(new GetRoleQuery(data.id))
    return { json: JSON.stringify(IamMapper.roleToResponse(result)) }
  }

  @GrpcMethod('IamService', 'ListRoles')
  async listRoles(data: any) {
    const result = await this.listRolesHandler.execute(
      new ListRolesQuery(data.tenantId, data.search, data.cursor, data.limit ?? 20),
    )
    return {
      jsonItems: result.data.map(r => JSON.stringify(IamMapper.roleToResponse(r))),
      nextCursor: result.nextCursor ?? '',
    }
  }

  @GrpcMethod('IamService', 'UpdateRole')
  async updateRole(data: any) {
    await this.updateRoleHandler.execute(
      new UpdateRoleCommand(data.tenantId, data.id, data.name, data.description),
    )
    return {}
  }

  @GrpcMethod('IamService', 'DeleteRole')
  async deleteRole(data: { tenantId: string; id: string }) {
    await this.deleteRoleHandler.execute(new DeleteRoleCommand(data.tenantId, data.id))
    return {}
  }

  @GrpcMethod('IamService', 'CreatePermission')
  async createPermission(data: any) {
    const result = await this.createPermissionHandler.execute(
      new CreatePermissionCommand(data.module, data.action, data.description),
    )
    return { json: JSON.stringify(IamMapper.permissionToResponse(result)) }
  }

  @GrpcMethod('IamService', 'ListPermissions')
  async listPermissions(data: { module?: string }) {
    const result = await this.listPermissionsHandler.execute(
      new ListPermissionsQuery(data.module),
    )
    return {
      jsonItems: result.data.map(p => JSON.stringify(IamMapper.permissionToResponse(p))),
    }
  }

  @GrpcMethod('IamService', 'AssignPermission')
  async assignPermission(data: { roleId: string; permissionId: string }) {
    await this.assignPermissionHandler.execute(
      new AssignPermissionCommand(data.roleId, data.permissionId),
    )
    return {}
  }

  @GrpcMethod('IamService', 'RemovePermission')
  async removePermission(data: { roleId: string; permissionId: string }) {
    await this.removePermissionHandler.execute(
      new RemovePermissionCommand(data.roleId, data.permissionId),
    )
    return {}
  }

  @GrpcMethod('IamService', 'ListRolePermissions')
  async listRolePermissions(data: { roleId: string }) {
    const result = await this.listRolePermissionsHandler.execute(
      new ListRolePermissionsQuery(data.roleId),
    )
    return {
      jsonItems: result.map(p => JSON.stringify(IamMapper.permissionToResponse(p))),
    }
  }

  @GrpcMethod('IamService', 'AssignRole')
  async assignRole(data: any) {
    await this.assignRoleHandler.execute(
      new AssignRoleCommand(data.tenantId, data.userId, data.roleId, data.branchId),
    )
    return {}
  }

  @GrpcMethod('IamService', 'RemoveRole')
  async removeRole(data: { tenantId: string; userId: string; roleId: string }) {
    await this.removeRoleHandler.execute(
      new RemoveRoleCommand(data.tenantId, data.userId, data.roleId),
    )
    return {}
  }

  @GrpcMethod('IamService', 'ListUserRoles')
  async listUserRoles(data: { tenantId: string; userId: string }) {
    const result = await this.listUserRolesHandler.execute(
      new ListUserRolesQuery(data.tenantId, data.userId),
    )
    return {
      jsonItems: result.map(r => JSON.stringify(IamMapper.userRoleToResponse(r))),
    }
  }

  @GrpcMethod('IamService', 'CheckPermission')
  async checkPermission(data: any) {
    const allowed = await this.checkPermissionHandler.execute(
      new CheckPermissionQuery(data.tenantId, data.userId, data.module, data.action, data.branchId),
    )
    return { allowed }
  }

  @GrpcMethod('IamService', 'GetUserPermissions')
  async getUserPermissions(data: { tenantId: string; userId: string }) {
    const result = await this.getUserPermissionsHandler.execute(
      new GetUserPermissionsQuery(data.tenantId, data.userId),
    )
    return {
      jsonItems: result.map(p => JSON.stringify(IamMapper.permissionToResponse(p))),
    }
  }
}
