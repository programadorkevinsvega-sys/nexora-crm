import { Module } from '@nestjs/common'
import { TenantMembersBffController } from './tenant-members.bff.controller'
import { TenantMembersBffService } from './tenant-members.bff.service'

@Module({
  controllers: [TenantMembersBffController],
  providers: [TenantMembersBffService],
})
export class TenantMembersBffModule {}
