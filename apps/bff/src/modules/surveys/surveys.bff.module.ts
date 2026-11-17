import { Module } from '@nestjs/common'
import { SurveysBffController } from './surveys.bff.controller'
import { SurveysBffService } from './surveys.bff.service'

@Module({
  controllers: [SurveysBffController],
  providers: [SurveysBffService],
  exports: [SurveysBffService],
})
export class SurveysBffModule {}
