export type DevicePlatform = 'IOS' | 'ANDROID' | 'WEB' | 'OTHER'

export class UserMobileDevice {
  constructor(
    readonly id: string,
    readonly tenantId: string,
    readonly userId: string,
    readonly deviceIdentifier: string,
    readonly platform: DevicePlatform,
    readonly deviceModel: string | null,
    readonly osVersion: string | null,
    readonly pushNotificationToken: string | null,
    readonly isTrustedDevice: boolean,
    readonly lastActiveAt: Date,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static create(props: {
    tenantId: string
    userId: string
    deviceIdentifier: string
    platform: DevicePlatform
    deviceModel?: string
    osVersion?: string
    pushNotificationToken?: string
    isTrustedDevice?: boolean
  }): UserMobileDevice {
    const now = new Date()
    return new UserMobileDevice(
      crypto.randomUUID(),
      props.tenantId,
      props.userId,
      props.deviceIdentifier,
      props.platform,
      props.deviceModel ?? null,
      props.osVersion ?? null,
      props.pushNotificationToken ?? null,
      props.isTrustedDevice ?? false,
      now,
      now,
      now,
    )
  }

  update(props: Partial<Pick<UserMobileDevice, 'deviceModel' | 'osVersion' | 'pushNotificationToken' | 'isTrustedDevice'>>): UserMobileDevice {
    return new UserMobileDevice(
      this.id,
      this.tenantId,
      this.userId,
      this.deviceIdentifier,
      this.platform,
      props.deviceModel !== undefined ? props.deviceModel : this.deviceModel,
      props.osVersion !== undefined ? props.osVersion : this.osVersion,
      props.pushNotificationToken !== undefined ? props.pushNotificationToken : this.pushNotificationToken,
      props.isTrustedDevice !== undefined ? props.isTrustedDevice : this.isTrustedDevice,
      new Date(),
      this.createdAt,
      new Date(),
    )
  }

  markActive(): UserMobileDevice {
    return new UserMobileDevice(
      this.id, this.tenantId, this.userId, this.deviceIdentifier,
      this.platform, this.deviceModel, this.osVersion,
      this.pushNotificationToken, this.isTrustedDevice,
      new Date(), this.createdAt, new Date(),
    )
  }
}
