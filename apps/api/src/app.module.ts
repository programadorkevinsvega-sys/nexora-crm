import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { DomainErrorFilter } from './common/filters/domain-error.filter'
import { GlobalIamModule } from './common/iam/iam.module'
import { OutboxModule } from './common/outbox/outbox.module'
import { NatsModule } from './common/nats/nats.module'
import { GrpcClientModule } from './common/grpc/grpc-client.module'
import { CacheModule } from './common/cache/cache.module'
import { ObservabilityModule } from './common/observability/observability.module'

import { AuthModule } from './modules/auth/module.public-api'
import { CustomerPortalAccessModule } from './modules/customer-portal-access/module.public-api'
import { UsersModule } from './modules/users/module.public-api'
import { TenantsModule } from './modules/tenants/module.public-api'
import { IamDomainModule } from './modules/iam/module.public-api'
import { NotificationsModule } from './modules/notifications/module.public-api'
import { AuditModule } from './modules/audit/module.public-api'
import { StorageDomainModule } from './modules/storage/module.public-api'
import { SchedulerDomainModule } from './modules/scheduler/module.public-api'

import { ContactsModule } from './modules/contacts/module.public-api'
import { CompaniesModule } from './modules/companies/module.public-api'
import { PipelinesModule } from './modules/pipelines/module.public-api'
import { InteractionsModule } from './modules/interactions/module.public-api'
import { SupportTicketsModule } from './modules/support-tickets/module.public-api'
import { CampaignsModule } from './modules/campaigns/module.public-api'
import { ContractsModule } from './modules/contracts/module.public-api'
import { SalesTeamsModule } from './modules/sales-teams/module.public-api'
import { LoyaltyModule } from './modules/loyalty/module.public-api'
import { AffiliatesModule } from './modules/affiliates/module.public-api'
import { HelpdeskModule } from './modules/helpdesk/module.public-api'
import { PersonalCrmModule } from './modules/personal-crm/module.public-api'
import { TagsModule } from './modules/tags/module.public-api'
import { AutomationModule } from './modules/automation/module.public-api'
import { LeadScoringModule } from './modules/lead-scoring/module.public-api'
import { CpqModule } from './modules/cpq/module.public-api'
import { Customer360Module } from './modules/customer-360/module.public-api'
import { InboxModule } from './modules/inbox/module.public-api'
import { AnalyticsModule } from './modules/analytics/module.public-api'
import { KnowledgeBaseModule } from './modules/knowledge-base/module.public-api'
import { AiModule } from './modules/ai/module.public-api'
import { DeveloperModule } from './modules/developer/module.public-api'
import { SocialInboxModule } from './modules/social-inbox/module.public-api'
import { WebFormsModule } from './modules/web-forms/module.public-api'
import { MetaLeadsModule } from './modules/meta-leads/module.public-api'

@Module({
  imports: [
    GlobalIamModule,
    OutboxModule,
    NatsModule,
    GrpcClientModule,
    CacheModule,
    ObservabilityModule,
    AuthModule,
    CustomerPortalAccessModule,
    UsersModule,
    TenantsModule,
    IamDomainModule,
    NotificationsModule,
    AuditModule,
    StorageDomainModule,
    SchedulerDomainModule,
    ContactsModule,
    CompaniesModule,
    PipelinesModule,
    InteractionsModule,
    SupportTicketsModule,
    CampaignsModule,
    ContractsModule,
    SalesTeamsModule,
    LoyaltyModule,
    AffiliatesModule,
    HelpdeskModule,
    PersonalCrmModule,
    TagsModule,
    AutomationModule,
    LeadScoringModule,
    CpqModule,
    Customer360Module,
    InboxModule,
    AnalyticsModule,
    KnowledgeBaseModule,
    AiModule,
    DeveloperModule,
    SocialInboxModule,
    WebFormsModule,
    MetaLeadsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: DomainErrorFilter },
  ],
})
export class AppModule {}
