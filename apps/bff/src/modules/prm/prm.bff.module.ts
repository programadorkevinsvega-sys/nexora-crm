import { Module } from '@nestjs/common'
import { PrmBffController } from './prm.bff.controller'
import { PrmBffService } from './prm.bff.service'

@Module({
  controllers: [PrmBffController],
  providers: [PrmBffService],
  exports: [PrmBffService],
})
export class PrmBffModule {}
