import { Module } from '@nestjs/common'
import { SocialInboxBffController } from './social-inbox.bff.controller'
import { SocialInboxBffService } from './social-inbox.bff.service'

@Module({
  controllers: [SocialInboxBffController],
  providers: [SocialInboxBffService],
  exports: [SocialInboxBffService],
})
export class SocialInboxBffModule {}
