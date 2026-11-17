import { Module } from '@nestjs/common'
import { HealthScoreBffController } from './health-score.bff.controller'
import { HealthScoreBffService } from './health-score.bff.service'

@Module({
  controllers: [HealthScoreBffController],
  providers: [HealthScoreBffService],
  exports: [HealthScoreBffService],
})
export class HealthScoreBffModule {}
