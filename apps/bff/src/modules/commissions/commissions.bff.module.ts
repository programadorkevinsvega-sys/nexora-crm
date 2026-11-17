import { Module } from '@nestjs/common'
import { CommissionsBffController } from './commissions.bff.controller'
import { CommissionsBffService } from './commissions.bff.service'

@Module({
  controllers: [CommissionsBffController],
  providers: [CommissionsBffService],
  exports: [CommissionsBffService],
})
export class CommissionsBffModule {}
