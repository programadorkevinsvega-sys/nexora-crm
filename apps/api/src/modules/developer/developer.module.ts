import { Module } from '@nestjs/common'
import { DeveloperController } from './interfaces/http/developer.controller'
import { DeveloperGrpcController } from './interfaces/grpc/developer-grpc.controller'
import {
  CreateApiKeyHandler,
  RevokeApiKeyHandler,
  DeleteApiKeyHandler,
  CreateWebhookEndpointHandler,
  DeleteWebhookEndpointHandler,
  DispatchWebhookEventHandler,
} from './application/commands/developer.handlers'
import {
  ListApiKeysHandler,
  ValidateApiKeyHandler,
  ListWebhookEndpointsHandler,
  ListDeliveryLogsHandler,
} from './application/queries/developer.handlers'
import { DeveloperRepository } from './domain/repositories/developer.repository'
import { DrizzleDeveloperRepository } from './infrastructure/drizzle-developer.repository'

@Module({
  controllers: [DeveloperController, DeveloperGrpcController],
  providers: [
    CreateApiKeyHandler,
    RevokeApiKeyHandler,
    DeleteApiKeyHandler,
    CreateWebhookEndpointHandler,
    DeleteWebhookEndpointHandler,
    DispatchWebhookEventHandler,
    ListApiKeysHandler,
    ValidateApiKeyHandler,
    ListWebhookEndpointsHandler,
    ListDeliveryLogsHandler,
    {
      provide: DeveloperRepository,
      useClass: DrizzleDeveloperRepository,
    },
  ],
  exports: [
    DeveloperRepository,
    CreateApiKeyHandler,
    RevokeApiKeyHandler,
    DeleteApiKeyHandler,
    CreateWebhookEndpointHandler,
    DeleteWebhookEndpointHandler,
    DispatchWebhookEventHandler,
    ListApiKeysHandler,
    ValidateApiKeyHandler,
    ListWebhookEndpointsHandler,
    ListDeliveryLogsHandler,
  ],
})
export class DeveloperModule {}
