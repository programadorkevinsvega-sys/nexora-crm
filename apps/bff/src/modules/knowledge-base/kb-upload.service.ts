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

interface StoredIntegrationConfig {
  credentials?: unknown
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function decryptCredential(value: unknown, tenantId: string): string | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined
  try {
    return SecretsVault.decrypt(value, tenantId)
  } catch {
    return value
  }
}

@Injectable()
export class KbUploadService {
  private readonly logger = new Logger(KbUploadService.name)
  constructor(private readonly cache: CacheService) {}

  private async resolveCredentials(tenantId: string): Promise<StorageCredentials | null> {
    for (const provider of ['CLOUDFLARE_R2', 'AWS_S3']) {
      const stored = await this.cache.get<StoredIntegrationConfig>(`integration:${tenantId}:${provider}`)
      if (!stored?.credentials) continue

      const credentials = asRecord(stored.credentials)
      const accessKeyId = decryptCredential(credentials.accessKeyId, tenantId)
      const secretAccessKey = decryptCredential(credentials.secretAccessKey, tenantId)
      if (!accessKeyId || !secretAccessKey) continue

      return {
        endpoint: decryptCredential(credentials.endpoint, tenantId),
        accessKeyId,
        secretAccessKey,
        bucketName: decryptCredential(credentials.bucketName, tenantId) || 'nexora-kb-files',
        publicUrl: decryptCredential(credentials.publicUrl, tenantId),
        region: decryptCredential(credentials.region, tenantId) || 'auto',
      }
    }

    const endpoint = process.env.R2_ENDPOINT
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
    if (endpoint && accessKeyId && secretAccessKey) {
      return {
        endpoint, accessKeyId, secretAccessKey,
        bucketName: process.env.R2_BUCKET_NAME || 'nexora-kb-files',
        publicUrl: process.env.R2_PUBLIC_URL || undefined,
        region: 'auto',
      }
    }
    return null
  }

  async processAndUpload(buffer: Buffer, filename: string, mimeType: string, tenantId: string): Promise<UploadResult> {
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    const key = `kb/${tenantId}/${Date.now()}-${sanitized}`
    let fileUrl = ''
    const credentials = await this.resolveCredentials(tenantId)
    if (credentials) {
      try {
        const s3 = new S3Client({
          region: credentials.region || 'auto',
          endpoint: credentials.endpoint,
          credentials: { accessKeyId: credentials.accessKeyId, secretAccessKey: credentials.secretAccessKey },
        })
        await s3.send(new PutObjectCommand({
          Bucket: credentials.bucketName, Key: key, Body: buffer, ContentType: mimeType,
        }))
        const publicBase = credentials.publicUrl || ''
        fileUrl = publicBase ? `${publicBase}/${key}` : `[Cloud: ${credentials.bucketName}/${key}]`
        this.logger.log(`File uploaded to cloud storage: ${key}`)
      } catch (error: unknown) {
        this.logger.error(`Storage upload failed: ${error instanceof Error ? error.message : String(error)}`)
      }
    } else {
      this.logger.warn('No storage provider configured. File will be saved as text only. Configure R2 or S3 in Settings → Integrations → Almacenamiento.')
    }
    const extractedText = this.extractText(buffer, filename, mimeType, fileUrl)
    return { fileUrl, extractedText, filename: sanitized, mimeType }
  }

  private extractText(buffer: Buffer, filename: string, mimeType: string, fileUrl: string): string {
    const lower = filename.toLowerCase()
    if (mimeType.includes('text/plain') || lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.csv')) {
      return buffer.toString('utf-8').slice(0, 50000)
    }
    if (mimeType.startsWith('image/')) {
      const src = fileUrl || `[archivo: ${filename}]`
      return `# ${filename}\n\n![${filename}](${src})\n\n> Imagen subida a la Base de Conocimiento. Agrega una descripción para optimizar la búsqueda RAG.`
    }
    const ext = lower.endsWith('.pdf') ? 'PDF' : lower.endsWith('.docx') || lower.endsWith('.doc') ? 'Word' : 'Documento'
    const urlRef = fileUrl ? `\n\n📎 **Archivo:** [Ver ${ext}](${fileUrl})` : ''
    return `# ${filename}\n\n> **Documento ${ext} importado.**${urlRef}\n\n## Contenido\nPega aquí el texto del documento para que el motor RAG pueda indexarlo:\n\n`
  }
}