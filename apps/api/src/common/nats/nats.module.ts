import { Module, Global } from '@nestjs/common'
import { NatsService } from './nats.service'
import { NatsConsumerService } from './nats-consumer.service'

@Global()
@Module({
  providers: [NatsService, NatsConsumerService],
  exports: [NatsService, NatsConsumerService],
})
export class NatsModule {}
