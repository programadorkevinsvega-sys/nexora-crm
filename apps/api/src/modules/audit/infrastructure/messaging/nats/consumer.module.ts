import { Module } from '@nestjs/common'
import { AuditEventConsumerService } from './consumer.service'

@Module({ providers: [AuditEventConsumerService] })
export class AuditConsumerModule {}
