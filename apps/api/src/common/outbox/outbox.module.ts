import { Module, Global } from '@nestjs/common'
import { OutboxService } from './outbox.service'
import { OutboxPublisherService } from './outbox-publisher.service'

@Global()
@Module({
  providers: [OutboxService, OutboxPublisherService],
  exports: [OutboxService],
})
export class OutboxModule {}
