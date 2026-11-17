import { Module, Global } from '@nestjs/common'
import { ICachePort } from '@crm/shared'
import { RedisCacheAdapter } from './redis-cache.adapter'

@Global()
@Module({
  providers: [
    RedisCacheAdapter,
    { provide: ICachePort, useExisting: RedisCacheAdapter },
  ],
  exports: [ICachePort, RedisCacheAdapter],
})
export class CacheModule {}
