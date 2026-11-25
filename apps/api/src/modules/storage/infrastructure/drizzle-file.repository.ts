import { Injectable } from '@nestjs/common'
import { eq, and, gt, asc, isNull, type SQL } from 'drizzle-orm'
import { getDb, files as filesTable } from '@crm/database'
import { FileRepository } from '../domain/repositories/file.repository'
import { File } from '../domain/entities/file.entity'
import { FileMapper } from './file.mapper'

@Injectable()
export class DrizzleFileRepository extends FileRepository {
  private get db() { return getDb() }

  async findById(id: string): Promise<File | null> {
    const row = await this.db.query.files.findFirst({ where: eq(filesTable.id, id) })
    return row ? FileMapper.toDomain(row) : null
  }

  async save(file: File): Promise<void> {
    await this.db.insert(filesTable).values({
      id: file.id, tenantId: file.tenantId, originalName: file.originalName,
      mimeType: file.mimeType, sizeBytes: file.sizeBytes, storageKey: file.storageKey,
      bucket: file.bucket, uploadedByUserId: file.uploadedByUserId,
      entityType: file.entityType, entityId: file.entityId,
      metadataJson: file.metadataJson, checksumSha256: file.checksumSha256,
      isPublic: file.isPublic, createdAt: file.createdAt, updatedAt: file.updatedAt,
    }).onConflictDoNothing()
  }

  async update(file: File): Promise<void> {
    await this.db.update(filesTable).set({
      originalName: file.originalName, mimeType: file.mimeType,
      sizeBytes: file.sizeBytes, entityType: file.entityType,
      entityId: file.entityId, metadataJson: file.metadataJson,
      isPublic: file.isPublic, updatedAt: new Date(),
      deletedAt: file.deletedAt,
    }).where(eq(filesTable.id, file.id))
  }

  async list(params: {
    tenantId?: string; entityType?: string; entityId?: string
    mimeType?: string; uploadedByUserId?: string; cursor?: string; limit?: number
  }): Promise<{ data: File[]; nextCursor: string | null }> {
    const conditions: SQL[] = [isNull(filesTable.deletedAt)]
    if (params.tenantId) conditions.push(eq(filesTable.tenantId, params.tenantId))
    if (params.entityType) conditions.push(eq(filesTable.entityType, params.entityType))
    if (params.entityId) conditions.push(eq(filesTable.entityId, params.entityId))
    if (params.mimeType) conditions.push(eq(filesTable.mimeType, params.mimeType))
    if (params.uploadedByUserId) conditions.push(eq(filesTable.uploadedByUserId, params.uploadedByUserId))
    if (params.cursor) conditions.push(gt(filesTable.createdAt, new Date(params.cursor)))
    const limit = params.limit ?? 20
    const rows = await this.db.query.files.findMany({
      where: and(...conditions), limit: limit + 1, orderBy: [asc(filesTable.createdAt)],
    })
    const hasMore = rows.length > limit
    return {
      data: (hasMore ? rows.slice(0, limit) : rows).map(r => FileMapper.toDomain(r)),
      nextCursor: hasMore ? rows[limit - 1].createdAt.toISOString() : null,
    }
  }

  async findByStorageKey(storageKey: string): Promise<File | null> {
    const row = await this.db.query.files.findFirst({ where: eq(filesTable.storageKey, storageKey) })
    return row ? FileMapper.toDomain(row) : null
  }
}
