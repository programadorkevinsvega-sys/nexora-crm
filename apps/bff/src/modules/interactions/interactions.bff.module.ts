import { Module } from '@nestjs/common'
import { NotesBffController } from './notes.bff.controller'
import { TasksBffController } from './tasks.bff.controller'
import { CallsBffController } from './calls.bff.controller'
import { InteractionsBffService } from './interactions.bff.service'
import { CacheService } from '../../common/cache/cache.service'

@Module({
  controllers: [NotesBffController, TasksBffController, CallsBffController],
  providers: [InteractionsBffService, CacheService],
  exports: [InteractionsBffService],
})
export class InteractionsBffModule {}
