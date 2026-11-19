import { NotFoundException } from '@nestjs/common'
import { Role } from '../../domain/entities/role.entity'
import { IamRepository } from '../../domain/repositories/iam.repository'
import { UserRepository } from '../../../users/domain/repositories/user.repository'
import { OutboxService } from '../../../../common/outbox/outbox.service'
import {
  AssignRoleCommand,
  RemoveRoleCommand,
  UpdateRoleCommand,
  DeleteRoleCommand,
} from './iam.commands'
import {
  AssignRoleHandler,
  RemoveRoleHandler,
  UpdateRoleHandler,
  DeleteRoleHandler,
} from './iam.handlers'

describe('IAM tenant boundaries', () => {
  const tenantA = 'tenant-a'
  const tenantB = 'tenant-b'
  const userId = 'user-a'
  const roleId = 'role-b'

  const roleFromTenantB = new Role(
    roleId,
    tenantB,
    'manager',
    null,
    false,
    new Date(),
    new Date(),
  )

  let repo: jest.Mocked<Partial<IamRepository>>
  let users: jest.Mocked<Partial<UserRepository>>
  let outbox: { publish: jest.Mock }

  beforeEach(() => {
    repo = {
      findRoleById: jest.fn().mockResolvedValue(roleFromTenantB),
      saveRole: jest.fn().mockResolvedValue(undefined),
      deleteRole: jest.fn().mockResolvedValue(undefined),
      assignRoleToUser: jest.fn().mockResolvedValue(undefined),
      removeRoleFromUser: jest.fn().mockResolvedValue(undefined),
    }
    users = {
      findById: jest.fn().mockResolvedValue({ id: userId, tenantId: tenantA }),
    }
    outbox = { publish: jest.fn().mockResolvedValue(undefined) }
  })

  it('rejects assigning a role owned by another tenant', async () => {
    const handler = new AssignRoleHandler(
      repo as IamRepository,
      users as UserRepository,
      outbox as unknown as OutboxService,
    )

    await expect(
      handler.execute(new AssignRoleCommand(tenantA, userId, roleId)),
    ).rejects.toBeInstanceOf(NotFoundException)

    expect(users.findById).not.toHaveBeenCalled()
    expect(repo.assignRoleToUser).not.toHaveBeenCalled()
    expect(outbox.publish).not.toHaveBeenCalled()
  })

  it('rejects removing a role owned by another tenant', async () => {
    const handler = new RemoveRoleHandler(
      repo as IamRepository,
      users as UserRepository,
      outbox as unknown as OutboxService,
    )

    await expect(
      handler.execute(new RemoveRoleCommand(tenantA, userId, roleId)),
    ).rejects.toBeInstanceOf(NotFoundException)

    expect(users.findById).not.toHaveBeenCalled()
    expect(repo.removeRoleFromUser).not.toHaveBeenCalled()
    expect(outbox.publish).not.toHaveBeenCalled()
  })

  it('rejects updating a role owned by another tenant', async () => {
    const handler = new UpdateRoleHandler(repo as IamRepository, outbox as unknown as OutboxService)

    await expect(
      handler.execute(new UpdateRoleCommand(tenantA, roleId, 'changed')),
    ).rejects.toBeInstanceOf(NotFoundException)

    expect(repo.saveRole).not.toHaveBeenCalled()
    expect(outbox.publish).not.toHaveBeenCalled()
  })

  it('rejects deleting a role owned by another tenant before deleting assignments', async () => {
    const handler = new DeleteRoleHandler(repo as IamRepository, outbox as unknown as OutboxService)

    await expect(
      handler.execute(new DeleteRoleCommand(tenantA, roleId)),
    ).rejects.toBeInstanceOf(NotFoundException)

    expect(repo.deleteRole).not.toHaveBeenCalled()
    expect(outbox.publish).not.toHaveBeenCalled()
  })
})
