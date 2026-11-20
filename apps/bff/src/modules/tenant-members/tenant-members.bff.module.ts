import { Module } from '@nestjs/common'
import { TenantMembersBffController } from './tenant-members.bff.controller'
import { TenantMembersBffService } from './tenant-members.bff.service'
import { TenantInvitationsBffController } from './tenant-invitations.bff.controller'
import { TeamInvitationsPublicBffController } from './team-invitations.public.bff.controller'
import { TenantInvitationsBffService } from './tenant-invitations.bff.service'

@Module({
  controllers: [
    TenantMembersBffController,
    TenantInvitationsBffController,
    TeamInvitationsPublicBffController,
  ],
  providers: [TenantMembersBffService, TenantInvitationsBffService],
})
export class TenantMembersBffModule {}
