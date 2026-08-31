import { Module } from '@nestjs/common'
import { SalesTeamsBffController } from './sales-teams.bff.controller'
import { SalesTeamsBffService } from './sales-teams.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [SalesTeamsBffController],
  providers: [SalesTeamsBffService, CacheService],
  exports: [SalesTeamsBffService],
})
export class SalesTeamsBffModule {}
