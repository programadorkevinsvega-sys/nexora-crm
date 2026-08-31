import { Module } from '@nestjs/common'
import { ContactsBffController } from './contacts.bff.controller'
import { ContactsBffService } from './contacts.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [ContactsBffController],
  providers: [ContactsBffService, CacheService],
  exports: [ContactsBffService],
})
export class ContactsBffModule {}
