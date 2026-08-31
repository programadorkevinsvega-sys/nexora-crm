import { Module } from '@nestjs/common'
import { NotificationsEventConsumerService } from './consumer.service'

@Module({ providers: [NotificationsEventConsumerService] })
export class NotificationsConsumerModule {}
