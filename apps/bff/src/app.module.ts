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
import { BookingBffModule } from './modules/booking/booking.bff.module'
import { PaymentsBffModule } from './modules/payments/payments.bff.module'
import { EnrichmentBffModule } from './modules/enrichment/enrichment.bff.module'
import { HealthScoreBffModule } from './modules/health-score/health-score.bff.module'
import { BiBffModule } from './modules/bi/bi.bff.module'
import { CommissionsBffModule } from './modules/commissions/commissions.bff.module'
import { TerritoriesBffModule } from './modules/territories/territories.bff.module'
import { PriceBooksBffModule } from './modules/price-books/price-books.bff.module'
import { PrmBffModule } from './modules/prm/prm.bff.module'
import { SlaBffModule } from './modules/sla/sla.bff.module'
import { DeduplicationBffModule } from './modules/deduplication/deduplication.bff.module'
import { QuotesApprovalBffModule } from './modules/quotes-approval/quotes-approval.bff.module'
import { SecurityAuditBffModule } from './modules/security-audit/security-audit.bff.module'
import { SurveysBffModule } from './modules/surveys/surveys.bff.module'
import { TenantConfigBffModule } from './modules/tenant-config/tenant-config.bff.module'
import { IdempotencyInterceptor } from './common/idempotency/idempotency.interceptor'
import { RateLimiterGuard } from './common/guards/rate-limiter.guard'
import { SecurityHeadersMiddleware } from './common/middleware/security-headers.middleware'

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
    BookingBffModule,
    PaymentsBffModule,
    EnrichmentBffModule,
    HealthScoreBffModule,
    BiBffModule,
    CommissionsBffModule,
    TerritoriesBffModule,
    PriceBooksBffModule,
    PrmBffModule,
    SlaBffModule,
    DeduplicationBffModule,
    QuotesApprovalBffModule,
    SecurityAuditBffModule,
    SurveysBffModule,
    TenantConfigBffModule,
  ],
  providers: [
    CacheService,
    {
      provide: APP_GUARD,
      useClass: BffJwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimiterGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
  exports: [CacheService],
})
export class AppModule {
  configure(consumer: import('@nestjs/common').MiddlewareConsumer) {
    consumer.apply(SecurityHeadersMiddleware).forRoutes('*')
  }
}
