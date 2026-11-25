import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  UpdateNaturalPersonProfileHandler, UpdateLegalEntityProfileHandler,
  LinkOAuthHandler, UnlinkOAuthHandler,
  RegisterDeviceHandler, UpdateDeviceHandler, RemoveDeviceHandler,
} from '../../application/commands/user.handlers'
import {
  GetProfileHandler, ListOAuthLinksHandler, ListDevicesHandler,
} from '../../application/queries/user.handlers'
import {
  UpdateNaturalPersonProfileCommand, UpdateLegalEntityProfileCommand,
  LinkOAuthCommand, UnlinkOAuthCommand,
  RegisterDeviceCommand, UpdateDeviceCommand, RemoveDeviceCommand,
} from '../../application/commands/user.commands'
import {
  GetProfileQuery, ListOAuthLinksQuery, ListDevicesQuery,
} from '../../application/queries/user.queries'
import { UserMapper } from '../../infrastructure/user.mapper'
import { NaturalPersonProfile } from '../../domain/entities/natural-person-profile.entity'
import { LegalEntityProfile } from '../../domain/entities/legal-entity-profile.entity'
import { validateOrThrow } from '../../../../common/validation/validate'
import {
  UpdateNaturalPersonProfileSchema, UpdateLegalEntityProfileSchema,
  LinkOAuthSchema, UnlinkOAuthSchema,
  RegisterDeviceSchema, UpdateDeviceSchema, RemoveDeviceSchema,
} from '@crm/contracts'

interface UserProfileDeviceGrpcRequest {
  tenantId?: unknown
  userId?: unknown
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
  isActive?: unknown
  providerName?: unknown
  providerUserId?: unknown
  deviceIdentifier?: unknown
  platform?: unknown
  deviceModel?: unknown
  osVersion?: unknown
  pushNotificationToken?: unknown
  isTrustedDevice?: unknown
  deviceId?: unknown
}

@Controller()
export class UsersProfileDevicesGrpcController {
  constructor(
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

  @GrpcMethod('UserService', 'GetProfile')
  async getProfile(data: { tenantId: string; userId: string }) {
    const result = await this.getProfileHandler.execute(
      new GetProfileQuery(data.tenantId, data.userId),
    )
    const profile = result.profile
    if (profile instanceof NaturalPersonProfile) {
      return { json: JSON.stringify(UserMapper.naturalPersonToResponse(profile)) }
    }
    if (profile instanceof LegalEntityProfile) {
      return { json: JSON.stringify(UserMapper.legalEntityToResponse(profile)) }
    }
    throw new Error('Unsupported user profile type')
  }

  @GrpcMethod('UserService', 'UpdateNaturalPersonProfile')
  async updateNaturalPersonProfile(data: UserProfileDeviceGrpcRequest) {
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
  async updateLegalEntityProfile(data: UserProfileDeviceGrpcRequest) {
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
  async linkOAuth(data: UserProfileDeviceGrpcRequest) {
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
  async unlinkOAuth(data: UserProfileDeviceGrpcRequest) {
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
      jsonItems: links.map((l) => JSON.stringify(UserMapper.oauthLinkToResponse(l))),
    }
  }

  @GrpcMethod('UserService', 'RegisterDevice')
  async registerDevice(data: UserProfileDeviceGrpcRequest) {
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
  async updateDevice(data: UserProfileDeviceGrpcRequest) {
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
  async removeDevice(data: UserProfileDeviceGrpcRequest) {
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
      jsonItems: devices.map((d) => JSON.stringify(UserMapper.deviceToResponse(d))),
    }
  }
}
