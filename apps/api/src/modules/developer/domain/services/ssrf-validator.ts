export function isPrivateOrLoopbackHost(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl)

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return true
    }

    const rawHostname = parsed.hostname.toLowerCase().trim()
    const hostname = rawHostname.replaceAll('[', '').replaceAll(']', '')

    // Block localhost, loopbacks, and zero addresses
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname === '0' ||
      rawHostname === '[::1]'
    ) {
      return true
    }

    // Block Cloud metadata services
    if (
      hostname === '169.254.169.254' ||
      hostname === 'metadata.google.internal' ||
      hostname === 'instance-data'
    ) {
      return true
    }

    // Block RFC 1918 Private IPv4 ranges
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true
    if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true
    if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true

    return false
  } catch {
    return true
  }
}

export function sanitizeWebhookResponse(responseBody: string): string {
  if (!responseBody) return ''
  // 1. Remove control and non-printable characters
  // eslint-disable-next-line no-control-regex -- Strip control characters from untrusted webhook response text.
  let sanitized = responseBody.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
  // 2. Redact sensitive patterns (tokens, secrets, passwords)
  sanitized = sanitized.replace(/(bearer|token|secret|password|key)\s*[:=]\s*["']?[^"'\s,]+/gi, '$1: [REDACTED]')
  // 3. Cap length to 500 characters
  if (sanitized.length > 500) {
    return sanitized.slice(0, 500) + '... [TRUNCATED]'
  }
  return sanitized
}
