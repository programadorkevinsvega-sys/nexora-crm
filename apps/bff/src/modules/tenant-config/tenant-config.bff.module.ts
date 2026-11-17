import { Module } from '@nestjs/common'
import { TenantConfigBffController } from './tenant-config.bff.controller'
import { TenantConfigBffService } from './tenant-config.bff.service'

@Module({
  controllers: [TenantConfigBffController],
  providers: [TenantConfigBffService],
  exports: [TenantConfigBffService],
})
export class TenantConfigBffModule {}
