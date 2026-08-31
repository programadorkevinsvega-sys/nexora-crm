import { Module } from '@nestjs/common'
import { SocialInboxBffController } from './social-inbox.bff.controller'
import { SocialInboxBffService } from './social-inbox.bff.service'
import { AiBffModule } from '../ai/ai.bff.module'

@Module({
  imports: [AiBffModule],
  controllers: [SocialInboxBffController],
  providers: [SocialInboxBffService],
  exports: [SocialInboxBffService],
})
export class SocialInboxBffModule {}
