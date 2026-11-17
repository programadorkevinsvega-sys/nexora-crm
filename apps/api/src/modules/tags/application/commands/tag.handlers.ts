import { Injectable } from '@nestjs/common'
import { TagRepository } from '../../domain/repositories/tag.repository'
import { Tag } from '../../domain/entities/tag.entity'
import { CreateTagCommand, UpdateTagCommand, DeleteTagCommand } from './tag.commands'

@Injectable()
export class CreateTagHandler {
  constructor(private readonly repo: TagRepository) {}

  async execute(command: CreateTagCommand): Promise<{ id: string }> {
    const id = crypto.randomUUID()
    const tag = Tag.create({
      id,
      tenantId: command.tenantId,
      name: command.name,
      color: command.color ?? null,
      createdAt: new Date(),
    })
    await this.repo.create(tag)
    return { id }
  }
}

@Injectable()
export class UpdateTagHandler {
  constructor(private readonly repo: TagRepository) {}

  async execute(command: UpdateTagCommand): Promise<void> {
    const tag = await this.repo.findById(command.tenantId, command.id)
    if (!tag) throw new Error('Tag not found')

    const updated = Tag.create({
      ...tag.toJSON(),
      name: command.name ?? tag.name,
      color: command.color !== undefined ? command.color : tag.color,
    })
    await this.repo.update(updated)
  }
}

@Injectable()
export class DeleteTagHandler {
  constructor(private readonly repo: TagRepository) {}

  async execute(command: DeleteTagCommand): Promise<void> {
    await this.repo.delete(command.tenantId, command.id)
  }
}
