import { Module } from '@nestjs/common'
import { WebFormsBffController } from './web-forms.bff.controller'
import { PublicFormsBffController } from './public-forms.bff.controller'
import { WebFormsBffService } from './web-forms.bff.service'

@Module({
  controllers: [WebFormsBffController, PublicFormsBffController],
  providers: [WebFormsBffService],
  exports: [WebFormsBffService],
})
export class WebFormsBffModule {}
