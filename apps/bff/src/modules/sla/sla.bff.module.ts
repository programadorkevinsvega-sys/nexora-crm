import { Module } from '@nestjs/common'
import { SlaBffController } from './sla.bff.controller'
import { SlaBffService } from './sla.bff.service'

@Module({
  controllers: [SlaBffController],
  providers: [SlaBffService],
  exports: [SlaBffService],
})
export class SlaBffModule {}
