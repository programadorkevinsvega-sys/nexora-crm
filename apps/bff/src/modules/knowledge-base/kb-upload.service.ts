import { Injectable, Logger } from '@nestjs/common'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export interface UploadResult {
  fileUrl: string
  extractedText: string
  filename: string
  mimeType: string
}

@Injectable()
export class KbUploadService {
  private readonly logger = new Logger(KbUploadService.name)
  private readonly s3: S3Client | null

  constructor() {
    const endpoint = process.env.R2_ENDPOINT
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

    if (endpoint && accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        region: 'auto',
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
      })
    } else {
      this.s3 = null
      this.logger.warn('R2 storage not configured. Files will not be uploaded to cloud.')
    }
  }

  async processAndUpload(
    buffer: Buffer,
    filename: string,
    mimeType: string,
    tenantId: string,
  ): Promise<UploadResult> {
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const key = `kb/${tenantId}/${Date.now()}-${sanitized}`
    let fileUrl = ''

    // Upload to R2 if configured
    if (this.s3) {
      const bucket = process.env.R2_BUCKET_NAME || 'nexora-kb-files'
      await this.s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }))
      const publicBase = process.env.R2_PUBLIC_URL || ''
      fileUrl = publicBase ? `${publicBase}/${key}` : `[Cloud: ${bucket}/${key}]`
      this.logger.log(`File uploaded to R2: ${key}`)
    }

    const extractedText = this.extractText(buffer, filename, mimeType, fileUrl)
    return { fileUrl, extractedText, filename: sanitized, mimeType }
  }

  private extractText(buffer: Buffer, filename: string, mimeType: string, fileUrl: string): string {
    const lower = filename.toLowerCase()

    // Plain text and Markdown: direct extract
    if (mimeType.includes('text/plain') || lower.endsWith('.txt')
      || lower.endsWith('.md') || lower.endsWith('.csv')) {
      return buffer.toString('utf-8').slice(0, 50000)
    }

    // Images: generate markdown image reference
    if (mimeType.startsWith('image/')) {
      const src = fileUrl || `[archivo: ${filename}]`
      return `# ${filename}\n\n![${filename}](${src})\n\n> Imagen subida a la Base de Conocimiento. Agrega una descripción para optimizar la búsqueda RAG.`
    }

    // PDF / DOCX / DOC: placeholder with editing instructions
    const ext = lower.endsWith('.pdf') ? 'PDF'
      : lower.endsWith('.docx') || lower.endsWith('.doc') ? 'Word'
        : 'Documento'

    const urlRef = fileUrl ? `\n\n📎 **Archivo en la nube:** [Ver ${ext}](${fileUrl})` : ''
    return `# ${filename}\n\n> **Documento ${ext} importado.** El texto completo no pudo ser extraído automáticamente.${urlRef}\n\n## Instrucciones\nPega aquí el contenido del documento para que el motor RAG pueda indexarlo:\n\n`
  }
}
