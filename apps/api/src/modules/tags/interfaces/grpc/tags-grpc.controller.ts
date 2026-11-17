import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  CreateTagHandler, UpdateTagHandler, DeleteTagHandler,
} from '../../application/commands/tag.handlers'
import {
  GetTagHandler, ListTagsHandler,
} from '../../application/queries/tag.handlers'
import {
  CreateTagCommand, UpdateTagCommand, DeleteTagCommand,
} from '../../application/commands/tag.commands'
import {
  GetTagQuery, ListTagsQuery,
} from '../../application/queries/tag.queries'
import { TagMapper } from '../../infrastructure/tag.mapper'

@Controller()
export class TagsGrpcController {
  constructor(
    private readonly createHandler: CreateTagHandler,
    private readonly getHandler: GetTagHandler,
    private readonly updateHandler: UpdateTagHandler,
    private readonly listHandler: ListTagsHandler,
    private readonly deleteHandler: DeleteTagHandler,
  ) {}

  @GrpcMethod('TagService', 'CreateTag')
  async createTag(data: { tenantId: string; name: string; color?: string }) {
    const result = await this.createHandler.execute(
      new CreateTagCommand(data.tenantId, data.name, data.color),
    )
    const tag = await this.getHandler.execute(
      new GetTagQuery(data.tenantId, result.id),
    )
    return { json: JSON.stringify(TagMapper.toResponse(tag)) }
  }

  @GrpcMethod('TagService', 'GetTag')
  async getTag(data: { tenantId: string; id: string }) {
    const tag = await this.getHandler.execute(
      new GetTagQuery(data.tenantId, data.id),
    )
    return { json: JSON.stringify(TagMapper.toResponse(tag)) }
  }

  @GrpcMethod('TagService', 'UpdateTag')
  async updateTag(data: { tenantId: string; id: string; name?: string; color?: string }) {
    await this.updateHandler.execute(
      new UpdateTagCommand(data.tenantId, data.id, data.name, data.color),
    )
    return {}
  }

  @GrpcMethod('TagService', 'ListTags')
  async listTags(data: { tenantId: string; search?: string; cursor?: string; limit?: number }) {
    const result = await this.listHandler.execute(
      new ListTagsQuery(data.tenantId, {
        search: data.search,
        cursor: data.cursor,
        limit: Math.min(data.limit || 20, 100),
      }),
    )
    return {
      jsonItems: result.data.map(t => JSON.stringify(TagMapper.toResponse(t))),
      nextCursor: result.nextCursor ?? undefined,
    }
  }

  @GrpcMethod('TagService', 'DeleteTag')
  async deleteTag(data: { tenantId: string; id: string }) {
    await this.deleteHandler.execute(
      new DeleteTagCommand(data.tenantId, data.id),
    )
    return {}
  }
}
