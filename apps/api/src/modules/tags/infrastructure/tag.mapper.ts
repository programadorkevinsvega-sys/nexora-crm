import { Tag } from '../domain/entities/tag.entity'

export class TagMapper {
  static toResponse(tag: Tag) {
    return {
      id: tag.id,
      tenantId: tag.tenantId,
      name: tag.name,
      color: tag.color,
      createdAt: tag.createdAt.toISOString(),
    }
  }
}
