import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common'
import { IamRepository } from '../../domain/repositories/iam.repository'
import { Role } from '../../domain/entities/role.entity'
import { Permission } from '../../domain/entities/permission.entity'
import { UserRole } from '../../domain/entities/user-role.entity'
import {
  CreateRoleCommand, UpdateRoleCommand, DeleteRoleCommand,
  CreatePermissionCommand,
  AssignPermissionCommand, RemovePermissionCommand,
  AssignRoleCommand, RemoveRoleCommand,
} from './iam.commands'
import {
  RoleCreatedEvent, RoleUpdatedEvent, RoleDeletedEvent,
  PermissionAssignedEvent, PermissionRemovedEvent,
  UserRoleAssignedEvent, UserRoleRemovedEvent,
} from '../../domain/events/iam.events'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import { UserRepository } from '../../../users/domain/repositories/user.repository'

@Injectable()
export class CreateRoleHandler {
  constructor(
    private readonly repo: IamRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: CreateRoleCommand): Promise<Role> {
    const existing = await this.repo.findRoleByName(command.tenantId, command.name)
    if (existing) throw new ConflictException(`Role "${command.name}" already exists`)

    const role = Role.create({
      tenantId: command.tenantId,
      name: command.name,
      description: command.description,
    })

    await this.repo.saveRole(role)
    await this.outbox.publish(new RoleCreatedEvent(role.id, 'iam.role.created', role.tenantId, role.name))
    return role
  }
}

@Injectable()
export class UpdateRoleHandler {
  constructor(
    private readonly repo: IamRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: UpdateRoleCommand): Promise<Role> {
    const role = await this.repo.findRoleById(command.id)
    if (!role || role.tenantId !== command.tenantId) throw new NotFoundException('Role not found')

    const updated = role.update({ name: command.name, description: command.description })
    await this.repo.saveRole(updated)
    await this.outbox.publish(new RoleUpdatedEvent(updated.id))
    return updated
  }
}

@Injectable()
export class DeleteRoleHandler {
  constructor(
    private readonly repo: IamRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: DeleteRoleCommand): Promise<void> {
    const role = await this.repo.findRoleById(command.id)
    if (!role || role.tenantId !== command.tenantId) throw new NotFoundException('Role not found')
    if (role.isSystemRole) throw new BadRequestException('Cannot delete system role')

    await this.repo.deleteRole(command.tenantId, command.id)
    await this.outbox.publish(new RoleDeletedEvent(command.id))
  }
}

@Injectable()
export class CreatePermissionHandler {
  constructor(private readonly repo: IamRepository) {}

  async execute(command: CreatePermissionCommand): Promise<Permission> {
    const existing = await this.repo.findPermissionByModuleAction(command.module, command.action)
    if (existing) throw new ConflictException(`Permission "${command.module}:${command.action}" already exists`)

    const permission = Permission.create({
      module: command.module,
      action: command.action,
      description: command.description,
    })

    await this.repo.savePermission(permission)
    return permission
  }
}

@Injectable()
export class AssignPermissionHandler {
  constructor(
    private readonly repo: IamRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: AssignPermissionCommand): Promise<void> {
    const role = await this.repo.findRoleById(command.roleId)
    if (!role) throw new NotFoundException('Role not found')

    const permission = await this.repo.findPermissionById(command.permissionId)
    if (!permission) throw new NotFoundException('Permission not found')

    await this.repo.assignPermissionToRole(command.roleId, command.permissionId)
    await this.outbox.publish(new PermissionAssignedEvent(command.roleId, command.permissionId))
  }
}

@Injectable()
export class RemovePermissionHandler {
  constructor(
    private readonly repo: IamRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RemovePermissionCommand): Promise<void> {
    await this.repo.removePermissionFromRole(command.roleId, command.permissionId)
    await this.outbox.publish(new PermissionRemovedEvent(command.roleId, command.permissionId))
  }
}

@Injectable()
export class AssignRoleHandler {
  constructor(
    private readonly repo: IamRepository,
    private readonly users: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: AssignRoleCommand): Promise<void> {
    const role = await this.repo.findRoleById(command.roleId)
    if (!role || role.tenantId !== command.tenantId) throw new NotFoundException('Role not found')
    if (role.name === 'super_admin') throw new BadRequestException('The platform administrator role cannot be assigned to tenant users')

    const user = await this.users.findById(command.tenantId, command.userId)
    if (!user) throw new NotFoundException('User not found')

    const assignment = UserRole.create({
      userId: command.userId,
      roleId: command.roleId,
      tenantId: command.tenantId,
      branchId: command.branchId,
    })

    await this.repo.assignRoleToUser(assignment)
    await this.outbox.publish(new UserRoleAssignedEvent(
      `${command.userId}:${command.roleId}`, command.tenantId, command.userId, command.roleId,
    ))
  }
}

@Injectable()
export class RemoveRoleHandler {
  constructor(
    private readonly repo: IamRepository,
    private readonly users: UserRepository,
    private readonly outbox: OutboxService,
  ) {}

  async execute(command: RemoveRoleCommand): Promise<void> {
    const role = await this.repo.findRoleById(command.roleId)
    if (!role || role.tenantId !== command.tenantId) throw new NotFoundException('Role not found')
    const user = await this.users.findById(command.tenantId, command.userId)
    if (!user) throw new NotFoundException('User not found')

    await this.repo.removeRoleFromUser(command.tenantId, command.userId, command.roleId)
    await this.outbox.publish(new UserRoleRemovedEvent(
      `${command.userId}:${command.roleId}`, command.tenantId, command.userId, command.roleId,
    ))
  }
}
