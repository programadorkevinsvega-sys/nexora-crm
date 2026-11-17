import { Injectable, NotFoundException } from '@nestjs/common'
import { WebFormsRepository } from '../../domain/repositories/web-forms.repository'
import { FormField } from '../../domain/entities/web-form.entity'

export interface SubmitWebFormInput {
  idOrSlug: string
  formData: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

export interface SubmitWebFormOutput {
  success: boolean
  message: string
  redirectUrl: string | null
  formId: string
  tenantId: string
  contactPayload: {
    tenantId: string
    firstName: string
    lastName: string | null
    email: string | null
    phone: string | null
    jobTitle: string | null
    city: string | null
    leadSource: string
    leadStatus: string
    metadata: Record<string, any>
  }
}

@Injectable()
export class SubmitWebFormUseCase {
  constructor(private readonly repo: WebFormsRepository) {}

  async execute(input: SubmitWebFormInput): Promise<SubmitWebFormOutput> {
    const form = await this.repo.findBySlugOrId(input.idOrSlug)
    if (!form) throw new NotFoundException(`Form ${input.idOrSlug} not found or inactive`)

    const fields = (form.fields as FormField[]) || []
    const contactPayload: any = {
      tenantId: form.tenantId,
      leadSource: form.leadSource || 'Formulario Web',
      leadStatus: form.defaultLeadStatus || 'NEW',
      metadata: { formId: form.id, formSlug: form.slug, rawSubmission: input.formData },
    }

    for (const field of fields) {
      const val = input.formData[field.id] ?? input.formData[field.label]
      if (val !== undefined && val !== null) {
        if (field.mappedContactField === 'firstName') contactPayload.firstName = String(val)
        else if (field.mappedContactField === 'lastName') contactPayload.lastName = String(val)
        else if (field.mappedContactField === 'email') contactPayload.email = String(val).trim()
        else if (field.mappedContactField === 'phone') contactPayload.phone = String(val).trim()
        else if (field.mappedContactField === 'jobTitle') contactPayload.jobTitle = String(val)
        else if (field.mappedContactField === 'city') contactPayload.city = String(val)
        else if (field.mappedContactField === 'notes') contactPayload.metadata.notes = String(val)
      }
    }

    if (!contactPayload.firstName) {
      contactPayload.firstName = contactPayload.email ? contactPayload.email.split('@')[0] : 'Lead Inbound'
    }

    const submissionId = crypto.randomUUID()
    await this.repo.saveSubmission({
      id: submissionId,
      tenantId: form.tenantId,
      formId: form.id,
      contactId: null,
      payloadJson: input.formData,
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
      submittedAt: new Date(),
    })

    await this.repo.incrementSubmissionsCount(form.id)

    return {
      success: true,
      message: form.successMessage,
      redirectUrl: form.redirectUrl || null,
      formId: form.id,
      tenantId: form.tenantId,
      contactPayload,
    }
  }
}
