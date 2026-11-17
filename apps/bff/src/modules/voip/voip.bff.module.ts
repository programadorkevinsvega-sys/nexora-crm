import { Module } from '@nestjs/common'
import { VoipBffController } from './voip.bff.controller'
import { VoipBffService } from './voip.bff.service'
import { IntegrationsBffModule } from '../integrations/integrations.bff.module'

@Module({
  imports: [IntegrationsBffModule],
  controllers: [VoipBffController],
  providers: [VoipBffService],
  exports: [VoipBffService],
})
export class VoipBffModule {}
