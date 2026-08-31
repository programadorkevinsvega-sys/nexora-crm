import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { S3Client, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Upload } from '@aws-sdk/lib-storage'

@Injectable()
export class R2Service implements OnModuleDestroy {
  private readonly logger = new Logger(R2Service.name)
  private client: S3Client
  private bucket: string
  private publicUrlBase: string
  private initialized = false

  constructor() {
    const endpoint = process.env.R2_ENDPOINT
    const accessKeyId = process.env.R2_ACCESS_KEY_ID
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
    this.bucket = process.env.R2_BUCKET || 'crm-storage'
    this.publicUrlBase = process.env.R2_PUBLIC_URL || ''
    if (!endpoint || !accessKeyId || !secretAccessKey) {
      this.logger.warn('R2 credentials not fully configured — S3 client will fail at runtime')
    }
    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId: accessKeyId || '', secretAccessKey: secretAccessKey || '' },
      forcePathStyle: true,
    })
    this.initialized = true
  }

  async upload(key: string, body: Buffer | Uint8Array, mimeType: string, isPublic = false): Promise<void> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket, Key: key, Body: body,
        ContentType: mimeType,
        ...(isPublic ? { ACL: 'public-read' } : {}),
      },
    })
    await upload.done()
    this.logger.log(`Uploaded ${key} to ${this.bucket}`)
  }

  async download(key: string): Promise<Buffer> {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key })
    const response = await this.client.send(cmd)
    const chunks: Uint8Array[] = []
    for await (const chunk of response.Body as any) { chunks.push(chunk) }
    return Buffer.concat(chunks)
  }

  async delete(key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
    this.logger.log(`Deleted ${key} from ${this.bucket}`)
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key })
    return getSignedUrl(this.client, cmd, { expiresIn: expiresInSeconds })
  }

  getPublicUrl(key: string): string {
    if (this.publicUrlBase) return `${this.publicUrlBase}/${key}`
    return `https://${this.bucket}.${process.env.R2_ENDPOINT?.replace('https://', '')}/${key}`
  }

  onModuleDestroy(): void {
    if (this.initialized) { this.client.destroy(); this.logger.log('R2 client destroyed') }
  }
}
