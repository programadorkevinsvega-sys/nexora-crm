import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateUserHandler, UpdateUserHandler, DeleteUserHandler,
} from '../../application/commands/user.handlers'
import {
  GetUserHandler, FindByEmailHandler, ListUsersHandler,
} from '../../application/queries/user.handlers'
import {
  CreateUserCommand, UpdateUserCommand, DeleteUserCommand,
} from '../../application/commands/user.commands'
import {
  GetUserQuery, FindByEmailQuery, ListUsersQuery,
} from '../../application/queries/user.queries'
import { UserMapper } from '../../infrastructure/user.mapper'
import { validateOrThrow } from '../../../../common/validation/validate'
import {
  CreateUserSchema, UpdateUserSchema, ListUsersQuerySchema,
} from '@crm/contracts'

interface UserCoreGrpcRequest {
  tenantId?: unknown
  id?: unknown
  email?: unknown
  passwordHash?: unknown
  profileType?: unknown
  firstName?: unknown
  lastName?: unknown
  identificationNumber?: unknown
  phone?: unknown
  countryCode?: unknown
  preferredLanguage?: unknown
  timezone?: unknown
  avatarUrl?: unknown
  legalName?: unknown
  commercialName?: unknown
  taxId?: unknown
  legalAddress?: unknown
  managerId?: unknown
  cursor?: unknown
  limit?: unknown
  search?: unknown
  status?: unknown
}

@Controller()
export class UsersCoreGrpcController {
  constructor(
    private readonly createHandler: CreateUserHandler,
    private readonly updateHandler: UpdateUserHandler,
    private readonly deleteHandler: DeleteUserHandler,
    private readonly getHandler: GetUserHandler,
    private readonly findByEmailHandler: FindByEmailHandler,
    private readonly listHandler: ListUsersHandler,
  ) {}

  @GrpcMethod('UserService', 'CreateUser')
  async create(data: UserCoreGrpcRequest) {
    const input = validateOrThrow(CreateUserSchema, {
      tenantId: data.tenantId,
      email: data.email,
      passwordHash: data.passwordHash,
      profileType: data.profileType,
      firstName: data.firstName,
      lastName: data.lastName,
      identificationNumber: data.identificationNumber,
      phone: data.phone,
      countryCode: data.countryCode,
      preferredLanguage: data.preferredLanguage,
      timezone: data.timezone,
      avatarUrl: data.avatarUrl,
      legalName: data.legalName,
      commercialName: data.commercialName,
      taxId: data.taxId,
      legalAddress: data.legalAddress,
      managerId: data.managerId,
    })
    const result = await this.createHandler.execute(
      new CreateUserCommand(
        input.tenantId, input.email,
        input.passwordHash,
        input.profileType,
        input.firstName, input.lastName, input.identificationNumber,
        input.phone, input.countryCode, input.preferredLanguage,
        input.timezone, input.avatarUrl,
        input.legalName, input.commercialName, input.taxId,
        input.legalAddress, input.managerId,
      ),
    )
    const user = await this.getHandler.execute(
      new GetUserQuery(input.tenantId, result.id),
    )
    return { json: JSON.stringify(UserMapper.toResponse(user)) }
  }

  @GrpcMethod('UserService', 'GetUser')
  async getById(data: { tenantId: string; id: string }) {
    const user = await this.getHandler.execute(
      new GetUserQuery(data.tenantId, data.id),
    )
    return {
      json: JSON.stringify({
        ...UserMapper.toResponse(user),
        passwordHash: user.passwordHash,
      }),
    }
  }

  @GrpcMethod('UserService', 'FindByEmail')
  async findByEmail(data: { tenantId: string; email: string }) {
    const user = await this.findByEmailHandler.execute(
      new FindByEmailQuery(data.tenantId, data.email),
    )
    return {
      json: JSON.stringify({
        ...UserMapper.toResponse(user),
        passwordHash: user.passwordHash,
      }),
    }
  }

  @GrpcMethod('UserService', 'ListUsers')
  async list(data: UserCoreGrpcRequest) {
    const filter = validateOrThrow(ListUsersQuerySchema, {
      tenantId: data.tenantId,
      cursor: data.cursor,
      limit: data.limit ?? 20,
      search: data.search,
      status: data.status,
      profileType: data.profileType,
    })
    const result = await this.listHandler.execute(
      new ListUsersQuery(filter.tenantId, {
        search: filter.search,
        status: filter.status,
        profileType: filter.profileType,
        cursor: filter.cursor,
        limit: filter.limit!,
      }),
    )
    return {
      jsonItems: result.data.map((u) => JSON.stringify(UserMapper.toResponse(u))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('UserService', 'UpdateUser')
  async update(data: UserCoreGrpcRequest) {
    const input = validateOrThrow(UpdateUserSchema, {
      id: data.id,
      tenantId: data.tenantId,
      email: data.email,
      passwordHash: data.passwordHash,
      status: data.status,
      managerId: data.managerId,
    })
    await this.updateHandler.execute(
      new UpdateUserCommand(
        input.tenantId, input.id,
        input.email, input.passwordHash,
        input.status,
        input.managerId,
      ),
    )
    return {}
  }

  @GrpcMethod('UserService', 'DeleteUser')
  async delete(data: { tenantId: string; id: string }) {
    await this.deleteHandler.execute(
      new DeleteUserCommand(data.tenantId, data.id),
    )
    return {}
  }
}
