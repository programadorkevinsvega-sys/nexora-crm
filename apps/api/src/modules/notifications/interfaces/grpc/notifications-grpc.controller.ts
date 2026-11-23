import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateChannelHandler, UpdateChannelHandler, DeleteChannelHandler, ListChannelsHandler, GetChannelHandler,
  CreateTemplateHandler, UpdateTemplateHandler, DeleteTemplateHandler, ListTemplatesHandler, GetTemplateHandler, RenderTemplateHandler,
  SendEmailHandler, SendTransientEmailHandler, SendPushHandler, EnqueueNotificationHandler, CancelNotificationHandler, ListNotificationsHandler, GetNotificationHandler,
  ListLogsHandler, GetPreferencesHandler, SetPreferencesHandler,
} from '../../application/handlers'
import {
  CreateChannelCommand, UpdateChannelCommand, DeleteChannelCommand, ListChannelsQuery, GetChannelQuery,
  CreateTemplateCommand, UpdateTemplateCommand, DeleteTemplateCommand, ListTemplatesQuery, GetTemplateQuery, RenderTemplateQuery,
  SendEmailCommand, SendTransientEmailCommand, SendPushCommand, EnqueueNotificationCommand, CancelNotificationCommand, ListNotificationsQuery,
  ListLogsQuery, GetPreferencesQuery, SetPreferencesCommand,
} from '../../application/handlers'
import { NotificationsMapper } from '../../infrastructure/notifications.mapper'
import type { ChannelType, ProviderType } from '../../domain/entities/notification.entity'

type JsonObject = Record<string, unknown>

interface EntityIdRequest { id: string }
interface TenantRequest { tenantId?: string }
interface CreateChannelRequest extends TenantRequest {
  channelType: ChannelType
  providerType: ProviderType
  name: string
  configJson?: string
}
interface UpdateChannelRequest {
  id: string
  name?: string
  configJson?: string
  isActive?: boolean
}
interface CreateTemplateRequest extends TenantRequest {
  channelType: ChannelType
  templateKey: string
  subjectTemplate: string
  bodyTemplate: string
  variables?: string[]
  locale?: string
}
interface UpdateTemplateRequest {
  id: string
  subjectTemplate?: string
  bodyTemplate?: string
  variables?: string[]
  locale?: string
}
interface RenderTemplateRequest { templateId: string; variablesJson: string }
interface SendEmailRequest extends TenantRequest {
  to: string
  subject: string
  body: string
  isHtml?: boolean
  channelId?: string
}
interface SendTransientEmailRequest {
  tenantId: string
  to: string
  subject: string
  body: string
  isHtml?: boolean
}
interface SendPushRequest extends TenantRequest {
  deviceToken: string
  title: string
  body: string
  dataJson?: string
  channelId?: string
}
interface EnqueueNotificationRequest extends TenantRequest {
  channelType: ChannelType
  channelId?: string
  templateId?: string
  toAddress: string
  subject?: string
  body?: string
  variablesJson?: string
  priority?: number
  scheduledAt?: string
}
interface ListNotificationsRequest extends TenantRequest {
  status?: string
  channelType?: string
  cursor?: string
  limit?: number
}
interface ListLogsRequest extends TenantRequest {
  channelType?: string
  cursor?: string
  limit?: number
}
interface GetPreferencesRequest {
  userId: string
  tenantId?: string
}
interface SetPreferencesRequest {
  userId: string
  channelType: ChannelType
  isEnabled: boolean
  tenantId?: string
}

function parseJsonObject(json: string | undefined): JsonObject | undefined {
  if (!json) return undefined
  const parsed: unknown = JSON.parse(json)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new TypeError('Expected a JSON object')
  }
  return parsed as JsonObject
}

