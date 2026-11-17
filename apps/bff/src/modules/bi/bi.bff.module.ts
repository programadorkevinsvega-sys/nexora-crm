import { Module } from '@nestjs/common'
import { BiBffController } from './bi.bff.controller'
import { BiBffService } from './bi.bff.service'

@Module({
  controllers: [BiBffController],
  providers: [BiBffService],
  exports: [BiBffService],
})
export class BiBffModule {}
