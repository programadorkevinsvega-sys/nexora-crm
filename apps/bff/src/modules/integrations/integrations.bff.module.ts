import { Module } from '@nestjs/common'
import { IntegrationsBffController } from './integrations.bff.controller'
import { IntegrationsBffService } from './integrations.bff.service'
import { IntegrationsDispatcher } from './integrations.dispatcher'
import { AiIntegrationDispatcher } from './dispatchers/ai-integration.dispatcher'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [IntegrationsBffController],
  providers: [IntegrationsBffService, IntegrationsDispatcher, AiIntegrationDispatcher, CacheService],
  exports: [IntegrationsBffService, IntegrationsDispatcher, AiIntegrationDispatcher],
})
export class IntegrationsBffModule {}

