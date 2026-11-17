import { isPrivateOrLoopbackHost, sanitizeWebhookResponse } from '../../domain/services/ssrf-validator'

describe('SSRF Validator & Webhook Sanitizer', () => {
  describe('isPrivateOrLoopbackHost', () => {
    it('blocks localhost and loopback IP addresses', () => {
      expect(isPrivateOrLoopbackHost('http://localhost/api')).toBe(true)
      expect(isPrivateOrLoopbackHost('http://127.0.0.1:3000/webhook')).toBe(true)
      expect(isPrivateOrLoopbackHost('http://127.0.0.2')).toBe(true)
      expect(isPrivateOrLoopbackHost('http://[::1]/webhook')).toBe(true)
      expect(isPrivateOrLoopbackHost('http://0.0.0.0:80')).toBe(true)
    })

    it('blocks cloud metadata endpoints', () => {
      expect(isPrivateOrLoopbackHost('http://169.254.169.254/latest/meta-data/')).toBe(true)
      expect(isPrivateOrLoopbackHost('http://metadata.google.internal/computeMetadata/v1/')).toBe(true)
    })

    it('blocks private RFC 1918 subnet ranges', () => {
      expect(isPrivateOrLoopbackHost('http://10.0.0.1/webhook')).toBe(true)
      expect(isPrivateOrLoopbackHost('http://172.16.0.5/api')).toBe(true)
      expect(isPrivateOrLoopbackHost('http://172.31.255.255/api')).toBe(true)
      expect(isPrivateOrLoopbackHost('http://192.168.1.1/webhook')).toBe(true)
    })

    it('allows valid public external URLs', () => {
      expect(isPrivateOrLoopbackHost('https://hooks.slack.com/services/T00/B00/X00')).toBe(false)
      expect(isPrivateOrLoopbackHost('https://api.zapier.com/v1/hook')).toBe(false)
      expect(isPrivateOrLoopbackHost('https://example.com/webhook')).toBe(false)
    })
  })

  describe('sanitizeWebhookResponse', () => {
    it('truncates oversized response bodies to 500 chars', () => {
      const longString = 'A'.repeat(1000)
      const sanitized = sanitizeWebhookResponse(longString)
      expect(sanitized.length).toBeLessThan(600)
      expect(sanitized).toContain('[TRUNCATED]')
    })

    it('redacts sensitive tokens, keys, and passwords', () => {
      const responseWithSecrets = 'Error occurred. bearer: secret-token-xyz123, password: supersecretpassword'
      const sanitized = sanitizeWebhookResponse(responseWithSecrets)
      expect(sanitized).not.toContain('secret-token-xyz123')
      expect(sanitized).not.toContain('supersecretpassword')
      expect(sanitized).toContain('[REDACTED]')
    })
  })
})
