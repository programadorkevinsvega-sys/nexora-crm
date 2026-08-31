import { Module } from '@nestjs/common'
import { IntegrationsBffController } from './integrations.bff.controller'
import { IntegrationsBffService } from './integrations.bff.service'
import { IntegrationsDispatcher } from './integrations.dispatcher'
import { AiIntegrationDispatcher } from './dispatchers/ai-integration.dispatcher'
import { SmtpEmailDispatcher } from './dispatchers/smtp-email.dispatcher'
import { AwsSesDispatcher } from './dispatchers/aws-ses.dispatcher'
import { StripeDispatcher } from './dispatchers/stripe.dispatcher'
import { SlackDispatcher } from './dispatchers/slack.dispatcher'
import { ShopifyDispatcher } from './dispatchers/shopify.dispatcher'
import { HubSpotDispatcher } from './dispatchers/hubspot.dispatcher'
import { ZapierMakeDispatcher } from './dispatchers/zapier-make.dispatcher'
import { GoogleWorkspaceDispatcher } from './dispatchers/google-workspace.dispatcher'
import { DiscordDispatcher } from './dispatchers/discord.dispatcher'
import { AccountingDispatcher } from './dispatchers/accounting.dispatcher'
import { CacheService } from '../../common/cache/cache.service'

const DISPATCHERS = [
  AiIntegrationDispatcher,
  SmtpEmailDispatcher,
  AwsSesDispatcher,
  StripeDispatcher,
  SlackDispatcher,
  ShopifyDispatcher,
  HubSpotDispatcher,
  ZapierMakeDispatcher,
  GoogleWorkspaceDispatcher,
  DiscordDispatcher,
  AccountingDispatcher,
]

@Module({
  controllers: [IntegrationsBffController],
  providers: [
    IntegrationsBffService,
    IntegrationsDispatcher,
    CacheService,
    ...DISPATCHERS,
  ],
  exports: [
    IntegrationsBffService,
    IntegrationsDispatcher,
    ...DISPATCHERS,
  ],
})
export class IntegrationsBffModule {}
