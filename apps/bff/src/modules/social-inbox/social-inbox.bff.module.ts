import { Module } from '@nestjs/common'
import { SocialInboxBffController } from './social-inbox.bff.controller'
import { SocialInboxBffService } from './social-inbox.bff.service'
import { SocialInboxCommentsService } from './social-inbox-comments.service'
import { SocialInboxRulesService } from './social-inbox-rules.service'
import { AiBffModule } from '../ai/ai.bff.module'

@Module({
  imports: [AiBffModule],
  controllers: [SocialInboxBffController],
  providers: [SocialInboxBffService, SocialInboxCommentsService, SocialInboxRulesService],
  exports: [SocialInboxBffService],
})
export class SocialInboxBffModule {}
