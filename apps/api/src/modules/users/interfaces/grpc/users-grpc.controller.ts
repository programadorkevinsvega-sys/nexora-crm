/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateUserHandler, UpdateUserHandler, DeleteUserHandler,
  UpdateNaturalPersonProfileHandler, UpdateLegalEntityProfileHandler,
  LinkOAuthHandler, UnlinkOAuthHandler,
  RegisterDeviceHandler, UpdateDeviceHandler, RemoveDeviceHandler,
} from '../../application/commands/user.handlers'
import {
  GetUserHandler, FindByEmailHandler, ListUsersHandler,
  GetProfileHandler, ListOAuthLinksHandler, ListDevicesHandler,
} from '../../application/queries/user.handlers'
import {
  CreateUserCommand, UpdateUserCommand, DeleteUserCommand,
  UpdateNaturalPersonProfileCommand, UpdateLegalEntityProfileCommand,
  LinkOAuthCommand, UnlinkOAuthCommand,
  RegisterDeviceCommand, UpdateDeviceCommand, RemoveDeviceCommand,
} from '../../application/commands/user.commands'
import {
  GetUserQuery, FindByEmailQuery, ListUsersQuery,
  GetProfileQuery, ListOAuthLinksQuery, ListDevicesQuery,
} from '../../application/queries/user.queries'
import { UserMapper } from '../../infrastructure/user.mapper'
import { validateOrThrow } from '../../../../common/validation/validate'
import {
  CreateUserSchema, UpdateUserSchema,
  UpdateNaturalPersonProfileSchema, UpdateLegalEntityProfileSchema,
  LinkOAuthSchema, UnlinkOAuthSchema,
  RegisterDeviceSchema, UpdateDeviceSchema, RemoveDeviceSchema,
  ListUsersQuerySchema,
} from '@crm/contracts'

@Controller()
export class UsersGrpcController {
  constructor(
    private readonly createHandler: CreateUserHandler,
    private readonly updateHandler: UpdateUserHandler,
    private readonly deleteHandler: DeleteUserHandler,
    private readonly getHandler: GetUserHandler,
    private readonly findByEmailHandler: FindByEmailHandler,
    private readonly listHandler: ListUsersHandler,
    private readonly getProfileHandler: GetProfileHandler,
    private readonly updateNaturalPersonProfileHandler: UpdateNaturalPersonProfileHandler,
    private readonly updateLegalEntityProfileHandler: UpdateLegalEntityProfileHandler,
    private readonly linkOAuthHandler: LinkOAuthHandler,
    private readonly unlinkOAuthHandler: UnlinkOAuthHandler,
    private readonly listOAuthLinksHandler: ListOAuthLinksHandler,
    private readonly registerDeviceHandler: RegisterDeviceHandler,
    private readonly updateDeviceHandler: UpdateDeviceHandler,
    private readonly removeDeviceHandler: RemoveDeviceHandler,
    private readonly listDevicesHandler: ListDevicesHandler,
  ) {}

