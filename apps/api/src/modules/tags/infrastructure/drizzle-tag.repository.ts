import { Injectable } from '@nestjs/common'
import { getDb, tags as tagsTable } from '@crm/database'
import { eq, and, like, asc, gt, SQL } from 'drizzle-orm'
import { TagRepository, FindAllOptions, PaginatedTags } from '../domain/repositories/tag.repository'
import { Tag } from '../domain/entities/tag.entity'

@Injectable()
export class DrizzleTagRepository extends TagRepository {
  private get db() {
    return getDb()
  }

  async create(tag: Tag): Promise<void> {
    await this.db.insert(tagsTable).values({
      id: tag.id,
      tenantId: tag.tenantId,
      name: tag.name,
      color: tag.color,
      createdAt: tag.createdAt,
    })
  }

  async findById(tenantId: string, id: string): Promise<Tag | null> {
    const rows = await this.db
      .select()
      .from(tagsTable)
      .where(and(eq(tagsTable.id, id), eq(tagsTable.tenantId, tenantId)))
      .limit(1)
    if (rows.length === 0) return null
    return Tag.create(rows[0])
  }

  async findAll(tenantId: string, options: FindAllOptions): Promise<PaginatedTags> {
    const conditions: SQL[] = [eq(tagsTable.tenantId, tenantId)]

    if (options.search) {
      conditions.push(like(tagsTable.name, `%${options.search}%`))
    }

    if (options.cursor) {
      conditions.push(gt(tagsTable.createdAt, new Date(options.cursor)))
    }

    const limit = Math.min(options.limit, 100)
    const rows = await this.db
      .select()
      .from(tagsTable)
      .where(and(...conditions))
      .orderBy(asc(tagsTable.createdAt), asc(tagsTable.id))
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const data = (hasMore ? rows.slice(0, limit) : rows).map(r => Tag.create(r))
    const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null

    return { data, nextCursor }
  }

  async update(tag: Tag): Promise<void> {
    await this.db
      .update(tagsTable)
      .set({
        name: tag.name,
        color: tag.color,
      })
      .where(eq(tagsTable.id, tag.id))
  }

  async delete(tenantId: string, id: string): Promise<void> {
    await this.db
      .delete(tagsTable)
      .where(and(eq(tagsTable.id, id), eq(tagsTable.tenantId, tenantId)))
  }
}
