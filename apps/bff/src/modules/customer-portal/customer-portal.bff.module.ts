import { Module } from '@nestjs/common'
import { CustomerPortalBffController } from './customer-portal.bff.controller'
import { CustomerPortalBffService } from './customer-portal.bff.service'

@Module({
  controllers: [CustomerPortalBffController],
  providers: [CustomerPortalBffService],
})
export class CustomerPortalBffModule {}