@Controller()
export class NotificationsGrpcController {
  constructor(
    private readonly createChannelHandler: CreateChannelHandler,
    private readonly getChannelHandler: GetChannelHandler,
    private readonly listChannelsHandler: ListChannelsHandler,
    private readonly updateChannelHandler: UpdateChannelHandler,
    private readonly deleteChannelHandler: DeleteChannelHandler,
    private readonly createTemplateHandler: CreateTemplateHandler,
    private readonly getTemplateHandler: GetTemplateHandler,
    private readonly listTemplatesHandler: ListTemplatesHandler,
    private readonly updateTemplateHandler: UpdateTemplateHandler,
    private readonly deleteTemplateHandler: DeleteTemplateHandler,
    private readonly renderTemplateHandler: RenderTemplateHandler,
    private readonly sendEmailHandler: SendEmailHandler,
    private readonly sendTransientEmailHandler: SendTransientEmailHandler,
    private readonly sendPushHandler: SendPushHandler,
    private readonly enqueueNotificationHandler: EnqueueNotificationHandler,
    private readonly getNotificationHandler: GetNotificationHandler,
    private readonly listNotificationsHandler: ListNotificationsHandler,
    private readonly cancelNotificationHandler: CancelNotificationHandler,
    private readonly listLogsHandler: ListLogsHandler,
    private readonly getPreferencesHandler: GetPreferencesHandler,
    private readonly setPreferencesHandler: SetPreferencesHandler,
  ) {}

