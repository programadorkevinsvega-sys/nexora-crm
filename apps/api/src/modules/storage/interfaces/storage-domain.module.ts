import { Module } from '@nestjs/common'
import { OutboxModule } from '../../../common/outbox/outbox.module'
import { StorageGrpcController } from './grpc/storage-grpc.controller'
import {
  UploadFileHandler, GetFileHandler, DeleteFileHandler,
  ListFilesHandler, GetFileUrlHandler, UpdateFileMetadataHandler,
} from '../application/handlers'
import { FileRepository } from '../domain/repositories/file.repository'
import { DrizzleFileRepository } from '../infrastructure/drizzle-file.repository'

import { R2Service } from '../infrastructure/storage/r2.service'

@Module({
  imports: [OutboxModule],
  controllers: [StorageGrpcController],
  providers: [
    R2Service,
    UploadFileHandler, GetFileHandler, DeleteFileHandler,
    ListFilesHandler, GetFileUrlHandler, UpdateFileMetadataHandler,
    { provide: FileRepository, useClass: DrizzleFileRepository },
  ],
  exports: [FileRepository, R2Service],
})
export class StorageDomainModule {}
