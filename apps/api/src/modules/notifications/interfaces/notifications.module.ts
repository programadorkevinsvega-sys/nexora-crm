import { Module } from '@nestjs/common'
import { OutboxModule } from '../../../common/outbox/outbox.module'
import { NotificationsGrpcController } from './grpc/notifications-grpc.controller'
import {
  CreateChannelHandler, UpdateChannelHandler, DeleteChannelHandler, ListChannelsHandler, GetChannelHandler,
  CreateTemplateHandler, UpdateTemplateHandler, DeleteTemplateHandler, ListTemplatesHandler, GetTemplateHandler, RenderTemplateHandler,
  SendEmailHandler, SendTransientEmailHandler, SendPushHandler, EnqueueNotificationHandler, CancelNotificationHandler, ListNotificationsHandler, GetNotificationHandler,
  ListLogsHandler,
  GetPreferencesHandler, SetPreferencesHandler,
} from '../application/handlers'
import { NotificationsRepository } from '../domain/repositories/notifications.repository'
import { DrizzleNotificationsRepository } from '../infrastructure/drizzle-notifications.repository'
import { ProviderFactory } from '../infrastructure/providers/provider-factory'

@Module({
  imports: [OutboxModule],
  controllers: [NotificationsGrpcController],
  providers: [
    CreateChannelHandler, GetChannelHandler, ListChannelsHandler, UpdateChannelHandler, DeleteChannelHandler,
    CreateTemplateHandler, GetTemplateHandler, ListTemplatesHandler, UpdateTemplateHandler, DeleteTemplateHandler, RenderTemplateHandler,
    SendEmailHandler, SendTransientEmailHandler, SendPushHandler, EnqueueNotificationHandler, GetNotificationHandler, ListNotificationsHandler, CancelNotificationHandler,
    ListLogsHandler,
    GetPreferencesHandler, SetPreferencesHandler,
    ProviderFactory,
    { provide: NotificationsRepository, useClass: DrizzleNotificationsRepository },
  ],
  exports: [NotificationsRepository],
})
export class NotificationsModule {}
