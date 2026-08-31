import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'
import {
  UploadFileHandler, GetFileHandler, DeleteFileHandler,
  ListFilesHandler, GetFileUrlHandler, UpdateFileMetadataHandler,
  UploadFileCommand, GetFileQuery, DeleteFileCommand,
  ListFilesQuery, GetFileUrlQuery, UpdateFileMetadataCommand,
} from '../../application/handlers'
import { FileMapper } from '../../infrastructure/file.mapper'

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
  async uploadFile(data: any) {
    const result = await this.uploadFileHandler.execute(
      new UploadFileCommand(data.fileName, data.mimeType, Buffer.from(data.content),
        data.tenantId, data.uploadedByUserId, data.entityType, data.entityId,
        data.metadataJson ? JSON.parse(data.metadataJson) : undefined, data.isPublic))
    return { json: JSON.stringify(FileMapper.toResponse(result)) }
  }

  @GrpcMethod('StorageService', 'GetFile')
  async getFile(data: any) {
    const result = await this.getFileHandler.execute(new GetFileQuery(data.id, data.tenantId))
    return { json: JSON.stringify(FileMapper.toResponse(result)) }
  }

  @GrpcMethod('StorageService', 'DeleteFile')
  async deleteFile(data: any) {
    await this.deleteFileHandler.execute(new DeleteFileCommand(data.id, data.tenantId))
    return { id: data.id }
  }

  @GrpcMethod('StorageService', 'ListFiles')
  async listFiles(data: any) {
    const result = await this.listFilesHandler.execute(
      new ListFilesQuery(data.tenantId, data.entityType, data.entityId,
        data.mimeType, data.uploadedByUserId, data.cursor, data.limit))
    return { jsonItems: result.data.map((f: any) => JSON.stringify(FileMapper.toResponse(f))), nextCursor: result.nextCursor ?? '' }
  }

  @GrpcMethod('StorageService', 'GetFileUrl')
  async getFileUrl(data: any) {
    const result = await this.getFileUrlHandler.execute(new GetFileUrlQuery(data.id, data.tenantId, data.expiresInSeconds))
    return { json: JSON.stringify(result) }
  }

  @GrpcMethod('StorageService', 'UpdateFileMetadata')
  async updateFileMetadata(data: any) {
    const result = await this.updateFileMetadataHandler.execute(
      new UpdateFileMetadataCommand(data.id, data.tenantId, data.entityType, data.entityId,
        data.metadataJson ? JSON.parse(data.metadataJson) : undefined, data.isPublic))
    return { json: JSON.stringify(FileMapper.toResponse(result)) }
  }
}
