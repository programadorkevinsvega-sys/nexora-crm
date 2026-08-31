import {
  Controller, Post, UseInterceptors, UploadedFile,
  Body, Headers, BadRequestException, Logger,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { ApiCoreGrpcClient } from '../../common/grpc/api-core-grpc.client'
import { KbUploadService } from './kb-upload.service'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'
const ALLOWED_MIMES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
]

@Controller('api/kb')
export class KbUploadController {
  private readonly logger = new Logger(KbUploadController.name)

  constructor(
    private readonly uploadService: KbUploadService,
    private readonly api: ApiCoreGrpcClient,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title?: string,
    @Body('categoryId') categoryId?: string,
    @Headers('X-Tenant-Id') tenantId?: string,
  ): Promise<{ id: string; title: string; fileUrl: string }> {
    if (!file) throw new BadRequestException('No se proporcionó ningún archivo.')
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      throw new BadRequestException(`Tipo de archivo no soportado: ${file.mimetype}`)
    }

    const tid = tenantId || DEFAULT_TENANT_ID
    const result = await this.uploadService.processAndUpload(
      file.buffer, file.originalname, file.mimetype, tid,
    )

    const articleTitle = title?.trim() || result.filename.replace(/\.[^.]+$/, '').replace(/_/g, ' ')
    const slug = `${articleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`

    const article = await this.api.createKbArticle({
      tenantId: tid,
      categoryId: categoryId || null,
      title: articleTitle,
      slug,
      summary: `Documento importado: ${result.filename}`,
      contentMarkdown: result.extractedText,
      isPublished: true,
    })

    this.logger.log(`KB article created from upload: ${article.id} (${articleTitle})`)
    return { id: article.id, title: article.title, fileUrl: result.fileUrl }
  }
}
