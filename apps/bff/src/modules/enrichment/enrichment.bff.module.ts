import { Module } from '@nestjs/common'
import { EnrichmentBffController } from './enrichment.bff.controller'
import { EnrichmentBffService } from './enrichment.bff.service'

@Module({
  controllers: [EnrichmentBffController],
  providers: [EnrichmentBffService],
  exports: [EnrichmentBffService],
})
export class EnrichmentBffModule {}
