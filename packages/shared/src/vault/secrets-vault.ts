import { createCipheriv, createDecipheriv, randomBytes, hkdfSync } from 'crypto'

export interface EncryptedVaultEnvelope {
  version: 'v1'
  iv: string
  tag: string
  cipherText: string
}

export class SecretsVault {
  private static readonly ALGORITHM = 'aes-256-gcm'
  private static readonly IV_LENGTH = 12 // 96 bits for GCM
  private static readonly TAG_LENGTH = 16 // 128 bits auth tag

  /**
   * Derives a tenant-isolated 256-bit encryption key using HKDF-SHA256
   */
  private static deriveKey(tenantId = 'global-vault'): Buffer {
    const masterKey = process.env.VAULT_MASTER_KEY || process.env.JWT_SECRET || 'nexora_enterprise_master_vault_key_2026_secure_32b'
    const masterBuffer = Buffer.from(masterKey, 'utf-8')
    const salt = Buffer.from(`nexora:vault:tenant:${tenantId}`, 'utf-8')
    const info = Buffer.from('tenant-isolated-aes-gcm-key', 'utf-8')

    return Buffer.from(hkdfSync('sha256', masterBuffer, salt, info, 32))
  }

  /**
   * Encrypts a plaintext secret with AES-256-GCM + tenant isolation
   * Returns a portable envelope string: "enc:v1:<iv_hex>:<tag_hex>:<ciphertext_hex>"
   */
  static encrypt(plainText: string, tenantId?: string): string {
    if (!plainText) return ''
    if (this.isEncrypted(plainText)) return plainText // Avoid double-encryption

    const key = this.deriveKey(tenantId)
    const iv = randomBytes(this.IV_LENGTH)
    const cipher = createCipheriv(this.ALGORITHM, key, iv)

    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf-8'),
      cipher.final(),
    ])
    const tag = cipher.getAuthTag()

    return `enc:v1:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
  }

  /**
   * Decrypts an envelope string with authentication tag verification
   */
  static decrypt(payload: string, tenantId?: string): string {
    if (!payload) return ''
    if (!this.isEncrypted(payload)) return payload // Already plaintext

    const parts = payload.split(':')
    if (parts.length !== 5 || parts[0] !== 'enc' || parts[1] !== 'v1') {
      throw new Error('Invalid vault envelope format')
    }

    const iv = Buffer.from(parts[2], 'hex')
    const tag = Buffer.from(parts[3], 'hex')
    const cipherText = Buffer.from(parts[4], 'hex')

    const key = this.deriveKey(tenantId)
    const decipher = createDecipheriv(this.ALGORITHM, key, iv)
    decipher.setAuthTag(tag)

    const decrypted = Buffer.concat([
      decipher.update(cipherText),
      decipher.final(),
    ])

    return decrypted.toString('utf-8')
  }

  /**
   * Checks if a string is an encrypted vault payload
   */
  static isEncrypted(value: string): boolean {
    return typeof value === 'string' && value.startsWith('enc:v1:')
  }

  /**
   * Safely masks a secret for UI display (e.g. "EAAB••••••••4x9z")
   */
  static mask(secret: string, tenantId?: string): string {
    if (!secret) return ''
    const plain = this.isEncrypted(secret) ? this.decrypt(secret, tenantId) : secret
    if (plain.length <= 8) return '••••••••'
    return `${plain.slice(0, 4)}••••••••${plain.slice(-4)}`
  }
}
