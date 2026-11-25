import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  UploadFileHandler, GetFileHandler, DeleteFileHandler,
  ListFilesHandler, GetFileUrlHandler, UpdateFileMetadataHandler,
  UploadFileCommand, GetFileQuery, DeleteFileCommand,
  ListFilesQuery, GetFileUrlQuery, UpdateFileMetadataCommand,
} from '../../application/handlers'
import { FileMapper } from '../../infrastructure/file.mapper'
import type { File } from '../../domain/entities/file.entity'

type JsonObject = Record<string, unknown>

interface UploadFileRequest {
  fileName: string
  mimeType: string
  content: Uint8Array
  tenantId?: string
  uploadedByUserId?: string
  entityType?: string
  entityId?: string
  metadataJson?: string
  isPublic?: boolean
}
interface FileIdRequest { id: string; tenantId?: string }
interface ListFilesRequest {
  tenantId?: string
  entityType?: string
  entityId?: string
  mimeType?: string
  uploadedByUserId?: string
  cursor?: string
  limit?: number
}
interface GetFileUrlRequest extends FileIdRequest { expiresInSeconds?: number }
interface UpdateFileMetadataRequest extends FileIdRequest {
  entityType?: string
  entityId?: string
  metadataJson?: string
  isPublic?: boolean
}

function parseJsonObject(json: string | undefined): JsonObject | undefined {
  if (!json) return undefined
  const parsed: unknown = JSON.parse(json)
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new TypeError('Expected a JSON object')
  }
  return parsed as JsonObject
}

@Controller()
export class StorageGrpcController {
  constructor(
    private readonly uploadFileHandler: UploadFileHandler,
    private readonly getFileHandler: GetFileHandler,
    private readonly deleteFileHandler: DeleteFileHandler,
    private readonly listFilesHandler: ListFilesHandler,
    private readonly getFileUrlHandler: GetFileUrlHandler,
    private readonly updateFileMetadataHandler: UpdateFileMetadataHandler,
  ) {}

  @GrpcMethod('StorageService', 'UploadFile')
  async uploadFile(data: UploadFileRequest) {
    const result = await this.uploadFileHandler.execute(
      new UploadFileCommand(
        data.fileName, data.mimeType, Buffer.from(data.content), data.tenantId,
        data.uploadedByUserId, data.entityType, data.entityId,
        parseJsonObject(data.metadataJson), data.isPublic,
      ),
    )
    return { json: JSON.stringify(FileMapper.toResponse(result)) }
  }

  @GrpcMethod('StorageService', 'GetFile')
  async getFile(data: FileIdRequest) {
    const result = await this.getFileHandler.execute(new GetFileQuery(data.id, data.tenantId))
    return { json: JSON.stringify(FileMapper.toResponse(result)) }
  }

  @GrpcMethod('StorageService', 'DeleteFile')
  async deleteFile(data: FileIdRequest) {
    await this.deleteFileHandler.execute(new DeleteFileCommand(data.id, data.tenantId))
    return { id: data.id }
  }

  @GrpcMethod('StorageService', 'ListFiles')
  async listFiles(data: ListFilesRequest) {
    const result = await this.listFilesHandler.execute(new ListFilesQuery(
      data.tenantId, data.entityType, data.entityId, data.mimeType,
      data.uploadedByUserId, data.cursor, data.limit,
    ))
    return {
      jsonItems: result.data.map((file: File) => JSON.stringify(FileMapper.toResponse(file))),
      nextCursor: result.nextCursor ?? '',
    }
  }

  @GrpcMethod('StorageService', 'GetFileUrl')
  async getFileUrl(data: GetFileUrlRequest) {
    const result = await this.getFileUrlHandler.execute(
      new GetFileUrlQuery(data.id, data.tenantId, data.expiresInSeconds),
    )
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('StorageService', 'UpdateFileMetadata')
  async updateFileMetadata(data: UpdateFileMetadataRequest) {
    const result = await this.updateFileMetadataHandler.execute(
      new UpdateFileMetadataCommand(
        data.id, data.tenantId, data.entityType, data.entityId,
        parseJsonObject(data.metadataJson), data.isPublic,
      ),
    )
    return { json: JSON.stringify(FileMapper.toResponse(result)) }
  }
}