  @GrpcMethod('NotificationService', 'CreateChannel')
  async createChannel(data: CreateChannelRequest) {
    const result = await this.createChannelHandler.execute(new CreateChannelCommand(
      data.tenantId, data.channelType, data.providerType, data.name, parseJsonObject(data.configJson),
    ))
    return { json: JSON.stringify(NotificationsMapper.channelToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'GetChannel')
  async getChannel(data: EntityIdRequest) {
    const result = await this.getChannelHandler.execute(new GetChannelQuery(data.id))
    return { json: JSON.stringify(NotificationsMapper.channelToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'ListChannels')
  async listChannels(data: TenantRequest) {
    const result = await this.listChannelsHandler.execute(new ListChannelsQuery(data.tenantId))
    return { jsonItems: result.map((channel) => JSON.stringify(NotificationsMapper.channelToResponse(channel))) }
  }

  @GrpcMethod('NotificationService', 'UpdateChannel')
  async updateChannel(data: UpdateChannelRequest) {
    await this.updateChannelHandler.execute(new UpdateChannelCommand(
      data.id, data.name, parseJsonObject(data.configJson), data.isActive,
    ))
    return {}
  }

  @GrpcMethod('NotificationService', 'DeleteChannel')
  async deleteChannel(data: EntityIdRequest) {
    await this.deleteChannelHandler.execute(new DeleteChannelCommand(data.id))
    return {}
  }

  @GrpcMethod('NotificationService', 'CreateTemplate')
  async createTemplate(data: CreateTemplateRequest) {
    const result = await this.createTemplateHandler.execute(new CreateTemplateCommand(
      data.tenantId, data.channelType, data.templateKey, data.subjectTemplate,
      data.bodyTemplate, data.variables, data.locale,
    ))
    return { json: JSON.stringify(NotificationsMapper.templateToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'GetTemplate')
  async getTemplate(data: EntityIdRequest) {
    const result = await this.getTemplateHandler.execute(new GetTemplateQuery(data.id))
    return { json: JSON.stringify(NotificationsMapper.templateToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'ListTemplates')
  async listTemplates(data: TenantRequest) {
    const result = await this.listTemplatesHandler.execute(new ListTemplatesQuery(data.tenantId))
    return { jsonItems: result.map((template) => JSON.stringify(NotificationsMapper.templateToResponse(template))) }
  }

  @GrpcMethod('NotificationService', 'UpdateTemplate')
  async updateTemplate(data: UpdateTemplateRequest) {
    await this.updateTemplateHandler.execute(new UpdateTemplateCommand(
      data.id, data.subjectTemplate, data.bodyTemplate, data.variables, data.locale,
    ))
    return {}
  }

  @GrpcMethod('NotificationService', 'DeleteTemplate')
  async deleteTemplate(data: EntityIdRequest) {
    await this.deleteTemplateHandler.execute(new DeleteTemplateCommand(data.id))
    return {}
  }

  @GrpcMethod('NotificationService', 'RenderTemplate')
  async renderTemplate(data: RenderTemplateRequest) {
    const result = await this.renderTemplateHandler.execute(
      new RenderTemplateQuery(data.templateId, parseJsonObject(data.variablesJson) ?? {}),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('NotificationService', 'SendEmail')
  async sendEmail(data: SendEmailRequest) {
    const result = await this.sendEmailHandler.execute(new SendEmailCommand(
      data.tenantId, data.to, data.subject, data.body, data.isHtml, data.channelId,
    ))
    return { json: JSON.stringify(NotificationsMapper.notificationToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'SendTransientEmail')
  async sendTransientEmail(data: SendTransientEmailRequest) {
    const result = await this.sendTransientEmailHandler.execute(new SendTransientEmailCommand(
      data.tenantId, data.to, data.subject, data.body, data.isHtml,
    ))
    return { json: JSON.stringify(NotificationsMapper.notificationToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'SendPush')
  async sendPush(data: SendPushRequest) {
    const result = await this.sendPushHandler.execute(new SendPushCommand(
      data.tenantId, data.deviceToken, data.title, data.body, parseJsonObject(data.dataJson), data.channelId,
    ))
    return { json: JSON.stringify(NotificationsMapper.notificationToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'EnqueueNotification')
  async enqueueNotification(data: EnqueueNotificationRequest) {
    const result = await this.enqueueNotificationHandler.execute(new EnqueueNotificationCommand(
      data.tenantId, data.channelType, data.channelId, data.templateId, data.toAddress,
      data.subject, data.body, parseJsonObject(data.variablesJson), data.priority, data.scheduledAt,
    ))
    return { json: JSON.stringify(NotificationsMapper.notificationToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'GetNotification')
  async getNotification(data: EntityIdRequest) {
    const result = await this.getNotificationHandler.execute(data.id)
    return { json: JSON.stringify(NotificationsMapper.notificationToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'ListNotifications')
  async listNotifications(data: ListNotificationsRequest) {
    const result = await this.listNotificationsHandler.execute(new ListNotificationsQuery(
      data.tenantId, data.status, data.channelType, data.cursor, data.limit,
    ))
    return {
      jsonItems: result.data.map((notification) => JSON.stringify(NotificationsMapper.notificationToResponse(notification))),
      nextCursor: result.nextCursor ?? '',
    }
  }

  @GrpcMethod('NotificationService', 'CancelNotification')
  async cancelNotification(data: EntityIdRequest) {
    await this.cancelNotificationHandler.execute(new CancelNotificationCommand(data.id))
    return {}
  }

  @GrpcMethod('NotificationService', 'ListLogs')
  async listLogs(data: ListLogsRequest) {
    const result = await this.listLogsHandler.execute(new ListLogsQuery(
      data.tenantId, data.channelType, data.cursor, data.limit,
    ))
    return {
      jsonItems: result.data.map((log) => JSON.stringify(NotificationsMapper.logToResponse(log))),
      nextCursor: result.nextCursor ?? '',
    }
  }

  @GrpcMethod('NotificationService', 'GetPreferences')
  async getPreferences(data: GetPreferencesRequest) {
    const result = await this.getPreferencesHandler.execute(new GetPreferencesQuery(data.userId, data.tenantId))
    return { json: JSON.stringify(result.map((preference) => NotificationsMapper.preferenceToResponse(preference))) }
  }

  @GrpcMethod('NotificationService', 'SetPreferences')
  async setPreferences(data: SetPreferencesRequest) {
    await this.setPreferencesHandler.execute(new SetPreferencesCommand(
      data.userId, data.channelType, data.isEnabled, data.tenantId,
    ))
    return {}
  }
}
