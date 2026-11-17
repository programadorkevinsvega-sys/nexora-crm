import { Module } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PublicApiBffController } from './public-api.bff.controller'
import { PublicApiBffService } from './public-api.bff.service'
import { ApiKeyGuard } from '../../common/guards/api-key.guard'
import { ScopeGuard } from '../../common/guards/scope.guard'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [PublicApiBffController],
  providers: [
    PublicApiBffService,
    ApiKeyGuard,
    ScopeGuard,
    Reflector,
    CacheService,
  ],
  exports: [PublicApiBffService],
})
export class PublicApiBffModule {}
