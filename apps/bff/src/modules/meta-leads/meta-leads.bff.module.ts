import { Module } from '@nestjs/common'
import { MetaLeadsBffController } from './meta-leads.bff.controller'
import { PublicMetaLeadsBffController } from './public-meta-leads.bff.controller'
import { MetaLeadsBffService } from './meta-leads.bff.service'

@Module({
  controllers: [MetaLeadsBffController, PublicMetaLeadsBffController],
  providers: [MetaLeadsBffService],
  exports: [MetaLeadsBffService],
})
export class MetaLeadsBffModule {}
