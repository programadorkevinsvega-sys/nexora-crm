import type { EmailValidationResult } from '@crm/contracts'
import * as dns from 'dns/promises'

export class EnrichmentValidatorHelper {
  private static readonly DISPOSABLE_DOMAINS = new Set([
    'mailinator.com',
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'yopmail.com',
    'trashmail.com',
    'getairmail.com',
    'sharklasers.com',
    'dispostable.com',
    'throwawaymail.com',
  ])

  private static readonly FREE_MAIL_DOMAINS = new Set([
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'live.com',
    'icloud.com',
    'proton.me',
    'protonmail.com',
  ])

  static async validateEmail(email: string): Promise<EmailValidationResult> {
    const cleanEmail = (email || '').trim().toLowerCase()
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (!emailRegex.test(cleanEmail)) {
      return {
        email: cleanEmail,
        isValid: false,
        deliverabilityScore: 0,
        isDisposable: false,
        isFreeMail: false,
        hasMxRecords: false,
        domain: cleanEmail.split('@')[1] || '',
        reason: 'Sintaxis de email inválida.',
      }
    }

    const domain = cleanEmail.split('@')[1] || ''
    const isDisposable = this.DISPOSABLE_DOMAINS.has(domain)
    const isFreeMail = this.FREE_MAIL_DOMAINS.has(domain)

    let hasMxRecords = false
    try {
      const mxRecords = await dns.resolveMx(domain)
      hasMxRecords = Array.isArray(mxRecords) && mxRecords.length > 0
    } catch {
      hasMxRecords = false
    }

    let deliverabilityScore = 95
    let reason = 'Email corporativo válido y verificable con registros MX activos.'

    if (isDisposable) {
      deliverabilityScore = 10
      reason = 'Dominio de correo temporal/desechable detectado.'
    } else if (!hasMxRecords) {
      deliverabilityScore = 20
      reason = 'Dominio no tiene servidores de correo MX válidos configurados.'
    } else if (isFreeMail) {
      deliverabilityScore = 80
      reason = 'Proveedor de correo gratuito público (B2C).'
    }

    return {
      email: cleanEmail,
      isValid: !isDisposable && hasMxRecords,
      deliverabilityScore,
      isDisposable,
      isFreeMail,
      hasMxRecords,
      domain,
      reason,
    }
  }
}
