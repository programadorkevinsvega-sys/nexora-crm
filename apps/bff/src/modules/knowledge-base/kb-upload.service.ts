import { Injectable, Logger } from '@nestjs/common'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { CacheService } from '../../common/cache/cache.service'
import { SecretsVault } from '@crm/shared'

export interface UploadResult {
  fileUrl: string
  extractedText: string
  filename: string
  mimeType: string
}

interface StorageCredentials {
  endpoint?: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicUrl?: string
  region?: string
}

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

@Injectable()
export class KbUploadService {
  private readonly logger = new Logger(KbUploadService.name)

  constructor(private readonly cache: CacheService) {}

  /** Resolves storage credentials: panel config takes priority over .env */
  private async resolveCredentials(tenantId: string): Promise<StorageCredentials | null> {
    // Try CLOUDFLARE_R2 first, then AWS_S3 from the integrations vault
    for (const provider of ['CLOUDFLARE_R2', 'AWS_S3']) {
      const stored = await this.cache.get<any>(`integration:${tenantId}:${provider}`)
      if (stored?.credentials) {
        const creds = stored.credentials as Record<string, string>
        const decrypt = (v: string) => {
          try { return SecretsVault.decrypt(v, tenantId) } catch { return v }
        }
        return {
          endpoint: creds.endpoint ? decrypt(creds.endpoint) : undefined,
          accessKeyId: decrypt(creds.accessKeyId || ''),
          secretAccessKey: decrypt(creds.secretAccessKey || ''),
          bucketName: decrypt(creds.bucketName || 'nexora-kb-files'),
          publicUrl: creds.publicUrl ? decrypt(creds.publicUrl) : undefined,
          region: creds.region ? decrypt(creds.region) : 'auto',
        }
      }
    }

    // Fallback to environment variables
    const endpoint = process.env.R2_ENDPOINT
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
    if (endpoint && accessKeyId && secretAccessKey) {
      return {
        endpoint,
        accessKeyId,
        secretAccessKey,
        bucketName: process.env.R2_BUCKET_NAME || 'nexora-kb-files',
        publicUrl: process.env.R2_PUBLIC_URL || undefined,
        region: 'auto',
      }
    }

    return null
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

    const creds = await this.resolveCredentials(tenantId)
    if (creds) {
      try {
        const s3 = new S3Client({
          region: creds.region || 'auto',
          endpoint: creds.endpoint,
          credentials: { accessKeyId: creds.accessKeyId, secretAccessKey: creds.secretAccessKey },
        })
        await s3.send(new PutObjectCommand({
          Bucket: creds.bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }))
        const publicBase = creds.publicUrl || ''
        fileUrl = publicBase ? `${publicBase}/${key}` : `[Cloud: ${creds.bucketName}/${key}]`
        this.logger.log(`File uploaded to cloud storage: ${key}`)
      } catch (err: any) {
        this.logger.error(`Storage upload failed: ${err.message}`)
      }
    } else {
      this.logger.warn('No storage provider configured. File will be saved as text only. Configure R2 or S3 in Settings → Integrations → Almacenamiento.')
    }

    const extractedText = this.extractText(buffer, filename, mimeType, fileUrl)
    return { fileUrl, extractedText, filename: sanitized, mimeType }
  }

  private extractText(buffer: Buffer, filename: string, mimeType: string, fileUrl: string): string {
    const lower = filename.toLowerCase()
    if (mimeType.includes('text/plain') || lower.endsWith('.txt')
      || lower.endsWith('.md') || lower.endsWith('.csv')) {
      return buffer.toString('utf-8').slice(0, 50000)
    }
    if (mimeType.startsWith('image/')) {
      const src = fileUrl || `[archivo: ${filename}]`
      return `# ${filename}\n\n![${filename}](${src})\n\n> Imagen subida a la Base de Conocimiento. Agrega una descripción para optimizar la búsqueda RAG.`
    }
    const ext = lower.endsWith('.pdf') ? 'PDF'
      : lower.endsWith('.docx') || lower.endsWith('.doc') ? 'Word' : 'Documento'
    const urlRef = fileUrl ? `\n\n📎 **Archivo:** [Ver ${ext}](${fileUrl})` : ''
    return `# ${filename}\n\n> **Documento ${ext} importado.**${urlRef}\n\n## Contenido\nPega aquí el texto del documento para que el motor RAG pueda indexarlo:\n\n`
  }
}
