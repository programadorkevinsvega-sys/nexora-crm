import { Module } from '@nestjs/common'
import { PersonalCrmBffController } from './personal-crm.bff.controller'
import { PersonalCrmBffService } from './personal-crm.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [PersonalCrmBffController],
  providers: [PersonalCrmBffService, CacheService],
  exports: [PersonalCrmBffService],
})
export class PersonalCrmBffModule {}
