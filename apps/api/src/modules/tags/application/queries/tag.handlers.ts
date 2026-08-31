import { Injectable, NotFoundException } from '@nestjs/common'
import { TagRepository } from '../../domain/repositories/tag.repository'
import { Tag } from '../../domain/entities/tag.entity'
import { GetTagQuery, ListTagsQuery } from './tag.queries'

@Injectable()
export class GetTagHandler {
  constructor(private readonly repo: TagRepository) {}

  async execute(query: GetTagQuery): Promise<Tag> {
    const tag = await this.repo.findById(query.tenantId, query.id)
    if (!tag) throw new NotFoundException('Tag not found')
    return tag
  }
}

@Injectable()
export class ListTagsHandler {
  constructor(private readonly repo: TagRepository) {}

  async execute(query: ListTagsQuery) {
    return this.repo.findAll(query.tenantId, query.options)
  }
}
