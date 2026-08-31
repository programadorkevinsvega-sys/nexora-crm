import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateChannelHandler, UpdateChannelHandler, DeleteChannelHandler, ListChannelsHandler, GetChannelHandler,
  CreateTemplateHandler, UpdateTemplateHandler, DeleteTemplateHandler, ListTemplatesHandler, GetTemplateHandler, RenderTemplateHandler,
  SendEmailHandler, SendPushHandler, EnqueueNotificationHandler, CancelNotificationHandler, ListNotificationsHandler, GetNotificationHandler,
  ListLogsHandler,
  GetPreferencesHandler, SetPreferencesHandler,
} from '../../application/handlers'
import {
  CreateChannelCommand, UpdateChannelCommand, DeleteChannelCommand, ListChannelsQuery, GetChannelQuery,
  CreateTemplateCommand, UpdateTemplateCommand, DeleteTemplateCommand, ListTemplatesQuery, GetTemplateQuery, RenderTemplateQuery,
  SendEmailCommand, SendPushCommand, EnqueueNotificationCommand, CancelNotificationCommand, ListNotificationsQuery,
  ListLogsQuery,
  GetPreferencesQuery, SetPreferencesCommand,
} from '../../application/handlers'
import { NotificationsMapper } from '../../infrastructure/notifications.mapper'

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
    private readonly sendPushHandler: SendPushHandler,
    private readonly enqueueNotificationHandler: EnqueueNotificationHandler,
    private readonly getNotificationHandler: GetNotificationHandler,
    private readonly listNotificationsHandler: ListNotificationsHandler,
    private readonly cancelNotificationHandler: CancelNotificationHandler,
    private readonly listLogsHandler: ListLogsHandler,
    private readonly getPreferencesHandler: GetPreferencesHandler,
    private readonly setPreferencesHandler: SetPreferencesHandler,
  ) {}

  // ─── Channels ───

  @GrpcMethod('NotificationService', 'CreateChannel')
  async createChannel(data: any) {
    const result = await this.createChannelHandler.execute(
      new CreateChannelCommand(data.tenantId, data.channelType, data.providerType, data.name, data.configJson ? JSON.parse(data.configJson) : undefined))
    return { json: JSON.stringify(NotificationsMapper.channelToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'GetChannel')
  async getChannel(data: { id: string }) {
    const result = await this.getChannelHandler.execute(new GetChannelQuery(data.id))
    return { json: JSON.stringify(NotificationsMapper.channelToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'ListChannels')
  async listChannels(data: { tenantId?: string }) {
    const result = await this.listChannelsHandler.execute(new ListChannelsQuery(data.tenantId))
    return { jsonItems: result.map(c => JSON.stringify(NotificationsMapper.channelToResponse(c))) }
  }

  @GrpcMethod('NotificationService', 'UpdateChannel')
  async updateChannel(data: any) {
    await this.updateChannelHandler.execute(
      new UpdateChannelCommand(data.id, data.name, data.configJson ? JSON.parse(data.configJson) : undefined, data.isActive))
    return {}
  }

  @GrpcMethod('NotificationService', 'DeleteChannel')
  async deleteChannel(data: { id: string }) {
    await this.deleteChannelHandler.execute(new DeleteChannelCommand(data.id))
    return {}
  }

  // ─── Templates ───

  @GrpcMethod('NotificationService', 'CreateTemplate')
  async createTemplate(data: any) {
    const result = await this.createTemplateHandler.execute(
      new CreateTemplateCommand(data.tenantId, data.channelType, data.templateKey, data.subjectTemplate, data.bodyTemplate, data.variables, data.locale))
    return { json: JSON.stringify(NotificationsMapper.templateToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'GetTemplate')
  async getTemplate(data: { id: string }) {
    const result = await this.getTemplateHandler.execute(new GetTemplateQuery(data.id))
    return { json: JSON.stringify(NotificationsMapper.templateToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'ListTemplates')
  async listTemplates(data: { tenantId?: string }) {
    const result = await this.listTemplatesHandler.execute(new ListTemplatesQuery(data.tenantId))
    return { jsonItems: result.map(t => JSON.stringify(NotificationsMapper.templateToResponse(t))) }
  }

  @GrpcMethod('NotificationService', 'UpdateTemplate')
  async updateTemplate(data: any) {
    await this.updateTemplateHandler.execute(
      new UpdateTemplateCommand(data.id, data.subjectTemplate, data.bodyTemplate, data.variables, data.locale))
    return {}
  }

  @GrpcMethod('NotificationService', 'DeleteTemplate')
  async deleteTemplate(data: { id: string }) {
    await this.deleteTemplateHandler.execute(new DeleteTemplateCommand(data.id))
    return {}
  }

  @GrpcMethod('NotificationService', 'RenderTemplate')
  async renderTemplate(data: { templateId: string; variablesJson: string }) {
    const result = await this.renderTemplateHandler.execute(
      new RenderTemplateQuery(data.templateId, JSON.parse(data.variablesJson)))
    return { json: JSON.stringify(result) }
  }

  // ─── Send / Queue ───

  @GrpcMethod('NotificationService', 'SendEmail')
  async sendEmail(data: any) {
    const result = await this.sendEmailHandler.execute(
      new SendEmailCommand(data.tenantId, data.to, data.subject, data.body, data.isHtml, data.channelId))
    return { json: JSON.stringify(NotificationsMapper.notificationToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'SendPush')
  async sendPush(data: any) {
    const result = await this.sendPushHandler.execute(
      new SendPushCommand(data.tenantId, data.deviceToken, data.title, data.body, data.dataJson ? JSON.parse(data.dataJson) : undefined, data.channelId))
    return { json: JSON.stringify(NotificationsMapper.notificationToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'EnqueueNotification')
  async enqueueNotification(data: any) {
    const result = await this.enqueueNotificationHandler.execute(
      new EnqueueNotificationCommand(data.tenantId, data.channelType, data.channelId, data.templateId, data.toAddress, data.subject, data.body, data.variablesJson ? JSON.parse(data.variablesJson) : undefined, data.priority, data.scheduledAt))
    return { json: JSON.stringify(NotificationsMapper.notificationToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'GetNotification')
  async getNotification(data: { id: string }) {
    const result = await this.getNotificationHandler.execute(data.id)
    return { json: JSON.stringify(NotificationsMapper.notificationToResponse(result)) }
  }

  @GrpcMethod('NotificationService', 'ListNotifications')
  async listNotifications(data: { tenantId?: string; status?: string; channelType?: string; cursor?: string; limit?: number }) {
    const result = await this.listNotificationsHandler.execute(new ListNotificationsQuery(data.tenantId, data.status, data.channelType, data.cursor, data.limit))
    return { jsonItems: result.data.map(n => JSON.stringify(NotificationsMapper.notificationToResponse(n))), nextCursor: result.nextCursor ?? '' }
  }

  @GrpcMethod('NotificationService', 'CancelNotification')
  async cancelNotification(data: { id: string }) {
    await this.cancelNotificationHandler.execute(new CancelNotificationCommand(data.id))
    return {}
  }

  // ─── Logs ───

  @GrpcMethod('NotificationService', 'ListLogs')
  async listLogs(data: { tenantId?: string; channelType?: string; cursor?: string; limit?: number }) {
    const result = await this.listLogsHandler.execute(new ListLogsQuery(data.tenantId, data.channelType, data.cursor, data.limit))
    return { jsonItems: result.data.map(l => JSON.stringify(NotificationsMapper.logToResponse(l))), nextCursor: result.nextCursor ?? '' }
  }

  // ─── Preferences ───

  @GrpcMethod('NotificationService', 'GetPreferences')
  async getPreferences(data: { userId: string; tenantId?: string }) {
    const result = await this.getPreferencesHandler.execute(new GetPreferencesQuery(data.userId, data.tenantId))
    return { json: JSON.stringify(result.map(p => NotificationsMapper.preferenceToResponse(p))) }
  }

  @GrpcMethod('NotificationService', 'SetPreferences')
  async setPreferences(data: any) {
    await this.setPreferencesHandler.execute(new SetPreferencesCommand(data.userId, data.channelType, data.isEnabled, data.tenantId))
    return {}
  }
}
