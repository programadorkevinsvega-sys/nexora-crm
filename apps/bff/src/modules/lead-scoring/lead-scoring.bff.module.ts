import { Module } from '@nestjs/common'
import { LeadScoringBffController } from './lead-scoring.bff.controller'
import { LeadScoringBffService } from './lead-scoring.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [LeadScoringBffController],
  providers: [LeadScoringBffService, CacheService],
  exports: [LeadScoringBffService],
})
export class LeadScoringBffModule {}
