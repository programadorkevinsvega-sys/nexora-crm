import { Module } from '@nestjs/common'
import { TiktokLeadsBffController } from './tiktok-leads.bff.controller'
import { TiktokLeadsBffService } from './tiktok-leads.bff.service'

@Module({
  controllers: [TiktokLeadsBffController],
  providers: [TiktokLeadsBffService],
  exports: [TiktokLeadsBffService],
})
export class TiktokLeadsBffModule {}
