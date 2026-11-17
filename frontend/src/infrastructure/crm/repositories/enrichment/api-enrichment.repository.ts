import type {
  EmailValidationResult,
  ContactEnrichmentResult,
  CompanyEnrichmentResult,
} from '@crm/contracts'

export class ApiEnrichmentRepository {
  static async validateEmail(email: string): Promise<EmailValidationResult> {
    const res = await fetch('/api/enrichment/email/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email }),
    })
    if (!res.ok) throw new Error('Error al validar el correo')
    return res.json()
  }

  static async enrichContact(contactId: string): Promise<ContactEnrichmentResult> {
    const res = await fetch(`/api/enrichment/contact/${contactId}`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al enriquecer contacto')
    return res.json()
  }

  static async enrichCompany(companyId: string): Promise<CompanyEnrichmentResult> {
    const res = await fetch(`/api/enrichment/company/${companyId}`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Error al enriquecer empresa')
    return res.json()
  }
}
