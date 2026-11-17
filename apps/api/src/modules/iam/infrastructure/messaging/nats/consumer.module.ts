import { Module } from '@nestjs/common'
import { IamEventConsumerService } from './consumer.service'

@Module({ providers: [IamEventConsumerService] })
export class IamConsumerModule {}
