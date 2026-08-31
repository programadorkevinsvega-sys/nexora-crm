import { Injectable, NotFoundException } from '@nestjs/common'
import { IamRepository } from '../../domain/repositories/iam.repository'
import { Role } from '../../domain/entities/role.entity'
import { Permission } from '../../domain/entities/permission.entity'
import { UserRole } from '../../domain/entities/user-role.entity'
import {
  GetRoleQuery, ListRolesQuery,
  ListPermissionsQuery, ListRolePermissionsQuery,
  ListUserRolesQuery, CheckPermissionQuery, GetUserPermissionsQuery,
} from './iam.queries'

@Injectable()
export class GetRoleHandler {
  constructor(private readonly repo: IamRepository) {}

  async execute(query: GetRoleQuery): Promise<Role> {
    const role = await this.repo.findRoleById(query.id)
    if (!role) throw new NotFoundException('Role not found')
    return role
  }
}

@Injectable()
export class ListRolesHandler {
  constructor(private readonly repo: IamRepository) {}

  async execute(query: ListRolesQuery) {
    return this.repo.listRoles(query.tenantId, query.search, query.cursor, query.limit)
  }
}

@Injectable()
export class ListPermissionsHandler {
  constructor(private readonly repo: IamRepository) {}

  async execute(query: ListPermissionsQuery) {
    return this.repo.listPermissions(query.module)
  }
}

@Injectable()
export class ListRolePermissionsHandler {
  constructor(private readonly repo: IamRepository) {}

  async execute(query: ListRolePermissionsQuery): Promise<Permission[]> {
    return this.repo.findRolePermissions(query.roleId)
  }
}

@Injectable()
export class ListUserRolesHandler {
  constructor(private readonly repo: IamRepository) {}

  async execute(query: ListUserRolesQuery): Promise<UserRole[]> {
    return this.repo.findUserRoles(query.tenantId, query.userId)
  }
}

@Injectable()
export class CheckPermissionHandler {
  constructor(private readonly repo: IamRepository) {}

  async execute(query: CheckPermissionQuery): Promise<boolean> {
    return this.repo.checkPermission(query.tenantId, query.userId, query.module, query.action)
  }
}

@Injectable()
export class GetUserPermissionsHandler {
  constructor(private readonly repo: IamRepository) {}

  async execute(query: GetUserPermissionsQuery): Promise<Permission[]> {
    return this.repo.findUserPermissions(query.tenantId, query.userId)
  }
}