  @GrpcMethod('UserService', 'CreateUser')
  async create(data: any) {
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
  async list(data: any) {
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
      jsonItems: result.data.map(u => JSON.stringify(UserMapper.toResponse(u))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('UserService', 'UpdateUser')
  async update(data: any) {
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

  @GrpcMethod('UserService', 'GetProfile')
  async getProfile(data: { tenantId: string; userId: string }) {
    const result = await this.getProfileHandler.execute(
      new GetProfileQuery(data.tenantId, data.userId),
    )
    const profile: any = result.profile
    if (result.profileType === 'NATURAL_PERSON') {
      return { json: JSON.stringify(UserMapper.naturalPersonToResponse(profile)) }
    }
    return { json: JSON.stringify(UserMapper.legalEntityToResponse(profile)) }
  }

  @GrpcMethod('UserService', 'UpdateNaturalPersonProfile')
  async updateNaturalPersonProfile(data: any) {
    const input = validateOrThrow(UpdateNaturalPersonProfileSchema, {
      tenantId: data.tenantId,
      userId: data.userId,
      firstName: data.firstName,
      lastName: data.lastName,
      identificationNumber: data.identificationNumber,
      phone: data.phone,
      countryCode: data.countryCode,
      preferredLanguage: data.preferredLanguage,
      timezone: data.timezone,
      avatarUrl: data.avatarUrl,
    })
    await this.updateNaturalPersonProfileHandler.execute(
      new UpdateNaturalPersonProfileCommand(
        input.tenantId, input.userId,
        input.firstName, input.lastName,
        input.identificationNumber, input.phone, input.countryCode,
        input.preferredLanguage, input.timezone, input.avatarUrl,
      ),
    )
    return {}
  }

  @GrpcMethod('UserService', 'UpdateLegalEntityProfile')
  async updateLegalEntityProfile(data: any) {
    const input = validateOrThrow(UpdateLegalEntityProfileSchema, {
      tenantId: data.tenantId,
      userId: data.userId,
      legalName: data.legalName,
      commercialName: data.commercialName,
      taxId: data.taxId,
      legalAddress: data.legalAddress,
      countryCode: data.countryCode,
      isActive: data.isActive,
    })
    await this.updateLegalEntityProfileHandler.execute(
      new UpdateLegalEntityProfileCommand(
        input.tenantId, input.userId,
        input.legalName, input.commercialName, input.taxId,
        input.legalAddress, input.countryCode, input.isActive,
      ),
    )
    return {}
  }

  @GrpcMethod('UserService', 'LinkOAuth')
  async linkOAuth(data: any) {
    const input = validateOrThrow(LinkOAuthSchema, {
      tenantId: data.tenantId,
      userId: data.userId,
      providerName: data.providerName,
      providerUserId: data.providerUserId,
    })
    await this.linkOAuthHandler.execute(
      new LinkOAuthCommand(input.tenantId, input.userId, input.providerName, input.providerUserId),
    )
    return {}
  }

  @GrpcMethod('UserService', 'UnlinkOAuth')
  async unlinkOAuth(data: any) {
    const input = validateOrThrow(UnlinkOAuthSchema, {
      tenantId: data.tenantId,
      userId: data.userId,
      providerName: data.providerName,
    })
    await this.unlinkOAuthHandler.execute(
      new UnlinkOAuthCommand(input.tenantId, input.userId, input.providerName),
    )
    return {}
  }

  @GrpcMethod('UserService', 'ListOAuthLinks')
  async listOAuthLinks(data: { tenantId: string; userId: string }) {
    const links = await this.listOAuthLinksHandler.execute(
      new ListOAuthLinksQuery(data.userId),
    )
    return {
      jsonItems: links.map(l => JSON.stringify(UserMapper.oauthLinkToResponse(l))),
    }
  }

  @GrpcMethod('UserService', 'RegisterDevice')
  async registerDevice(data: any) {
    const input = validateOrThrow(RegisterDeviceSchema, {
      tenantId: data.tenantId,
      userId: data.userId,
      deviceIdentifier: data.deviceIdentifier,
      platform: data.platform,
      deviceModel: data.deviceModel,
      osVersion: data.osVersion,
      pushNotificationToken: data.pushNotificationToken,
      isTrustedDevice: data.isTrustedDevice,
    })
    await this.registerDeviceHandler.execute(
      new RegisterDeviceCommand(
        input.tenantId, input.userId, input.deviceIdentifier,
        input.platform,
        input.deviceModel, input.osVersion,
        input.pushNotificationToken, input.isTrustedDevice,
      ),
    )
    return {}
  }

  @GrpcMethod('UserService', 'UpdateDevice')
  async updateDevice(data: any) {
    const input = validateOrThrow(UpdateDeviceSchema, {
      tenantId: data.tenantId,
      userId: data.userId,
      deviceId: data.deviceId,
      deviceModel: data.deviceModel,
      osVersion: data.osVersion,
      pushNotificationToken: data.pushNotificationToken,
      isTrustedDevice: data.isTrustedDevice,
    })
    await this.updateDeviceHandler.execute(
      new UpdateDeviceCommand(
        input.tenantId, input.userId, input.deviceId,
        input.deviceModel, input.osVersion,
        input.pushNotificationToken, input.isTrustedDevice,
      ),
    )
    return {}
  }

  @GrpcMethod('UserService', 'RemoveDevice')
  async removeDevice(data: any) {
    const input = validateOrThrow(RemoveDeviceSchema, {
      tenantId: data.tenantId,
      userId: data.userId,
      deviceId: data.deviceId,
    })
    await this.removeDeviceHandler.execute(
      new RemoveDeviceCommand(input.tenantId, input.userId, input.deviceId),
    )
    return {}
  }

  @GrpcMethod('UserService', 'ListDevices')
  async listDevices(data: { tenantId: string; userId: string }) {
    const devices = await this.listDevicesHandler.execute(
      new ListDevicesQuery(data.userId),
    )
    return {
      jsonItems: devices.map(d => JSON.stringify(UserMapper.deviceToResponse(d))),
    }
  }
}
