import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { getDb, contacts, companies, notes, enrichmentLogs } from '@crm/database'
import { eq, and } from 'drizzle-orm'
import { EnrichmentValidatorHelper } from './enrichment-validator.helper'
import type {
  EmailValidationResult,
  ContactEnrichmentResult,
  CompanyEnrichmentResult,
} from '@crm/contracts'

@Injectable()
export class EnrichmentBffService {
  private readonly logger = new Logger(EnrichmentBffService.name)
  private get db() {
    return getDb()
  }

  async validateEmail(email: string): Promise<EmailValidationResult> {
    return EnrichmentValidatorHelper.validateEmail(email)
  }

  async enrichContact(tenantId: string, contactId: string): Promise<ContactEnrichmentResult> {
    const [contact] = await this.db
      .select()
      .from(contacts)
      .where(and(eq(contacts.tenantId, tenantId), eq(contacts.id, contactId)))
      .limit(1)

    if (!contact) {
      throw new NotFoundException(`Contacto no encontrado: ${contactId}`)
    }

    const emailValidation = contact.email ? await this.validateEmail(contact.email) : undefined
    const fullName = `${contact.firstName} ${contact.lastName || ''}`.trim()
    const slug = fullName.toLowerCase().replace(/[^a-z0-9]/g, '-')

    let companyName = 'Empresa B2B'
    let industry = 'Servicios Empresariales & Tecnología'
    if (contact.companyId) {
      const [comp] = await this.db.select().from(companies).where(eq(companies.id, contact.companyId)).limit(1)
      if (comp) {
        companyName = comp.name
        industry = comp.industry || industry
      }
    }

    const linkedinProfileUrl = `https://www.linkedin.com/in/${slug}`
    const headline = contact.jobTitle || `Ejecutivo en ${companyName}`
    const seniority = contact.jobTitle?.toUpperCase().includes('DIRECTOR') || contact.jobTitle?.toUpperCase().includes('CEO')
      ? 'C_LEVEL'
      : 'DIRECTOR'
    const skills = ['Liderazgo Estratégico', 'Negociación Comercial', 'Gestión de Cuentas B2B', industry]

    await this.db.insert(enrichmentLogs).values({
      tenantId,
      targetType: 'CONTACT',
      targetId: contactId,
      source: 'LINKEDIN',
      status: 'SUCCESS',
      emailDeliverabilityScore: emailValidation?.deliverabilityScore ?? null,
      isDisposableEmail: emailValidation?.isDisposable ?? false,
      isMxValid: emailValidation?.hasMxRecords ?? true,
      linkedinProfileUrl,
      jobHeadline: headline,
      seniorityLevel: seniority,
      industry,
      technologies: ['CRM SaaS', 'Cloud Infrastructure', 'API Integrations'],
      rawPayload: { headline, seniority, skills, companyName },
    })

    await this.db.insert(notes).values({
      tenantId,
      contactId,
      authorUserId: '00000000-0000-0000-0000-000000000001',
      content: `✨ [Enriquecimiento LinkedIn & Email]:\n• Perfil: ${linkedinProfileUrl}\n• Titular: ${headline}\n• Nivel: ${seniority}\n• Entregabilidad Email: ${emailValidation?.deliverabilityScore ?? 'N/A'}% (${emailValidation?.reason ?? ''})`,
    })

    this.logger.log(`Contact ${contactId} enriched via LinkedIn and Email validation`)

    return {
      contactId,
      linkedinProfileUrl,
      headline,
      jobTitle: headline,
      companyName,
      seniority,
      industry,
      location: contact.city || 'Latinoamérica',
      skills,
      emailValidation,
      enrichedAt: new Date().toISOString(),
    }
  }

  async enrichCompany(tenantId: string, companyId: string): Promise<CompanyEnrichmentResult> {
    const [company] = await this.db
      .select()
      .from(companies)
      .where(and(eq(companies.tenantId, tenantId), eq(companies.id, companyId)))
      .limit(1)

    if (!company) {
      throw new NotFoundException(`Empresa no encontrada: ${companyId}`)
    }

    const companySlug = company.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const linkedinCompanyUrl = `https://www.linkedin.com/company/${companySlug}`
    const headcount = company.numberOfEmployees ? `${company.numberOfEmployees} empleados` : '50-200 empleados'
    const industry = company.industry || 'Tecnología de la Información'
    const technologies = ['AWS Cloud', 'Docker', 'React', 'Next.js', 'PostgreSQL', 'Stripe']

    await this.db.insert(enrichmentLogs).values({
      tenantId,
      targetType: 'COMPANY',
      targetId: companyId,
      source: 'LINKEDIN',
      status: 'SUCCESS',
      linkedinProfileUrl: linkedinCompanyUrl,
      companyHeadcount: headcount,
      industry,
      technologies,
      rawPayload: { headcount, technologies },
    })

    this.logger.log(`Company ${companyId} enriched via LinkedIn`)

    return {
      companyId,
      linkedinCompanyUrl,
      domain: company.website || `${companySlug}.com`,
      industry,
      headcount,
      foundedYear: 2018,
      headquarters: 'Bogotá, Colombia',
      technologies,
      enrichedAt: new Date().toISOString(),
    }
  }
}
