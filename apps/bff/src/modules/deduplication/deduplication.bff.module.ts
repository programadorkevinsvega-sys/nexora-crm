import { Module } from '@nestjs/common'
import { DeduplicationBffController } from './deduplication.bff.controller'
import { DeduplicationBffService } from './deduplication.bff.service'

@Module({
  controllers: [DeduplicationBffController],
  providers: [DeduplicationBffService],
  exports: [DeduplicationBffService],
})
export class DeduplicationBffModule {}
