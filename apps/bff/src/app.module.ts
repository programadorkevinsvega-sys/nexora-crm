import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { resolve } from 'path'
import { GrpcClientModule } from './common/grpc/grpc-client.module'
import { CacheService } from './common/cache/cache.service'
import { BffJwtAuthGuard } from './common/guards/jwt-auth.guard'
import { CompaniesBffModule } from './modules/companies/companies.bff.module'
import { ContactsBffModule } from './modules/contacts/contacts.bff.module'
import { PipelinesBffModule } from './modules/pipelines/pipelines.bff.module'
import { InteractionsBffModule } from './modules/interactions/interactions.bff.module'
import { SupportTicketsBffModule } from './modules/support-tickets/support-tickets.bff.module'
import { CampaignsBffModule } from './modules/campaigns/campaigns.bff.module'
import { ContractsBffModule } from './modules/contracts/contracts.bff.module'
import { SalesTeamsBffModule } from './modules/sales-teams/sales-teams.bff.module'
import { HelpdeskBffModule } from './modules/helpdesk/helpdesk.bff.module'
import { AffiliatesBffModule } from './modules/affiliates/affiliates.bff.module'
import { PersonalCrmBffModule } from './modules/personal-crm/personal-crm.bff.module'
import { LoyaltyBffModule } from './modules/loyalty/loyalty.bff.module'
import { TagsBffModule } from './modules/tags/tags.bff.module'
import { AuthBffModule } from './modules/auth/auth.bff.module'
import { AutomationBffModule } from './modules/automation/automation.bff.module'
import { LeadScoringBffModule } from './modules/lead-scoring/lead-scoring.bff.module'
import { CpqBffModule } from './modules/cpq/cpq.bff.module'
import { Customer360BffModule } from './modules/customer-360/customer-360.bff.module'
import { InboxBffModule } from './modules/inbox/inbox.bff.module'
import { AnalyticsBffModule } from './modules/analytics/analytics.bff.module'
import { KnowledgeBaseBffModule } from './modules/knowledge-base/knowledge-base.bff.module'
import { AiBffModule } from './modules/ai/ai.bff.module'
import { PublicApiBffModule } from './modules/public-api/public-api.bff.module'
import { DeveloperBffModule } from './modules/developer/developer.bff.module'
import { McpBffModule } from './modules/mcp/mcp.bff.module'
import { IntegrationsBffModule } from './modules/integrations/integrations.bff.module'
import { AuditBffModule } from './modules/audit/audit.bff.module'
import { WebFormsBffModule } from './modules/web-forms/web-forms.bff.module'
import { MetaLeadsBffModule } from './modules/meta-leads/meta-leads.bff.module'
import { WhatsappWebhookModule } from './modules/inbox/webhooks/whatsapp-webhook.module'
import { VoipBffModule } from './modules/voip/voip.bff.module'
import { TiktokLeadsBffModule } from './modules/tiktok-leads/tiktok-leads.bff.module'
import { SocialInboxBffModule } from './modules/social-inbox/social-inbox.bff.module'
import { IdempotencyInterceptor } from './common/idempotency/idempotency.interceptor'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: resolve(__dirname, '../../../.env') }),
    GrpcClientModule,
    CompaniesBffModule,
    ContactsBffModule,
    PipelinesBffModule,
    InteractionsBffModule,
    SupportTicketsBffModule,
    CampaignsBffModule,
    ContractsBffModule,
    SalesTeamsBffModule,
    HelpdeskBffModule,
    AffiliatesBffModule,
    PersonalCrmBffModule,
    LoyaltyBffModule,
    TagsBffModule,
    AuthBffModule,
    AutomationBffModule,
    LeadScoringBffModule,
    CpqBffModule,
    Customer360BffModule,
    InboxBffModule,
    AnalyticsBffModule,
    KnowledgeBaseBffModule,
    AiBffModule,
    PublicApiBffModule,
    DeveloperBffModule,
    McpBffModule,
    IntegrationsBffModule,
    AuditBffModule,
    WebFormsBffModule,
    MetaLeadsBffModule,
    WhatsappWebhookModule,
    VoipBffModule,
    TiktokLeadsBffModule,
    SocialInboxBffModule,
  ],
  providers: [
    CacheService,
    {
      provide: APP_GUARD,
      useClass: BffJwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
  exports: [CacheService],
})
export class AppModule {}
