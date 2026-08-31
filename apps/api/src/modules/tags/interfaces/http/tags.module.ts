import { Module } from '@nestjs/common'
import { TagsGrpcController } from '../grpc/tags-grpc.controller'
import { CreateTagHandler, UpdateTagHandler, DeleteTagHandler } from '../../application/commands/tag.handlers'
import { GetTagHandler, ListTagsHandler } from '../../application/queries/tag.handlers'
import { TagRepository } from '../../domain/repositories/tag.repository'
import { DrizzleTagRepository } from '../../infrastructure/drizzle-tag.repository'

@Module({
  controllers: [TagsGrpcController],
  providers: [
    CreateTagHandler,
    UpdateTagHandler,
    DeleteTagHandler,
    GetTagHandler,
    ListTagsHandler,
    { provide: TagRepository, useClass: DrizzleTagRepository },
  ],
  exports: [TagRepository],
})
export class TagsModule {}
