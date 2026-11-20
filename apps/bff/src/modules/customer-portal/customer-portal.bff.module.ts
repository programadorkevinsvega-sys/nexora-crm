import { Module } from '@nestjs/common'
import { TenantMembersBffModule } from '../tenant-members/tenant-members.bff.module'
import { CustomerPortalBffController } from './customer-portal.bff.controller'
import { CustomerPortalBffService } from './customer-portal.bff.service'
import { CustomerPortalAccessBffController } from './customer-portal-access.bff.controller'
import { CustomerPortalInvitationsBffController } from './customer-portal-invitations.bff.controller'
import { CustomerPortalAccessBffService } from './customer-portal-access.bff.service'
import { CustomerPortalTicketsBffController } from './customer-portal-tickets.bff.controller'
import { CustomerPortalTicketsBffService } from './customer-portal-tickets.bff.service'
import { CustomerPortalQuotesBffController } from './customer-portal-quotes.bff.controller'
import { CustomerPortalQuotesBffService } from './customer-portal-quotes.bff.service'

@Module({
  imports: [TenantMembersBffModule],
  controllers: [
    CustomerPortalBffController,
    CustomerPortalAccessBffController,
    CustomerPortalInvitationsBffController,
    CustomerPortalTicketsBffController,
    CustomerPortalQuotesBffController,
  ],
  providers: [
    CustomerPortalBffService,
    CustomerPortalAccessBffService,
    CustomerPortalTicketsBffService,
    CustomerPortalQuotesBffService,
  ],
})
export class CustomerPortalBffModule {}
